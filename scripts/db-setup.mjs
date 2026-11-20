// Runs on every Vercel build, before the site is built.
// 1) Creates/updates the database tables to match prisma/schema.prisma.
//    Safe: if a change would delete data, Prisma refuses, the build stops, and the live site stays as it was.
// 2) On the very first deploy only (empty database), adds starter data: settings + 30 days of 9:00 slots.
import { execSync } from "child_process";

const url =
  process.env.DATABASE_URL_UNPOOLED ||          // Neon direct connection (best for schema changes)
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
const fresh = !(await prisma.settings.findUnique({ where: { id: 1 } }));
await prisma.$disconnect();

if (fresh) {
  console.log("[db-setup] New database: adding starter data…");
  execSync("node prisma/seed.mjs", { stdio: "inherit", env });
} else {
  console.log("[db-setup] Database already set up.");
}
