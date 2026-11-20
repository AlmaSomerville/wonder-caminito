import { prisma } from "@/lib/db";
import { requireAdmin } from "../lib";
import { AdminNav, ActionButton } from "../ui";
import { NewOfferForm } from "./form";

export const dynamic = "force-dynamic";

export default async function AdminOffers() {
  requireAdmin();
  const offers = await prisma.offer.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="tracking-tight text-[26px] font-bold">Pop-up offers</h1>
        <p className="text-[13px] text-rock/70">One active offer shows as a pop-up on the homepage. Its code also works in the booking form.</p>
        <NewOfferForm />
        <div className="mt-6 space-y-3">
          {offers.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">
                    {o.titleEn}
                    <span className="ml-2 rounded bg-sand px-2 py-0.5 font-mono text-[11px]">{o.code}</span>
                    {o.discountPct > 0 && <span className="ml-2 text-turquoise">−{o.discountPct}%</span>}
                  </p>
                  <p className="text-[14px] text-rock/80">{o.titleEs}</p>
                  <p className="text-[12px] opacity-50">
                    {o.showPopup ? "Pop-up on" : "Code only"} ·
                    {o.startsAt ? ` from ${o.startsAt.toISOString().slice(0, 10)}` : ""}
                    {o.endsAt ? ` until ${o.endsAt.toISOString().slice(0, 10)}` : " no end date"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${o.active ? "bg-turquoise text-white" : "bg-black/5 opacity-60"}`}>
                  {o.active ? "LIVE" : "OFF"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <ActionButton url="/api/admin/offers" body={{ id: o.id, active: !o.active }} className={o.active ? "btn btn-ghost !py-2 text-[13px]" : "btn btn-primary !py-2 text-[13px]"}>
                  {o.active ? "Turn off" : "Go live"}
                </ActionButton>
                <ActionButton url="/api/admin/offers" method="DELETE" body={{ id: o.id }} confirmText="Delete this offer?">
                  Delete
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
