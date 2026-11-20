import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPartnerSession } from "@/lib/session";
import { LogoutButton, CopyLink } from "./ui";

export const dynamic = "force-dynamic";

export default async function PartnerDashboard() {
  const session = getPartnerSession();
  if (!session) redirect("/partner/login");
  const aff = await prisma.affiliate.findUnique({ where: { id: session.id } });
  if (!aff || !aff.approved) redirect("/partner/login");

  const bookings = await prisma.booking.findMany({
    where: { affiliateId: aff.id },
    include: { slot: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // monthly totals
  const months = {};
  for (const b of bookings) {
    const key = b.createdAt.toISOString().slice(0, 7);
    months[key] ??= { bookings: 0, pax: 0, eur: 0 };
    if (b.status !== "CANCELLED") {
      months[key].bookings++;
      months[key].pax += b.adults + b.children;
      months[key].eur += b.totalEUR;
    }
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://wondercaminito.com";
  const link = `${site}/?ref=${aff.code}`;

  const badge = {
    PENDING: "bg-peach text-terracotta",
    CONFIRMED: "bg-turquoise/15 text-turquoise",
    CANCELLED: "bg-black/5 opacity-50",
    COMPLETED: "bg-rock text-sand",
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide opacity-50">Wonder partner</p>
          <h1 className="font-serif text-[30px] font-bold leading-tight">{aff.companyName}</h1>
        </div>
        <LogoutButton />
      </div>

      <section className="card mt-6 p-5">
        <p className="label !mb-2">Your tracking link — share it anywhere (QR, email, reception desk)</p>
        <CopyLink link={link} />
        <p className="mt-2 text-[12px] opacity-60">
          Guests who open it are tagged to you for 30 days — even if they book later. Code: <b>{aff.code}</b>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-[22px] font-bold">Monthly summary</h2>
        {Object.keys(months).length === 0 ? (
          <p className="mt-2 text-[14px] opacity-60">No bookings yet. Share your link to get started.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {Object.entries(months).map(([m, v]) => (
              <div key={m} className="card p-4">
                <p className="text-[12px] font-bold opacity-50">{m}</p>
                <p className="font-serif text-[26px] font-extrabold">{v.bookings}</p>
                <p className="text-[12px] opacity-70">{v.pax} guests · €{v.eur.toFixed(0)} booked value</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-[12px] opacity-60">
          Commission is settled directly with Nati per your agreement (your invoice to us, or ours to you).
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-[22px] font-bold">Your bookings</h2>
        <div className="mt-3 space-y-2">
          {bookings.length === 0 && <p className="text-[14px] opacity-60">Nothing yet.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="card flex flex-wrap items-center justify-between gap-2 p-4 text-[14px]">
              <div>
                <p className="font-bold">{b.slot.date} · {b.slot.time} — {b.name}</p>
                <p className="text-[12px] opacity-60">{b.adults + b.children} guests · €{b.totalEUR} · {b.ref}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${badge[b.status]}`}>{b.status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
