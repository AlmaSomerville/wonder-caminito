import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { guard } from "../_guard";
import { blobConnected, toProxyUrl } from "@/lib/blob";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const g = guard(); if (g) return g;
  if (!blobConnected())
    return NextResponse.json({ message: "Falta activar el almacenamiento de fotos (Vercel → Storage → Blob) y volver a desplegar." }, { status: 400 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ message: "No se ha recibido ninguna foto." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ message: "La foto es demasiado grande." }, { status: 400 });

  const name = String(file.name || "foto.jpg").toLowerCase().replace(/[^a-z0-9.\-]/g, "-");
  const opts = { addRandomSuffix: true, contentType: "image/jpeg" };

  // Public store: direct URL. If the store refuses public files (private store), store privately and serve via /api/img.
  try {
    const blob = await put(`fotos/${name}`, file, { ...opts, access: "public" });
    return NextResponse.json({ url: blob.url });
  } catch (publicErr) {
    try {
      const blob = await put(`fotos/${name}`, file, { ...opts, access: "private" });
      return NextResponse.json({ url: toProxyUrl(blob.url) });
    } catch {
      console.error("[upload] Blob error:", publicErr);
      return NextResponse.json(
        { message: `No se ha podido guardar la foto. Detalle técnico: ${publicErr?.message || publicErr}` },
        { status: 500 }
      );
    }
  }
}
