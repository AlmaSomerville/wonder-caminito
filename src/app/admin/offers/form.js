"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewOfferForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ code: "", titleEn: "", titleEs: "", bodyEn: "", bodyEs: "", discountPct: 10, showPopup: true, startsAt: "", endsAt: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/admin/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setBusy(false); setOpen(false);
    setF({ code: "", titleEn: "", titleEs: "", bodyEn: "", bodyEs: "", discountPct: 10, showPopup: true, startsAt: "", endsAt: "" });
    router.refresh();
  }

  if (!open) return <button className="btn btn-dark mt-5" onClick={() => setOpen(true)}>+ New offer</button>;

  return (
    <form onSubmit={submit} className="card mt-5 space-y-3 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">Code</label><input required className="field uppercase" placeholder="GOLDEN10" value={f.code} onChange={set("code")} /></div>
        <div><label className="label">Discount %</label><input required type="number" min={0} max={100} className="field" value={f.discountPct} onChange={set("discountPct")} /></div>
        <div><label className="label">Title (English)</label><input required className="field" value={f.titleEn} onChange={set("titleEn")} /></div>
        <div><label className="label">Título (Español)</label><input required className="field" value={f.titleEs} onChange={set("titleEs")} /></div>
        <div><label className="label">Body (English, optional)</label><input className="field" value={f.bodyEn} onChange={set("bodyEn")} /></div>
        <div><label className="label">Texto (Español, opcional)</label><input className="field" value={f.bodyEs} onChange={set("bodyEs")} /></div>
        <div><label className="label">Starts (optional)</label><input type="date" className="field" value={f.startsAt} onChange={set("startsAt")} /></div>
        <div><label className="label">Ends (optional)</label><input type="date" className="field" value={f.endsAt} onChange={set("endsAt")} /></div>
      </div>
      <label className="flex items-center gap-2 text-[13px] font-bold">
        <input type="checkbox" checked={f.showPopup} onChange={set("showPopup")} className="h-4 w-4" />
        Show as homepage pop-up (off = discount code only)
      </label>
      <div className="flex gap-2">
        <button disabled={busy} className="btn btn-primary disabled:opacity-50">{busy ? "Creating…" : "Create (starts OFF)"}</button>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
