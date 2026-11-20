import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard } from "../_guard";

export const dynamic = "force-dynamic";

export async function PATCH(req) {
  const g = guard(); if (g) return g;
  const { id, approved } = await req.json().catch(() => ({}));
  await prisma.affiliate.update({ where: { id }, data: { approved: !!approved } });
  return NextResponse.json({ ok: true });
}
