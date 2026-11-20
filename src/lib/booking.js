import { prisma } from "./db";
import { getSettings } from "./settings";

export function bookingRef() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `WDR-${s}`;
}

// Slot start as a Date, treated as Europe/Madrid wall time.
export function slotStart(slot) {
  // Madrid is UTC+1 (winter) / UTC+2 (summer). For a booking cutoff a ±1h
  // approximation is fine; we use UTC+1 to stay on the safe (earlier) side.
  return new Date(`${slot.date}T${slot.time}:00+01:00`);
}

export async function activeProducts() {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    select: { id: true, nameEn: true, nameEs: true, descEn: true, descEs: true, price: true, sizes: true, photoUrl: true },
  });
}

// extras: [{ id, qty, size }] from the booking form → priced lines from the database (client prices are never trusted)
export async function priceExtras(extras) {
  if (!Array.isArray(extras) || extras.length === 0) return { lines: [], total: 0 };
  const products = await activeProducts();
  const lines = [];
  for (const e of extras.slice(0, 10)) {
    const p = products.find((x) => x.id === e?.id);
    const qty = Math.min(20, Math.max(0, parseInt(e?.qty, 10) || 0));
    if (!p || qty === 0) continue;
    const sizes = (p.sizes || "").split(",").map((z) => z.trim()).filter(Boolean);
    const size = sizes.length ? (sizes.includes(e.size) ? e.size : sizes[0]) : null;
    lines.push({ id: p.id, name: p.nameEs, size, qty, price: p.price });
  }
  return { lines, total: Math.round(lines.reduce((n, l) => n + l.qty * l.price, 0) * 100) / 100 };
}

export function paxOf(b) {
  return b.adults + b.children;
}

// Seats already taken on a slot (cancelled bookings don't count)
export async function seatsTaken(slotId) {
  const rows = await prisma.booking.findMany({
    where: { slotId, status: { not: "CANCELLED" } },
    select: { adults: true, children: true },
  });
  return rows.reduce((n, b) => n + paxOf(b), 0);
}

export async function availableSlots() {
  const settings = await getSettings();
  const today = new Date().toISOString().slice(0, 10);
  const slots = await prisma.slot.findMany({
    where: { closed: false, date: { gte: today } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    include: { bookings: { where: { status: { not: "CANCELLED" } }, select: { adults: true, children: true } } },
  });
  const now = Date.now();
  return slots
    .map((s) => {
      const taken = s.bookings.reduce((n, b) => n + paxOf(b), 0);
      return {
        id: s.id,
        date: s.date,
        time: s.time,
        note: s.note,
        left: Math.max(0, s.capacity - taken),
        start: slotStart(s).getTime(),
      };
    })
    .filter((s) => {
      if (s.left <= 0) return false;
      if (!settings.allowSameDay && s.date === today) return false;
      return s.start - now > settings.cutoffHours * 3600 * 1000;
    })
    .map(({ start, ...rest }) => rest);
}

// Validates and prices a booking request. Throws { message } on rule violations.
export async function validateAndPrice({ slotId, adults, children, offerCode, email, extras }) {
  const settings = await getSettings();
  adults = parseInt(adults, 10) || 0;
  children = parseInt(children, 10) || 0;
  const pax = adults + children;

  if (adults < 1) throw { message: "At least one adult is required." };
  if (pax < settings.minPerBooking || pax > settings.maxPerBooking)
    throw { message: `Group size must be between ${settings.minPerBooking} and ${settings.maxPerBooking}.` };

  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot || slot.closed) throw { message: "That date is no longer available." };

  const today = new Date().toISOString().slice(0, 10);
  if (slot.date < today) throw { message: "That date is in the past." };
  if (!settings.allowSameDay && slot.date === today)
    throw { message: "Same-day booking is closed. Message us on WhatsApp — we can sometimes help." };
  if (slotStart(slot).getTime() - Date.now() < settings.cutoffHours * 3600 * 1000)
    throw { message: "Online booking for this slot has closed. Message us on WhatsApp." };

  const taken = await seatsTaken(slotId);
  if (taken + pax > slot.capacity)
    throw { message: `Only ${Math.max(0, slot.capacity - taken)} places left on that date.` };

  if (settings.oneBookingPerEmailPerDay && email) {
    const dup = await prisma.booking.findFirst({
      where: { email: email.toLowerCase(), status: { not: "CANCELLED" }, slot: { date: slot.date } },
    });
    if (dup) throw { message: "You already have a booking for that date. Check your email, or message us on WhatsApp to change it." };
  }

  let total = adults * settings.priceAdult + children * settings.priceChild;
  let appliedOffer = null;
  if (offerCode) {
    const offer = await prisma.offer.findUnique({ where: { code: offerCode.trim().toUpperCase() } });
    const now = new Date();
    const live =
      offer && offer.active &&
      (!offer.startsAt || offer.startsAt <= now) &&
      (!offer.endsAt || offer.endsAt >= now);
    if (live && offer.discountPct > 0) {
      total = Math.round(total * (1 - offer.discountPct / 100) * 100) / 100;
      appliedOffer = offer.code;
    }
  }

  // Offer discounts apply to the tour only, not to add-on products
  const tourTotal = total;
  const ex = await priceExtras(extras);
  total = Math.round((tourTotal + ex.total) * 100) / 100;

  return { slot, adults, children, total, tourTotal, extrasLines: ex.lines, extrasTotal: ex.total, appliedOffer, settings };
}
