import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function makeCode(name) {
  const base = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) || "PARTNER";
  return base + Math.floor(100 + Math.random() * 900);
}

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const required = ["companyName", "contactName", "email", "password", "taxId"];
  for (const k of required) if (!String(b[k] || "").trim()) return NextResponse.json({ message: "Please fill all required fields." }, { status: 400 });
  if (String(b.password).length < 8) return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });

  const email = String(b.email).trim().toLowerCase();
  if (await prisma.affiliate.findUnique({ where: { email } }))
    return NextResponse.json({ message: "That email already has an account. Try the partner login." }, { status: 400 });

  let code = String(b.code || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 20);
  if (!code) code = makeCode(b.companyName);
  if (await prisma.affiliate.findUnique({ where: { code } })) code = makeCode(b.companyName);

  const aff = await prisma.affiliate.create({
    data: {
      code,
      companyName: String(b.companyName).trim().slice(0, 200),
      contactName: String(b.contactName).trim().slice(0, 120),
      email,
      passwordHash: await bcrypt.hash(String(b.password), 10),
      phone: String(b.phone || "").slice(0, 40) || null,
      taxId: String(b.taxId).trim().slice(0, 30),
      address: String(b.address || "").slice(0, 300) || null,
      city: String(b.city || "").slice(0, 100) || null,
      postalCode: String(b.postalCode || "").slice(0, 12) || null,
      iban: String(b.iban || "").replace(/\s/g, "").slice(0, 40) || null,
      notes: String(b.notes || "").slice(0, 500) || null,
    },
  });

  return NextResponse.json({ ok: true, code: aff.code });
}
