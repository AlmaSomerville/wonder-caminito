import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { guard } from "../_guard";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const g = guard(); if (g) return g;
  const { url, caption } = await req.json().catch(() => ({}));
  if (!url || !/^https:\/\//.test(url)) return NextResponse.json({ message: "Foto no válida." }, { status: 400 });
  const first = await prisma.photo.findFirst({ orderBy: { sort: "asc" } });
  // New photos go to the end of the gallery
  const last = await prisma.photo.findFirst({ orderBy: { sort: "desc" } });
  await prisma.photo.create({ data: { url, caption: String(caption || "").slice(0, 60) || null, sort: last ? last.sort + 1 : 0 } });
  revalidatePath("/");
  return NextResponse.json({ ok: true, first: !first });
}

export async function PATCH(req) {
  const g = guard(); if (g) return g;
  const { id, caption, move } = await req.json().catch(() => ({}));
  if (caption !== undefined) {
    await prisma.photo.update({ where: { id }, data: { caption: String(caption || "").slice(0, 60) || null } });
  }
  if (move === "up" || move === "down") {
    const all = await prisma.photo.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "desc" }] });
    const i = all.findIndex((p) => p.id === id);
    const j = move === "up" ? i - 1 : i + 1;
    if (i >= 0 && j >= 0 && j < all.length) {
      [all[i], all[j]] = [all[j], all[i]];
      await prisma.$transaction(all.map((p, idx) => prisma.photo.update({ where: { id: p.id }, data: { sort: idx } })));
    }
  }
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const g = guard(); if (g) return g;
  const { id } = await req.json().catch(() => ({}));
  const photo = await prisma.photo.delete({ where: { id } });
  try { await del(photo.url); } catch {} // file already gone is fine
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
