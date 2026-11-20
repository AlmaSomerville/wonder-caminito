import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard } from "../_guard";

export const dynamic = "force-dynamic";

// Bulk create a date range
export async function POST(req) {
  const g = guard(); if (g) return g;
  const b = await req.json().catch(() => ({}));
  const { from, to, time, capacity, note, skipMondays } = b;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from || "") || !/^\d{2}:\d{2}$/.test(time || ""))
    return NextResponse.json({ message: "Fecha u hora no válida." }, { status: 400 });

  const start = new Date(from + "T12:00:00");
  const end = new Date((to || from) + "T12:00:00");
  if (end < start) return NextResponse.json({ message: "«Hasta» es anterior a «Desde»." }, { status: 400 });

  let created = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (skipMondays && d.getDay() === 1) continue;
    const date = d.toISOString().slice(0, 10);
    try {
      await prisma.slot.upsert({
        where: { date_time: { date, time } },
        update: { capacity: parseInt(capacity, 10) || 10, note: note?.trim() || null, closed: false },
        create: { date, time, capacity: parseInt(capacity, 10) || 10, note: note?.trim() || null },
      });
      created++;
    } catch {}
    if (created > 120) break; // sanity cap
  }
  return NextResponse.json({ created });
}

export async function PATCH(req) {
  const g = guard(); if (g) return g;
  const { id, closed, capacity, note } = await req.json().catch(() => ({}));
  const data = {};
  if (typeof closed === "boolean") data.closed = closed;
  if (capacity != null) data.capacity = parseInt(capacity, 10);
  if (note !== undefined) data.note = note?.trim() || null;
  await prisma.slot.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const g = guard(); if (g) return g;
  const { id } = await req.json().catch(() => ({}));
  const count = await prisma.booking.count({ where: { slotId: id, status: { not: "CANCELLED" } } });
  if (count > 0) return NextResponse.json({ message: "Esa fecha tiene reservas: cancélalas primero." }, { status: 400 });
  await prisma.booking.deleteMany({ where: { slotId: id } });
  await prisma.slot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
