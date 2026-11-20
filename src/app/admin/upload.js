"use client";
import { useRef, useState } from "react";

// Shrinks phone photos in the browser before uploading (a 6 MB photo becomes ~300 KB), so uploads are fast and never too big.
async function shrink(file, maxSide) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
}

export async function uploadImage(file, maxSide = 2000) {
  let blob;
  try {
    blob = await shrink(file, maxSide);
  } catch {
    throw new Error("Este navegador no puede leer esa foto (¿formato HEIC?). Súbela desde el móvil o guárdala como JPG.");
  }
  if (!blob) throw new Error("No se ha podido preparar la foto. Prueba con otra.");
  const fd = new FormData();
  fd.append("file", blob, (file.name || "foto").replace(/\.[^.]+$/, "") + ".jpg");
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "No se ha podido subir la foto.");
  return data.url;
}

// Single-photo picker for guides and products
export function ImagePicker({ value, onChange, maxSide = 900, label = "Foto" }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-rock/15 bg-sand text-[11px] text-rock/60">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : "Sin foto"}
        </div>
        <button type="button" className="btn btn-ghost !py-2 text-[14px]" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? "Subiendo…" : value ? "Cambiar foto" : "Subir foto"}
        </button>
        {value && !busy && (
          <button type="button" className="text-[13px] font-bold text-rock/60 underline" onClick={() => onChange(null)}>Quitar</button>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true); setError("");
            try { onChange(await uploadImage(f, maxSide)); } catch (err) { setError(err.message); }
            setBusy(false); e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-2 text-[13px] font-bold text-terracotta">{error}</p>}
    </div>
  );
}
