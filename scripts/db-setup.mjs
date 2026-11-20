// Runs on every Vercel build, before the site is built.
// 1) Creates/updates the database tables to match prisma/schema.prisma.
//    Safe: if a change would delete data, Prisma refuses, the build stops, and the live site stays as it was.
// 2) First deploy only (empty database): starter settings + 30 days of 9:00 slots.
// 3) One-time defaults per version: Nati as founder in the team, T-shirt product (hidden).
import { execSync } from "child_process";

const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!url) {
  console.log("[db-setup] No database configured, skipping.");
  process.exit(0);
}

const env = { ...process.env, DATABASE_URL: url };
console.log("[db-setup] Syncing database tables…");
execSync("npx prisma db push --skip-generate", { stdio: "inherit", env });

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient({ datasources: { db: { url } } });

if (!(await prisma.settings.findUnique({ where: { id: 1 } }))) {
  console.log("[db-setup] New database: adding starter data…");
  execSync("node prisma/seed.mjs", { stdio: "inherit", env });
}

const settings = await prisma.settings.findUnique({ where: { id: 1 } });
if ((settings?.defaultsVersion ?? 0) < 2) {
  console.log("[db-setup] Adding team + products defaults…");
  if ((await prisma.guide.count()) === 0) {
    await prisma.guide.create({
      data: {
        name: "Nati",
        role: "founder",
        languages: "es,en",
        bioEn: "Founder of Wonder. Lives a few minutes from the trail and knows every cave, every ibex family and every story of the gorge.",
        bioEs: "Fundadora de Wonder. Vive a pocos minutos del sendero y conoce cada cueva, cada familia de cabras y cada historia del desfiladero.",
        sort: 0,
      },
    });
  }
  if ((await prisma.product.count()) === 0) {
    await prisma.product.create({
      data: {
        nameEn: "Wonder T-shirt",
        nameEs: "Camiseta Wonder",
        descEn: "Organic cotton, gorge print, designed in Álora.",
        descEs: "Algodón orgánico, estampado del desfiladero, diseñada en Álora.",
        price: 20,
        sizes: "S,M,L,XL",
        active: false,
      },
    });
  }
  await prisma.settings.update({ where: { id: 1 }, data: { defaultsVersion: 2 } });
}

await prisma.$disconnect();
console.log("[db-setup] Done.");
