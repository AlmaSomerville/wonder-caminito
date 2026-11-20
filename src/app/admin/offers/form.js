"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const empty = { code: "", titleEn: "", titleEs: "", bodyEn: "", bodyEs: "", discountPct: 10, showPopup: true, startsAt: "", endsAt: "" };

export function NewOfferForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await fetch("/api/admin/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setBusy(false);
    if (!res.ok) { setError((await res.json()).message || "No se ha podido crear."); return; }
    setOpen(false); setF(empty);
    router.refresh();
  }

  if (!open) return <button className="btn btn-dark mt-5" onClick={() => setOpen(true)}>+ Nueva oferta</button>;

  return (
    <form onSubmit={submit} className="card mt-5 space-y-3 p-5">
      <p className="text-[13px] text-rock/75">Escribe el texto en español y en inglés: los visitantes en otros idiomas ven la versión en inglés.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">Código</label><input required className="field uppercase" placeholder="GOLDEN10" value={f.code} onChange={set("code")} /></div>
        <div><label className="label">Descuento %</label><input required type="number" min={0} max={100} className="field" value={f.discountPct} onChange={set("discountPct")} /></div>
        <div><label className="label">Título (español)</label><input required className="field" value={f.titleEs} onChange={set("titleEs")} /></div>
        <div><label className="label">Título (inglés)</label><input required className="field" value={f.titleEn} onChange={set("titleEn")} /></div>
        <div><label className="label">Texto (español, opcional)</label><input className="field" value={f.bodyEs} onChange={set("bodyEs")} /></div>
        <div><label className="label">Texto (inglés, opcional)</label><input className="field" value={f.bodyEn} onChange={set("bodyEn")} /></div>
        <div><label className="label">Empieza (opcional)</label><input type="date" className="field" value={f.startsAt} onChange={set("startsAt")} /></div>
        <div><label className="label">Termina (opcional)</label><input type="date" className="field" value={f.endsAt} onChange={set("endsAt")} /></div>
      </div>
      <label className="flex items-center gap-2 text-[14px] font-bold">
        <input type="checkbox" checked={f.showPopup} onChange={set("showPopup")} className="h-4 w-4" />
        Mostrar como ventana emergente (apagado = solo código de descuento)
      </label>
      {error && <p className="text-[14px] font-bold text-terracotta">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy} className="btn btn-primary disabled:opacity-50">{busy ? "Creando…" : "Crear (empieza apagada)"}</button>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
      </div>
    </form>
  );
}
