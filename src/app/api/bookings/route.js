import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { validateAndPrice, bookingRef } from "@/lib/booking";

export const dynamic = "force-dynamic";

function parseExtras(raw) {
  if (!raw) return [];
  try { const v = typeof raw === "string" ? JSON.parse(raw) : raw; return Array.isArray(v) ? v : []; } catch { return []; }
}

// GET ?quote=1 — live price preview for the booking form
export async function GET(req) {
  const u = new URL(req.url);
  try {
    const { total, appliedOffer } = await validateAndPrice({
      slotId: u.searchParams.get("slotId"),
      adults: u.searchParams.get("adults"),
      children: u.searchParams.get("children"),
      offerCode: u.searchParams.get("offer") || null,
      email: null, // duplicate check only on real submit
      extras: parseExtras(u.searchParams.get("extras")),
    });
    return NextResponse.json({ total, appliedOffer });
  } catch (e) {
    return NextResponse.json({ total: null, message: e.message }, { status: 200 });
  }
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ message: "Bad request" }, { status: 400 }); }

  const name = (body.name || "").trim().slice(0, 120);
  const email = (body.email || "").trim().toLowerCase().slice(0, 200);
  const phone = (body.phone || "").trim().slice(0, 40);
  if (!name || !email || !phone) return NextResponse.json({ message: "Name, email and WhatsApp are required." }, { status: 400 });

  try {
    const { slot, adults, children, total, appliedOffer, extrasLines } = await validateAndPrice({
      slotId: body.slotId, adults: body.adults, children: body.children,
      offerCode: body.offerCode, email, extras: parseExtras(body.extras),
    });

    // Affiliate credit: cookie set by the tracking link
    const refCode = cookies().get("wref")?.value;
    let affiliateId = null;
    if (refCode) {
      const aff = await prisma.affiliate.findUnique({ where: { code: refCode } });
      if (aff?.approved) affiliateId = aff.id;
    }

    const booking = await prisma.booking.create({
      data: {
        ref: bookingRef(),
        slotId: slot.id,
        name, email, phone,
        adults, children,
        language: body.language === "es" ? "es" : "en",
        notes: (body.notes || "").slice(0, 500) || null,
        totalEUR: total,
        offerCode: appliedOffer,
        extras: extrasLines.length ? extrasLines : undefined,
        affiliateId,
      },
    });

    return NextResponse.json({
      booking: {
        ref: booking.ref, name, date: slot.date, time: slot.time,
        adults, children, totalEUR: total, extras: extrasLines,
      },
    });
  } catch (e) {
    return NextResponse.json({ message: e.message || "Could not create booking." }, { status: 400 });
  }
}
