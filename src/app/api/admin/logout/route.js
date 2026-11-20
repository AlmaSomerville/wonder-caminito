import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";
export async function POST() {
  clearSessionCookie("wadmin");
  return NextResponse.json({ ok: true });
}
