import { NextResponse } from "next/server";
import { availableSlots, activeProducts } from "@/lib/booking";

export const dynamic = "force-dynamic";

export async function GET() {
  const [slots, products] = await Promise.all([availableSlots(), activeProducts().catch(() => [])]);
  return NextResponse.json({ slots, products });
}
