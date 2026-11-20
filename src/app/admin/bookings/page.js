import { prisma } from "@/lib/db";
import { requireAdmin } from "../lib";
import { AdminNav, ActionButton } from "../ui";
import { ESTADO, ESTADO_COLOR, fecha } from "../fmt";

export const dynamic = "force-dynamic";

function waMessage(b) {
  if (b.language === "es") {
    return b.status === "PENDING"
      ? `¡Hola ${b.name}! Te escribimos de Wonder Caminito: tu reserva ${b.ref} para el ${b.slot.date} a las ${b.slot.time} está CONFIRMADA ✔ Total ${b.totalEUR} €. ¡Nos vemos en el primer pase!`
      : `¡Hola ${b.name}! Te escribimos de Wonder Caminito sobre tu reserva ${b.ref} (${b.slot.date}).`;
  }
  return b.status === "PENDING"
    ? `Hi ${b.name}! Wonder Caminito here — your booking ${b.ref} for ${b.slot.date} at ${b.slot.time} is CONFIRMED ✔ Total €${b.totalEUR}. See you at the first slot!`
    : `Hi ${b.name}! Wonder Caminito here, about your booking ${b.ref} (${b.slot.date}).`;
}

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

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[26px] font-extrabold tracking-tight">Reservas</h1>
          <div className="flex gap-1 rounded-full bg-white p-1 text-[14px] font-bold">
            <a href="/admin/bookings" className={`rounded-full px-4 py-1.5 ${view === "upcoming" ? "bg-rock text-sand" : ""}`}>Próximas</a>
            <a href="/admin/bookings?view=past" className={`rounded-full px-4 py-1.5 ${view === "past" ? "bg-rock text-sand" : ""}`}>Pasadas</a>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {bookings.length === 0 && <p className="text-[15px] text-rock/80">No hay reservas aquí todavía.</p>}
          {bookings.map((b) => {
            const extras = Array.isArray(b.extras) ? b.extras : [];
            return (
              <div key={b.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">
                      <span className="capitalize">{fecha(b.slot.date)}</span> · {b.slot.time} — {b.name}
                      <span className="ml-2 rounded bg-sand px-2 py-0.5 text-[12px]">{b.ref}</span>
                    </p>
                    <p className="text-[14px] text-rock/80">
                      {b.adults} {b.adults === 1 ? "adulto" : "adultos"}{b.children ? ` + ${b.children} ${b.children === 1 ? "niño" : "niños"}` : ""} · {b.totalEUR} €
                      {b.offerCode && <span className="text-[#2b8a80]"> · {b.offerCode}</span>} · tour en {b.language === "es" ? "español" : "inglés"}
                    </p>
                    {extras.length > 0 && (
                      <p className="text-[14px] font-bold text-rock">
                        🛍️ {extras.map((l) => `${l.qty}× ${l.name}${l.size ? ` (${l.size})` : ""}`).join(", ")}
                      </p>
                    )}
                    <p className="text-[14px] text-rock/80">{b.phone} · {b.email}</p>
                    {b.notes && <p className="mt-1 rounded-xl bg-sand px-3 py-1.5 text-[14px]">📝 {b.notes}</p>}
                    <p className="mt-1 text-[13px] font-bold">
                      {b.affiliate
                        ? <span className="text-[#2b8a80]">vía {b.affiliate.companyName} ({b.affiliate.code})</span>
                        : <span className="text-rock/60">Directa</span>}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${ESTADO_COLOR[b.status]}`}>{ESTADO[b.status]}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.status === "PENDING" && (
                    <ActionButton url="/api/admin/bookings" body={{ id: b.id, status: "CONFIRMED" }} className="btn btn-primary !py-2 text-[14px]">
                      Confirmar
                    </ActionButton>
                  )}
                  {b.status === "CONFIRMED" && (
                    <ActionButton url="/api/admin/bookings" body={{ id: b.id, status: "COMPLETED" }} className="btn btn-dark !py-2 text-[14px]">
                      Marcar completada
                    </ActionButton>
                  )}
                  {b.status !== "CANCELLED" && (
                    <ActionButton url="/api/admin/bookings" body={{ id: b.id, status: "CANCELLED" }} confirmText="¿Cancelar esta reserva? Las plazas quedan libres.">
                      Cancelar
                    </ActionButton>
                  )}
                  <a className="btn btn-ghost !py-2 text-[14px]" href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waMessage(b))}`}>
                    WhatsApp al cliente
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
