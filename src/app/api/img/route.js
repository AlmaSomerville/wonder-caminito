// Serves gallery/team/product photos stored in a *private* Vercel Blob store.
import { get } from "@vercel/blob";
import { isBlobUrl } from "@/lib/blob";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const u = new URL(req.url).searchParams.get("u");
  if (!u || !isBlobUrl(u) || !new URL(u).pathname.startsWith("/fotos/")) return new Response("Not found", { status: 404 });
  try {
    const res = await get(u, { access: "private" });
    if (!res?.stream) return new Response("Not found", { status: 404 });
    return new Response(res.stream, {
      headers: {
        "Content-Type": res.blob?.contentType || "image/jpeg",
        // URLs are unique per upload, so browsers and Vercel's CDN can cache them for good
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
