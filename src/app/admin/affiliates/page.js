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
        <h1 className="text-[26px] font-extrabold tracking-tight">Colaboradores</h1>
        <p className="text-[15px] text-rock/80">Aprueba a un colaborador y su enlace de seguimiento empieza a funcionar. La comisión es la que acuerdes con cada uno.</p>
        <div className="mt-5 space-y-3">
          {affiliates.length === 0 && <p className="text-[15px] text-rock/80">Aún no hay solicitudes. Envía a los hoteles a {site}/affiliates</p>}
          {affiliates.map((a) => {
            const n = a.bookings.length;
            const pax = a.bookings.reduce((x, b) => x + b.adults + b.children, 0);
            const eur = a.bookings.reduce((x, b) => x + b.totalEUR, 0);
            return (
              <div key={a.id} className={`card p-4 ${!a.approved ? "border-terracotta/40 bg-peach" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">
                      {a.companyName}
                      <span className="ml-2 rounded bg-sand px-2 py-0.5 text-[12px]">{a.code}</span>
                    </p>
                    <p className="text-[14px] text-rock/80">{a.contactName} · {a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
                    <p className="text-[14px] text-rock/80">NIF/CIF: {a.taxId}{a.city ? ` · ${a.city}` : ""}{a.iban ? " · IBAN ✓" : ""}</p>
                    {a.notes && <p className="mt-1 rounded-xl bg-sand px-3 py-1.5 text-[14px]">📝 {a.notes}</p>}
                    <p className="mt-1 text-[13px] font-bold text-[#2b8a80]">{n} reservas · {pax} personas · {eur.toFixed(0)} € reservados</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${a.approved ? "bg-turquoise text-white" : "bg-terracotta text-white"}`}>
                    {a.approved ? "ACTIVO" : "PENDIENTE"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ActionButton
                    url="/api/admin/affiliates"
                    body={{ id: a.id, approved: !a.approved }}
                    className={a.approved ? "btn btn-ghost !py-2 text-[14px]" : "btn btn-primary !py-2 text-[14px]"}
                  >
                    {a.approved ? "Desactivar" : "Aprobar"}
                  </ActionButton>
                  {a.approved && <span className="text-[13px] text-rock/75">Enlace: {site}/a/{a.code}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
