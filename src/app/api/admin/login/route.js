import { NextResponse } from "next/server";
import crypto from "crypto";
import { setSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  const expected = process.env.ADMIN_PASSWORD || "";
  const a = Buffer.from(String(password || ""));
  const b = Buffer.from(expected);
  const ok = expected && a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 401 });
  setSessionCookie("wadmin", { role: "admin" });
  return NextResponse.json({ ok: true });
}
