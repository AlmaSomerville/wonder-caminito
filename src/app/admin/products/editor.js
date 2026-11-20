"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePicker } from "../upload";

const blank = { nameEs: "", nameEn: "", descEs: "", descEn: "", price: 20, sizes: "", photoUrl: null, sort: 10 };

function ProductForm({ initial, onDone }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await fetch("/api/admin/products", {
      method: f.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, price: Number(f.price) }),
    });
    setBusy(false);
    if (!res.ok) { setError((await res.json()).message || "No se ha podido guardar."); return; }
    onDone(); router.refresh();
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Nombre (español)</label><input required className="field" placeholder="Camiseta Wonder" value={f.nameEs} onChange={set("nameEs")} /></div>
        <div><label className="label">Nombre (inglés)</label><input required className="field" placeholder="Wonder T-shirt" value={f.nameEn} onChange={set("nameEn")} /></div>
        <div><label className="label">Descripción (español)</label><input className="field" value={f.descEs || ""} onChange={set("descEs")} /></div>
        <div><label className="label">Descripción (inglés)</label><input className="field" value={f.descEn || ""} onChange={set("descEn")} /></div>
        <div><label className="label">Precio (€)</label><input required type="number" min={0} step="any" className="field" value={f.price} onChange={set("price")} /></div>
        <div>
          <label className="label">Tallas (opcional)</label>
          <input className="field" placeholder="S,M,L,XL" value={f.sizes || ""} onChange={set("sizes")} />
          <p className="mt-1 text-[13px] text-rock/70">Separadas por comas. Vacío si el producto no tiene tallas.</p>
        </div>
        <ImagePicker value={f.photoUrl} onChange={(url) => setF({ ...f, photoUrl: url })} maxSide={900} />
        <div><label className="label">Orden</label><input type="number" className="field" value={f.sort} onChange={(e) => setF({ ...f, sort: Number(e.target.value) })} /></div>
      </div>
      {error && <p className="text-[14px] font-bold text-terracotta">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy} className="btn btn-primary disabled:opacity-50">{busy ? "Guardando…" : "Guardar"}</button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>Cancelar</button>
      </div>
    </form>
  );
}

export function ProductEditor({ products }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null);

  async function call(method, body, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    await fetch("/api/admin/products", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    router.refresh();
  }

  return (
    <div className="mt-5 space-y-3">
      {editing === "new" ? (
        <ProductForm initial={blank} onDone={() => setEditing(null)} />
      ) : (
        <button className="btn btn-dark" onClick={() => setEditing("new")}>+ Nuevo producto</button>
      )}

      {products.length === 0 && editing !== "new" && <p className="text-[15px] text-rock/80">Aún no hay productos.</p>}

      {products.map((p) =>
        editing === p.id ? (
          <ProductForm key={p.id} initial={{ ...blank, ...p }} onDone={() => setEditing(null)} />
        ) : (
          <div key={p.id} className="card flex flex-wrap items-center gap-4 p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sand text-[22px]">
              {p.photoUrl ? <img src={p.photoUrl} alt="" className="h-full w-full object-cover" /> : "🛍️"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{p.nameEs} · {p.price} €</p>
              <p className="text-[14px] text-rock/75">{p.sizes ? `Tallas: ${p.sizes}` : "Sin tallas"}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${p.active ? "bg-turquoise text-white" : "bg-black/5 text-rock/70"}`}>
              {p.active ? "VISIBLE" : "OCULTO"}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                className={p.active ? "btn btn-ghost !py-2 text-[14px]" : "btn btn-primary !py-2 text-[14px]"}
                onClick={() => call("PATCH", { id: p.id, active: !p.active })}
              >
                {p.active ? "Ocultar" : "Mostrar en la web"}
              </button>
              <button className="btn btn-ghost !py-2 text-[14px]" onClick={() => setEditing(p.id)}>Editar</button>
              <button className="btn btn-ghost !py-2 text-[14px]" onClick={() => call("DELETE", { id: p.id }, `¿Borrar «${p.nameEs}»?`)}>Borrar</button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
