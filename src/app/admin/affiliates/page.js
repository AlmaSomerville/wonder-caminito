import { prisma } from "@/lib/db";
import { requireAdmin } from "../lib";
import { AdminNav, ActionButton } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminAffiliates() {
  requireAdmin();
  const affiliates = await prisma.affiliate.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { bookings: { where: { status: { not: "CANCELLED" } }, select: { adults: true, children: true, totalEUR: true } } },
  });
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="tracking-tight text-[26px] font-bold">Partners</h1>
        <p className="text-[13px] text-rock/70">Approve a partner and their tracking link starts working. Commission terms are whatever you agree with each one.</p>
        <div className="mt-5 space-y-3">
          {affiliates.length === 0 && <p className="text-[14px] opacity-60">No applications yet. Send hotels to {site}/affiliates</p>}
          {affiliates.map((a) => {
            const n = a.bookings.length;
            const pax = a.bookings.reduce((x, b) => x + b.adults + b.children, 0);
            const eur = a.bookings.reduce((x, b) => x + b.totalEUR, 0);
            return (
              <div key={a.id} className={`card p-4 ${!a.approved ? "border-terracotta/40 bg-[#FFF1EB]" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">
                      {a.companyName}
                      <span className="ml-2 rounded bg-sand px-2 py-0.5 font-mono text-[11px]">{a.code}</span>
                    </p>
                    <p className="text-[14px] text-rock/80">{a.contactName} · {a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
                    <p className="text-[14px] text-rock/80">NIF/CIF: {a.taxId}{a.city ? ` · ${a.city}` : ""}{a.iban ? ` · IBAN ✓` : ""}</p>
                    {a.notes && <p className="mt-1 rounded-xl bg-sand px-3 py-1.5 text-[13px]">📝 {a.notes}</p>}
                    <p className="mt-1 text-[12px] font-bold text-turquoise">{n} bookings · {pax} guests · €{eur.toFixed(0)} booked value</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${a.approved ? "bg-turquoise text-white" : "bg-terracotta text-white"}`}>
                    {a.approved ? "ACTIVE" : "PENDING"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ActionButton
                    url="/api/admin/affiliates"
                    body={{ id: a.id, approved: !a.approved }}
                    className={a.approved ? "btn btn-ghost !py-2 text-[13px]" : "btn btn-primary !py-2 text-[13px]"}
                  >
                    {a.approved ? "Deactivate" : "Approve"}
                  </ActionButton>
                  {a.approved && (
                    <span className="self-center text-[13px] text-rock/70">Link: {site}/?ref={a.code}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
