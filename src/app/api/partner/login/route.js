import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  const aff = await prisma.affiliate.findUnique({ where: { email: String(email || "").toLowerCase() } });
  if (!aff || !(await bcrypt.compare(String(password || ""), aff.passwordHash)))
    return NextResponse.json({ error: "WRONG" }, { status: 401 });
  if (!aff.approved)
    return NextResponse.json({ error: "PENDING" }, { status: 403 });
  setSessionCookie("wpartner", { role: "partner", id: aff.id });
  return NextResponse.json({ ok: true });
}
