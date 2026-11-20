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
        <h1 className="tracking-tight text-[26px] font-bold">Prices & rules</h1>
        <p className="text-[13px] text-rock/70">Changes apply immediately to new bookings. Existing bookings keep the price they booked at.</p>
        <PricingForm initial={JSON.parse(JSON.stringify(s))} />
      </main>
    </>
  );
}
