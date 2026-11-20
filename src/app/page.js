import Landing from "./landing";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

// Rebuilt at most every 5 minutes; admin changes (team, products, photos, price) also refresh it instantly.
export const revalidate = 300;

async function safe(fn, fallback) {
  try { return await fn(); } catch { return fallback; } // DB not ready yet → page still renders
}

export default async function Page() {
  const [settings, guides, products, photos] = await Promise.all([
    safe(() => getSettings(), null),
    safe(() => prisma.guide.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] }), []),
    safe(() => prisma.product.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] }), []),
    safe(() => prisma.photo.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "desc" }], take: 12 }), []),
  ]);
  return (
    <Landing
      price={settings?.priceAdult ?? 52}
      guides={JSON.parse(JSON.stringify(guides))}
      products={JSON.parse(JSON.stringify(products))}
      photos={JSON.parse(JSON.stringify(photos))}
    />
  );
}
