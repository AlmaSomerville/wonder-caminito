import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { guard } from "../_guard";

export const dynamic = "force-dynamic";

function clean(b) {
  const data = {};
  for (const k of ["nameEs", "nameEn"]) if (b[k] !== undefined) data[k] = String(b[k]).trim().slice(0, 80);
  for (const k of ["descEs", "descEn"]) if (b[k] !== undefined) data[k] = String(b[k] || "").slice(0, 300) || null;
  if (b.price !== undefined) data.price = Math.max(0, Math.round(Number(b.price) * 100) / 100 || 0);
  if (b.sizes !== undefined) data.sizes = String(b.sizes || "").split(",").map((z) => z.trim()).filter(Boolean).slice(0, 12).join(",") || null;
  if (b.photoUrl !== undefined) data.photoUrl = b.photoUrl ? String(b.photoUrl).slice(0, 500) : null;
  if (b.sort !== undefined) data.sort = parseInt(b.sort, 10) || 0;
  if (typeof b.active === "boolean") data.active = b.active;
  return data;
}

export async function POST(req) {
  const g = guard(); if (g) return g;
  const data = clean(await req.json().catch(() => ({})));
  if (!data.nameEs || !data.nameEn) return NextResponse.json({ message: "Falta el nombre en español o en inglés." }, { status: 400 });
  await prisma.product.create({ data: { ...data, active: false } }); // always starts hidden
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  const g = guard(); if (g) return g;
  const b = await req.json().catch(() => ({}));
  const data = clean(b);
  if (data.nameEs === "" || data.nameEn === "") return NextResponse.json({ message: "Falta el nombre en español o en inglés." }, { status: 400 });
  await prisma.product.update({ where: { id: b.id }, data });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const g = guard(); if (g) return g;
  const { id } = await req.json().catch(() => ({}));
  await prisma.product.delete({ where: { id } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
