"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const fields = [
  ["priceAdult", "Precio adulto (€)", "number", "Precio por adulto, todo incluido. Es el que se muestra en la web."],
  ["priceChild", "Precio niño (€)", "number", "De 8 a 17 años. Menores de 8 no pueden hacer el Caminito."],
  ["defaultCapacity", "Plazas por defecto", "number", "Se rellena solo al abrir fechas nuevas."],
  ["defaultTime", "Hora por defecto", "time", "Se rellena sola al abrir fechas nuevas."],
  ["cutoffHours", "Cierre de reservas (horas antes)", "number", "Deja de vender online estas horas antes del pase. 14 ≈ hasta la tarde anterior."],
  ["minPerBooking", "Mínimo de personas por reserva", "number", ""],
  ["maxPerBooking", "Máximo de personas por reserva", "number", "Nunca supera las plazas de la fecha."],
];

const toggles = [
  ["allowSameDay", "Permitir reservas para el mismo día", "Apagado = hay que reservar como tarde el día anterior."],
  ["oneBookingPerEmailPerDay", "Bloquear reservas duplicadas", "Un mismo email no puede reservar dos veces la misma fecha."],
];

export function PricingForm({ initial }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setSaved(false);
    await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false); setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([k, label, type, help]) => (
          <div key={k} className="card p-4">
            <label className="label" htmlFor={k}>{label}</label>
            <input
              id={k}
              type={type}
              step={type === "number" ? "any" : undefined}
              className="field"
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: type === "number" ? Number(e.target.value) : e.target.value })}
            />
            {help && <p className="mt-1.5 text-[13px] text-rock/75">{help}</p>}
          </div>
        ))}
        {toggles.map(([k, label, help]) => (
          <label key={k} className="card flex cursor-pointer items-start gap-3 p-4">
            <input type="checkbox" className="mt-1 h-5 w-5" checked={!!form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />
            <span>
              <span className="block text-[15px] font-bold">{label}</span>
              <span className="block text-[13px] text-rock/75">{help}</span>
            </span>
          </label>
        ))}
      </div>
      <button disabled={busy} className="btn btn-primary disabled:opacity-50">
        {busy ? "Guardando…" : saved ? "Guardado ✓" : "Guardar cambios"}
      </button>
    </form>
  );
}
