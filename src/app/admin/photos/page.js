import { prisma } from "@/lib/db";
import { requireAdmin } from "../lib";
import { AdminNav } from "../ui";
import { PhotoManager } from "./manager";
import { blobConnected } from "@/lib/blob";

export const dynamic = "force-dynamic";

export default async function AdminPhotos() {
  requireAdmin();
  const photos = await prisma.photo.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "desc" }] });
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="text-[26px] font-extrabold tracking-tight">Fotos de la galería</h1>
        <p className="text-[15px] text-rock/80">
          Sube fotos desde el móvil. Se reducen solas para que la web vaya rápida. La galería solo aparece en la web cuando hay fotos;
          las 8 primeras se muestran (la primera, en grande). Usa las flechas para cambiar el orden.
        </p>
        <PhotoManager photos={JSON.parse(JSON.stringify(photos))} hasStorage={blobConnected()} />
      </main>
    </>
  );
}
