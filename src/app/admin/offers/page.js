import { prisma } from "@/lib/db";
import { requireAdmin } from "../lib";
import { AdminNav, ActionButton } from "../ui";
import { NewOfferForm } from "./form";

export const dynamic = "force-dynamic";

const d = (x) => x.toISOString().slice(0, 10);

export default async function AdminOffers() {
  requireAdmin();
  const offers = await prisma.offer.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="text-[26px] font-extrabold tracking-tight">Ofertas emergentes</h1>
        <p className="text-[15px] text-rock/80">La oferta activa aparece como ventana emergente en la web. Su código también funciona al reservar. Solo puede haber una activa a la vez.</p>
        <NewOfferForm />
        <div className="mt-6 space-y-3">
          {offers.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">
                    {o.titleEs}
                    <span className="ml-2 rounded bg-sand px-2 py-0.5 text-[12px]">{o.code}</span>
                    {o.discountPct > 0 && <span className="ml-2 text-[#2b8a80]">−{o.discountPct}%</span>}
                  </p>
                  <p className="text-[14px] text-rock/80">{o.titleEn}</p>
                  <p className="text-[13px] text-rock/70">
                    {o.showPopup ? "Con ventana emergente" : "Solo código"}
                    {o.startsAt ? ` · desde ${d(o.startsAt)}` : ""}
                    {o.endsAt ? ` · hasta ${d(o.endsAt)}` : " · sin fecha de fin"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${o.active ? "bg-turquoise text-white" : "bg-black/5 text-rock/70"}`}>
                  {o.active ? "ACTIVA" : "APAGADA"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <ActionButton url="/api/admin/offers" body={{ id: o.id, active: !o.active }} className={o.active ? "btn btn-ghost !py-2 text-[14px]" : "btn btn-primary !py-2 text-[14px]"}>
                  {o.active ? "Apagar" : "Activar"}
                </ActionButton>
                <ActionButton url="/api/admin/offers" method="DELETE" body={{ id: o.id }} confirmText="¿Borrar esta oferta?">
                  Borrar
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
