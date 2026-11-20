"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddDatesForm({ defaultTime, defaultCapacity }) {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState(defaultTime);
  const [capacity, setCapacity] = useState(defaultCapacity);
  const [note, setNote] = useState("");
  const [skipMon, setSkipMon] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: to || from, time, capacity, note, skipMondays: skipMon }),
    });
    const data = await res.json();
    setBusy(false);
    setMsg(data.message || `Listo: ${data.created} ${data.created === 1 ? "fecha añadida" : "fechas añadidas"}.`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mt-5 space-y-3 p-5">
      <p className="text-[16px] font-bold">Abrir fechas nuevas</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div><label className="label">Desde</label><input required type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label">Hasta (opcional)</label><input type="date" className="field" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div><label className="label">Hora</label><input required type="time" className="field" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        <div><label className="label">Plazas</label><input required type="number" min={1} max={30} className="field" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-[200px] flex-1"><label className="label">Etiqueta (opcional)</label><input className="field" placeholder="p. ej. Fiesta especial" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <label className="flex items-center gap-2 text-[14px] font-bold">
          <input type="checkbox" checked={skipMon} onChange={(e) => setSkipMon(e.target.checked)} className="h-4 w-4" />
          Saltar lunes (el Caminito cierra)
        </label>
      </div>
      <button disabled={busy} className="btn btn-dark disabled:opacity-50">{busy ? "Añadiendo…" : "Añadir fechas"}</button>
      {msg && <p className="text-[14px] font-bold text-[#2b8a80]">{msg}</p>}
    </form>
  );
}
