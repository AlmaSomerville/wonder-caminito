import { NextResponse } from "next/server";
import { availableSlots } from "@/lib/booking";

export const dynamic = "force-dynamic";

export async function GET() {
  const slots = await availableSlots();
  return NextResponse.json({ slots });
}
