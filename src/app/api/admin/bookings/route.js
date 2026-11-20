import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard } from "../_guard";

export const dynamic = "force-dynamic";

const allowed = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

export async function PATCH(req) {
  const g = guard(); if (g) return g;
  const { id, status } = await req.json().catch(() => ({}));
  if (!allowed.includes(status)) return NextResponse.json({ message: "Estado no válido" }, { status: 400 });
  await prisma.booking.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}
