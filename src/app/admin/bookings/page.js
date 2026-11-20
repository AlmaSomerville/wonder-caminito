import { prisma } from "@/lib/db";
import { requireAdmin } from "../lib";
import { AdminNav, ActionButton } from "../ui";

export const dynamic = "force-dynamic";

const WA = process.env.NEXT_PUBLIC_WHATSAPP || "";

export default async function AdminBookings({ searchParams }) {
  requireAdmin();
  const view = searchParams?.view === "past" ? "past" : "upcoming";
  const today = new Date().toISOString().slice(0, 10);

  const bookings = await prisma.booking.findMany({
    where: { slot: view === "past" ? { date: { lt: today } } : { date: { gte: today } } },
    include: { slot: true, affiliate: { select: { companyName: true, code: true } } },
    orderBy: view === "past" ? [{ createdAt: "desc" }] : [{ slot: { date: "asc" } }, { createdAt: "asc" }],
    take: 300,
  });

  const badge = {
    PENDING: "bg-peach text-terracotta",
    CONFIRMED: "bg-turquoise/15 text-turquoise",
    CANCELLED: "bg-black/5 opacity-50",
    COMPLETED: "bg-rock text-sand",
  };

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-[26px] font-bold">Bookings</h1>
          <div className="flex gap-1 rounded-full bg-sand p-1 text-[13px] font-bold">
            <a href="/admin/bookings" className={`rounded-full px-4 py-1.5 ${view === "upcoming" ? "bg-rock text-sand" : ""}`}>Upcoming</a>
            <a href="/admin/bookings?view=past" className={`rounded-full px-4 py-1.5 ${view === "past" ? "bg-rock text-sand" : ""}`}>Past</a>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {bookings.length === 0 && <p className="text-[14px] opacity-60">Nothing here yet.</p>}
          {bookings.map((b) => {
            const waMsg = b.status === "PENDING"
              ? `Hola ${b.name}! Nati from Wonder here — your Caminito booking ${b.ref} for ${b.slot.date} at ${b.slot.time} is CONFIRMED ✔ Total €${b.totalEUR}. See you at the first slot!`
              : `Hola ${b.name}! Nati from Wonder about booking ${b.ref} (${b.slot.date}).`;
            return (
              <div key={b.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">
                      {b.slot.date} · {b.slot.time} — {b.name}
                      <span className="ml-2 rounded bg-sand px-2 py-0.5 font-mono text-[11px]">{b.ref}</span>
                    </p>
                    <p className="text-[13px] opacity-70">
                      {b.adults} adults{b.children ? ` + ${b.children} children` : ""} · €{b.totalEUR}
                      {b.offerCode && <span className="text-turquoise"> · {b.offerCode}</span>} · tour in {b.language.toUpperCase()}
                    </p>
                    <p className="text-[13px] opacity-70">{b.phone} · {b.email}</p>
                    {b.notes && <p className="mt-1 rounded-xl bg-sand px-3 py-1.5 text-[13px]">📝 {b.notes}</p>}
                    <p className="mt-1 text-[12px] font-bold">
                      {b.affiliate
                        ? <span className="text-turquoise">via {b.affiliate.companyName} ({b.affiliate.code})</span>
                        : <span className="opacity-50">Direct</span>}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${badge[b.status]}`}>{b.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.status === "PENDING" && (
                    <ActionButton url="/api/admin/bookings" body={{ id: b.id, status: "CONFIRMED" }} className="btn btn-primary !py-2 text-[13px]">
                      Confirm
                    </ActionButton>
                  )}
                  {b.status === "CONFIRMED" && view === "past" === false && (
                    <ActionButton url="/api/admin/bookings" body={{ id: b.id, status: "COMPLETED" }} className="btn btn-dark !py-2 text-[13px]">
                      Mark completed
                    </ActionButton>
                  )}
                  {b.status !== "CANCELLED" && (
                    <ActionButton url="/api/admin/bookings" body={{ id: b.id, status: "CANCELLED" }} confirmText="Cancel this booking? The seats are freed.">
                      Cancel
                    </ActionButton>
                  )}
                  <a className="btn btn-ghost !py-2 text-[13px]" href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waMsg)}`}>
                    WhatsApp them
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
