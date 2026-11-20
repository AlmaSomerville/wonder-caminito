import Landing from "./landing";
import { getSettings } from "@/lib/settings";

// Re-checks Nati's price every 5 minutes, so changing it in /admin/pricing updates the homepage.
export const revalidate = 300;

export default async function Page() {
  let price = 52;
  try {
    price = (await getSettings()).priceAdult;
  } catch {
    // Database not reachable yet (e.g. first deploy before db:push) — show the default.
  }
  return <Landing price={price} />;
}
