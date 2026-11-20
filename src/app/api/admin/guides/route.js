import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { guard } from "../_guard";

export const dynamic = "force-dynamic";

const CODES = ["es", "en", "de", "fr", "nl", "pl", "it", "pt", "sv", "da"];

function clean(b) {
  const data = {};
  if (b.name !== undefined) data.name = String(b.name).trim().slice(0, 80);
  if (b.role !== undefined) data.role = b.role === "founder" ? "founder" : "guide";
  if (b.languages !== undefined) data.languages = String(b.languages).split(",").filter((c) => CODES.includes(c)).join(",");
  if (b.bioEs !== undefined) data.bioEs = String(b.bioEs || "").slice(0, 400) || null;
  if (b.bioEn !== undefined) data.bioEn = String(b.bioEn || "").slice(0, 400) || null;
  if (b.photoUrl !== undefined) data.photoUrl = b.photoUrl ? String(b.photoUrl).slice(0, 500) : null;
  if (b.sort !== undefined) data.sort = parseInt(b.sort, 10) || 0;
  if (typeof b.active === "boolean") data.active = b.active;
  return data;
}

export async function POST(req) {
  const g = guard(); if (g) return g;
  const data = clean(await req.json().catch(() => ({})));
  if (!data.name) return NextResponse.json({ message: "Falta el nombre." }, { status: 400 });
  await prisma.guide.create({ data });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  const g = guard(); if (g) return g;
  const b = await req.json().catch(() => ({}));
  const data = clean(b);
  if (data.name === "") return NextResponse.json({ message: "Falta el nombre." }, { status: 400 });
  await prisma.guide.update({ where: { id: b.id }, data });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const g = guard(); if (g) return g;
  const { id } = await req.json().catch(() => ({}));
  await prisma.guide.delete({ where: { id } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
