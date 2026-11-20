import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "./lib";
import { AdminNav } from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  requireAdmin();

  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);

  const [bookings, pendingCount, pendingPartners] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt: { gte: since } },
      include: { affiliate: { select: { code: true, companyName: true } }, slot: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.affiliate.count({ where: { approved: false } }),
  ]);

  // Monthly rollup + per-source
  const months = {};
  for (const b of bookings) {
    if (b.status === "CANCELLED") continue;
    const key = b.createdAt.toISOString().slice(0, 7);
    months[key] ??= { bookings: 0, pax: 0, eur: 0, sources: {} };
    const m = months[key];
    m.bookings++;
    m.pax += b.adults + b.children;
    m.eur += b.totalEUR;
    const src = b.affiliate ? b.affiliate.companyName : "Direct";
    m.sources[src] = (m.sources[src] || 0) + 1;
  }
  const monthKeys = Object.keys(months).sort().reverse();

  // Upcoming tour days at a glance
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = await prisma.slot.findMany({
    where: { date: { gte: today }, closed: false },
    orderBy: [{ date: "asc" }],
    take: 5,
    include: { bookings: { where: { status: { not: "CANCELLED" } } } },
  });

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        {(pendingCount > 0 || pendingPartners > 0) && (
          <div className="mb-6 space-y-2">
            {pendingCount > 0 && (
              <Link href="/admin/bookings" className="block rounded-2xl bg-terracotta p-4 text-[14px] font-bold text-white">
                ⚡ {pendingCount} booking{pendingCount > 1 ? "s" : ""} waiting for your confirmation →
              </Link>
            )}
            {pendingPartners > 0 && (
              <Link href="/admin/affiliates" className="block rounded-2xl bg-turquoise p-4 text-[14px] font-bold text-white">
                🤝 {pendingPartners} partner application{pendingPartners > 1 ? "s" : ""} to review →
              </Link>
            )}
          </div>
        )}

        <h1 className="tracking-tight text-[26px] font-bold">Next tour days</h1>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {upcoming.length === 0 && (
            <p className="text-[14px] opacity-60">No open dates. <Link className="font-bold underline" href="/admin/availability">Add some →</Link></p>
          )}
          {upcoming.map((s) => {
            const pax = s.bookings.reduce((n, b) => n + b.adults + b.children, 0);
            return (
              <div key={s.id} className="card p-4">
                <p className="font-bold">{s.date} · {s.time} {s.note && <span className="text-terracotta">· {s.note}</span>}</p>
                <p className="text-[14px] text-rock/80">{pax}/{s.capacity} guests · {s.bookings.length} bookings</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
                  <div className="h-full rounded-full bg-turquoise" style={{ width: `${Math.min(100, (pax / s.capacity) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mt-10 tracking-tight text-[26px] font-bold">Month by month</h2>
        <p className="text-[13px] text-rock/70">Bookings made that month (cancelled excluded), and where they came from.</p>
        <div className="mt-3 space-y-3">
          {monthKeys.length === 0 && <p className="text-[14px] opacity-60">No bookings yet — they'll appear here.</p>}
          {monthKeys.map((k) => {
            const m = months[k];
            return (
              <div key={k} className="card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[14px] font-extrabold">{k}</p>
                  <p className="text-[14px]"><b>{m.bookings}</b> bookings · <b>{m.pax}</b> guests · <b>€{m.eur.toFixed(0)}</b></p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(m.sources).sort((a, b) => b[1] - a[1]).map(([src, n]) => (
                    <span key={src} className={`rounded-full px-3 py-1 text-[12px] font-bold ${src === "Direct" ? "bg-rock text-sand" : "bg-turquoise/15 text-turquoise"}`}>
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
