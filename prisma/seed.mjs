// Run once after creating the database:  npm run db:seed
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  // 30 days of 9:00 slots starting tomorrow (skip Mondays — Caminito is closed on Mondays)
  const start = new Date();
  start.setDate(start.getDate() + 1);
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() === 1) continue; // Monday closed
    await prisma.slot.upsert({
      where: { date_time: { date: fmt(d), time: "09:00" } },
      update: {},
      create: { date: fmt(d), time: "09:00", capacity: 10 },
    });
  }

  await prisma.offer.upsert({
    where: { code: "GOLDEN10" },
    update: {},
    create: {
      code: "GOLDEN10",
      titleEn: "December golden hour — 10% off",
      titleEs: "Hora dorada de diciembre — 10% dto.",
      bodyEn: "Book any 9AM first-slot tour this month with code GOLDEN10.",
      bodyEs: "Reserva cualquier primer pase de las 9:00 este mes con el código GOLDEN10.",
      discountPct: 10,
      active: false, // Nati switches it on from /admin/offers
      showPopup: true,
    },
  });

  console.log("Seeded: settings, 30 days of slots, 1 draft offer (inactive).");
}

main().finally(() => prisma.$disconnect());
