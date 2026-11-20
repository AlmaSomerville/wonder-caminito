"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePicker } from "../upload";

const IDIOMAS = [
  ["es", "🇪🇸", "Español"], ["en", "🇬🇧", "Inglés"], ["de", "🇩🇪", "Alemán"], ["fr", "🇫🇷", "Francés"], ["nl", "🇳🇱", "Neerlandés"],
  ["pl", "🇵🇱", "Polaco"], ["it", "🇮🇹", "Italiano"], ["pt", "🇵🇹", "Portugués"], ["sv", "🇸🇪", "Sueco"], ["da", "🇩🇰", "Danés"],
];
const FLAG = Object.fromEntries(IDIOMAS.map(([c, f]) => [c, f]));
const blank = { name: "", role: "guide", languages: "es,en", bioEs: "", bioEn: "", photoUrl: null, sort: 10 };

function GuideForm({ initial, onDone }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const langs = f.languages.split(",").filter(Boolean);
  const toggleLang = (c) => setF({ ...f, languages: (langs.includes(c) ? langs.filter((x) => x !== c) : [...langs, c]).join(",") });

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await fetch("/api/admin/guides", {
      method: f.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    setBusy(false);
    if (!res.ok) { setError((await res.json()).message || "No se ha podido guardar."); return; }
    onDone(); router.refresh();
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Nombre</label><input required className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div>
          <label className="label">Papel</label>
          <select className="field" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
            <option value="founder">Fundadora / guía principal</option>
            <option value="guide">Guía oficial</option>
          </select>
        </div>
      </div>
      <div>
        <span className="label">Idiomas que habla</span>
        <div className="flex flex-wrap gap-2">
          {IDIOMAS.map(([c, flag, name]) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleLang(c)}
              className={`rounded-full px-3 py-1.5 text-[14px] font-bold ${langs.includes(c) ? "bg-rock text-sand" : "border border-rock/20 bg-white"}`}
            >
              {flag} {name}
            </button>
          ))}
        </div>
      </div>
      <div><label className="label">Sobre esta persona (español)</label><textarea rows={2} className="field" value={f.bioEs || ""} onChange={(e) => setF({ ...f, bioEs: e.target.value })} /></div>
      <div>
        <label className="label">Sobre esta persona (inglés)</label>
        <textarea rows={2} className="field" value={f.bioEn || ""} onChange={(e) => setF({ ...f, bioEn: e.target.value })} />
        <p className="mt-1 text-[13px] text-rock/70">Los visitantes que no hablan español ven la versión en inglés.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ImagePicker value={f.photoUrl} onChange={(url) => setF({ ...f, photoUrl: url })} maxSide={700} label="Foto (cuadrada queda mejor)" />
        <div><label className="label">Orden en la web</label><input type="number" className="field" value={f.sort} onChange={(e) => setF({ ...f, sort: Number(e.target.value) })} /><p className="mt-1 text-[13px] text-rock/70">Número más bajo = sale antes.</p></div>
      </div>
      {error && <p className="text-[14px] font-bold text-terracotta">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy} className="btn btn-primary disabled:opacity-50">{busy ? "Guardando…" : "Guardar"}</button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>Cancelar</button>
      </div>
    </form>
  );
}

export function TeamEditor({ guides }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null); // guide id | "new" | null

  async function call(method, body, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    await fetch("/api/admin/guides", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    router.refresh();
  }

  return (
    <div className="mt-5 space-y-3">
      {editing === "new" ? (
        <GuideForm initial={blank} onDone={() => setEditing(null)} />
      ) : (
        <button className="btn btn-dark" onClick={() => setEditing("new")}>+ Añadir guía</button>
      )}

      {guides.map((g) =>
        editing === g.id ? (
          <GuideForm key={g.id} initial={{ ...blank, ...g }} onDone={() => setEditing(null)} />
        ) : (
          <div key={g.id} className={`card flex flex-wrap items-center gap-4 p-4 ${g.active ? "" : "opacity-60"}`}>
            <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-turquoise to-rock text-[18px] font-bold text-white">
              {g.name.slice(0, 1).toUpperCase()}
              {g.photoUrl && <img src={g.photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">
                {g.name} <span className="text-[13px] font-semibold text-terracotta">· {g.role === "founder" ? "Fundadora" : "Guía oficial"}</span>
                {!g.active && <span className="ml-2 text-[12px] font-bold text-rock/60">OCULTO</span>}
              </p>
              <p className="text-[18px] leading-none">{g.languages.split(",").map((c) => FLAG[c]).join(" ")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-ghost !py-2 text-[14px]" onClick={() => setEditing(g.id)}>Editar</button>
              <button className="btn btn-ghost !py-2 text-[14px]" onClick={() => call("PATCH", { id: g.id, active: !g.active })}>{g.active ? "Ocultar" : "Mostrar"}</button>
              <button className="btn btn-ghost !py-2 text-[14px]" onClick={() => call("DELETE", { id: g.id }, `¿Borrar a ${g.name} del equipo?`)}>Borrar</button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
