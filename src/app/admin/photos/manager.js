"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "../upload";

export function PhotoManager({ photos, hasStorage }) {
  const router = useRouter();
  const input = useRef(null);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function onFiles(files) {
    setError("");
    const list = Array.from(files || []);
    for (let i = 0; i < list.length; i++) {
      setProgress(`Subiendo ${i + 1} de ${list.length}…`);
      try {
        const url = await uploadImage(list[i], 2000);
        await fetch("/api/admin/photos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, caption }) });
      } catch (err) {
        setError(err.message); break;
      }
    }
    setProgress(""); setCaption("");
    router.refresh();
  }

  async function call(method, body, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    await fetch("/api/admin/photos", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    router.refresh();
  }

  if (!hasStorage) {
    return (
      <div className="card mt-5 border-terracotta/40 bg-peach p-5 text-[15px]">
        <p className="font-bold">Falta activar el almacenamiento de fotos.</p>
        <p className="mt-1 text-rock/80">
          En Vercel: proyecto → <b>Storage</b> → <b>Create Database</b> → <b>Blob</b> → conectarlo a este proyecto.
          <b>Si ya lo has conectado</b>, falta volver a desplegar: Deployments → ⋯ → Redeploy. Solo hay que hacerlo una vez.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="card space-y-3 p-5">
        <p className="text-[13px] font-bold text-[#2b8a80]">✓ Almacenamiento de fotos conectado</p>
        <div>
          <label className="label">Texto de la foto (opcional)</label>
          <input className="field" placeholder="p. ej. Puente colgante" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <button className="btn btn-dark" disabled={!!progress} onClick={() => input.current?.click()}>
          {progress || "+ Subir fotos"}
        </button>
        <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
        {error && <p className="text-[14px] font-bold text-terracotta">{error}</p>}
      </div>

      {photos.length === 0 ? (
        <p className="text-[15px] text-rock/80">Aún no hay fotos: la galería está oculta en la web.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p, i) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
              <div className="relative aspect-[4/3] bg-sand">
                <img src={p.url} alt={p.caption || ""} className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-[11px] font-bold text-white">GRANDE</span>}
                {i >= 8 && <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white">No se muestra</span>}
              </div>
              <div className="space-y-2 p-2.5">
                <input
                  className="w-full rounded-lg border border-rock/15 px-2 py-1.5 text-[13px]"
                  defaultValue={p.caption || ""}
                  placeholder="Texto (opcional)"
                  onBlur={(e) => e.target.value !== (p.caption || "") && call("PATCH", { id: p.id, caption: e.target.value })}
                />
                <div className="flex gap-1.5">
                  <button className="h-8 flex-1 rounded-lg border border-rock/15 text-[14px] disabled:opacity-30" disabled={i === 0} onClick={() => call("PATCH", { id: p.id, move: "up" })} aria-label="Subir">↑</button>
                  <button className="h-8 flex-1 rounded-lg border border-rock/15 text-[14px] disabled:opacity-30" disabled={i === photos.length - 1} onClick={() => call("PATCH", { id: p.id, move: "down" })} aria-label="Bajar">↓</button>
                  <button className="h-8 flex-1 rounded-lg border border-rock/15 text-[13px] font-bold" onClick={() => call("DELETE", { id: p.id }, "¿Borrar esta foto?")}>Borrar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
