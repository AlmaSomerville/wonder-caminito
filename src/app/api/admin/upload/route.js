import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { guard } from "../_guard";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const g = guard(); if (g) return g;
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ message: "Falta activar el almacenamiento de fotos (Vercel → Storage → Blob)." }, { status: 400 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ message: "No se ha recibido ninguna foto." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ message: "La foto es demasiado grande." }, { status: 400 });

  const name = String(file.name || "foto.jpg").toLowerCase().replace(/[^a-z0-9.\-]/g, "-");
  const blob = await put(`fotos/${name}`, file, { access: "public", addRandomSuffix: true, contentType: "image/jpeg" });
  return NextResponse.json({ url: blob.url });
}
