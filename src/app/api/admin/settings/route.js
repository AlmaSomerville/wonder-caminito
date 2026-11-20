import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard } from "../_guard";

export const dynamic = "force-dynamic";

export async function PATCH(req) {
  const g = guard(); if (g) return g;
  const b = await req.json().catch(() => ({}));
  const num = (v, min, max, fb) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fb;
  };
  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {
      priceAdult: num(b.priceAdult, 0, 10000, 52),
      priceChild: num(b.priceChild, 0, 10000, 42),
      defaultCapacity: Math.round(num(b.defaultCapacity, 1, 50, 10)),
      defaultTime: /^\d{2}:\d{2}$/.test(b.defaultTime || "") ? b.defaultTime : "09:00",
      cutoffHours: Math.round(num(b.cutoffHours, 0, 240, 14)),
      minPerBooking: Math.round(num(b.minPerBooking, 1, 50, 1)),
      maxPerBooking: Math.round(num(b.maxPerBooking, 1, 50, 10)),
      allowSameDay: !!b.allowSameDay,
      oneBookingPerEmailPerDay: !!b.oneBookingPerEmailPerDay,
    },
  });
  return NextResponse.json({ ok: true });
}
