import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "./lib";
import { AdminNav } from "./ui";
import { fecha, mes } from "./fmt";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  requireAdmin();

  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);

  const [bookings, pendingCount, pendingPartners] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt: { gte: since } },
      include: { affiliate: { select: { code: true, companyName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.affiliate.count({ where: { approved: false } }),
  ]);

  const months = {};
  for (const b of bookings) {
    if (b.status === "CANCELLED") continue;
    const key = b.createdAt.toISOString().slice(0, 7);
    months[key] ??= { bookings: 0, pax: 0, eur: 0, sources: {} };
    const m = months[key];
    m.bookings++;
    m.pax += b.adults + b.children;
    m.eur += b.totalEUR;
    const src = b.affiliate ? b.affiliate.companyName : "Directa";
    m.sources[src] = (m.sources[src] || 0) + 1;
  }
  const monthKeys = Object.keys(months).sort().reverse();

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = await prisma.slot.findMany({
    where: { date: { gte: today }, closed: false },
    orderBy: [{ date: "asc" }],
    take: 6,
    include: { bookings: { where: { status: { not: "CANCELLED" } } } },
  });

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        {(pendingCount > 0 || pendingPartners > 0) && (
          <div className="mb-6 space-y-2">
            {pendingCount > 0 && (
              <Link href="/admin/bookings" className="block rounded-2xl bg-terracotta p-4 text-[15px] font-bold text-white">
                ⚡ {pendingCount} {pendingCount > 1 ? "reservas esperan" : "reserva espera"} tu confirmación →
              </Link>
            )}
            {pendingPartners > 0 && (
              <Link href="/admin/affiliates" className="block rounded-2xl bg-turquoise p-4 text-[15px] font-bold text-white">
                🤝 {pendingPartners} {pendingPartners > 1 ? "solicitudes" : "solicitud"} de colaborador por revisar →
              </Link>
            )}
          </div>
        )}

        <h1 className="text-[26px] font-extrabold tracking-tight">Próximos días</h1>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {upcoming.length === 0 && (
            <p className="text-[15px] text-rock/80">No hay fechas abiertas. <Link className="font-bold underline" href="/admin/availability">Abrir fechas →</Link></p>
          )}
          {upcoming.map((s) => {
            const pax = s.bookings.reduce((n, b) => n + b.adults + b.children, 0);
            return (
              <div key={s.id} className="card p-4">
                <p className="font-bold capitalize">{fecha(s.date)} · {s.time} {s.note && <span className="normal-case text-terracotta">· {s.note}</span>}</p>
                <p className="text-[14px] text-rock/80">{pax}/{s.capacity} personas · {s.bookings.length} {s.bookings.length === 1 ? "reserva" : "reservas"}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
                  <div className="h-full rounded-full bg-turquoise" style={{ width: `${Math.min(100, (pax / s.capacity) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mt-10 text-[26px] font-extrabold tracking-tight">Mes a mes</h2>
        <p className="text-[14px] text-rock/75">Reservas hechas cada mes (sin canceladas) y de dónde vienen.</p>
        <div className="mt-3 space-y-3">
          {monthKeys.length === 0 && <p className="text-[15px] text-rock/80">Aún no hay reservas — aparecerán aquí.</p>}
          {monthKeys.map((k) => {
            const m = months[k];
            return (
              <div key={k} className="card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[15px] font-extrabold">{mes(k)}</p>
                  <p className="text-[15px]"><b>{m.bookings}</b> reservas · <b>{m.pax}</b> personas · <b>{m.eur.toFixed(0)} €</b></p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(m.sources).sort((a, b) => b[1] - a[1]).map(([src, n]) => (
                    <span key={src} className={`rounded-full px-3 py-1 text-[13px] font-bold ${src === "Directa" ? "bg-rock text-sand" : "bg-turquoise/15 text-[#2b8a80]"}`}>
                      {src}: {n}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
