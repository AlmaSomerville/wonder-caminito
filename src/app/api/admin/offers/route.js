import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard } from "../_guard";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const g = guard(); if (g) return g;
  const b = await req.json().catch(() => ({}));
  const code = String(b.code || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 20);
  if (!code || !b.titleEn || !b.titleEs) return NextResponse.json({ message: "Faltan el código y los dos títulos." }, { status: 400 });
  if (await prisma.offer.findUnique({ where: { code } })) return NextResponse.json({ message: "Ese código ya existe." }, { status: 400 });
  await prisma.offer.create({
    data: {
      code,
      titleEn: String(b.titleEn).slice(0, 140),
      titleEs: String(b.titleEs).slice(0, 140),
      bodyEn: String(b.bodyEn || "").slice(0, 300) || null,
      bodyEs: String(b.bodyEs || "").slice(0, 300) || null,
      discountPct: Math.min(100, Math.max(0, Number(b.discountPct) || 0)),
      showPopup: !!b.showPopup,
      startsAt: b.startsAt ? new Date(b.startsAt + "T00:00:00") : null,
      endsAt: b.endsAt ? new Date(b.endsAt + "T23:59:59") : null,
      active: false,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  const g = guard(); if (g) return g;
  const { id, active } = await req.json().catch(() => ({}));
  if (active === true) {
    // Only one live pop-up at a time keeps things simple for Nati
    await prisma.offer.updateMany({ data: { active: false } });
  }
  await prisma.offer.update({ where: { id }, data: { active: !!active } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const g = guard(); if (g) return g;
  const { id } = await req.json().catch(() => ({}));
  await prisma.offer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
