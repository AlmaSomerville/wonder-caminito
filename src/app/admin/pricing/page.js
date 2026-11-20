import { getSettings } from "@/lib/settings";
import { requireAdmin } from "../lib";
import { AdminNav } from "../ui";
import { PricingForm } from "./form";

export const dynamic = "force-dynamic";

export default async function AdminPricing() {
  requireAdmin();
  const s = await getSettings();
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="text-[26px] font-extrabold tracking-tight">Precios y reglas</h1>
        <p className="text-[15px] text-rock/80">Los cambios se aplican al momento a las reservas nuevas (y al precio de la web). Las reservas existentes mantienen su precio.</p>
        <PricingForm initial={JSON.parse(JSON.stringify(s))} />
      </main>
    </>
  );
}
