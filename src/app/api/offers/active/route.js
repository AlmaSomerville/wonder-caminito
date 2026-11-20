import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const offer = await prisma.offer.findFirst({
    where: {
      active: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { createdAt: "desc" },
    select: { code: true, titleEn: true, titleEs: true, bodyEn: true, bodyEs: true, discountPct: true, showPopup: true },
  });
  return NextResponse.json({ offer });
}
