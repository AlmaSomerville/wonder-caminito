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
    setMsg(data.message || `Added ${data.created} date(s).`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mt-5 space-y-3 p-5">
      <p className="font-bold">Open new dates</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div><label className="label">From</label><input required type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label">To (optional)</label><input type="date" className="field" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div><label className="label">Time</label><input required type="time" className="field" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        <div><label className="label">Capacity</label><input required type="number" min={1} max={30} className="field" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-[200px] flex-1"><label className="label">Label (optional)</label><input className="field" placeholder="e.g. Fiesta especial" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <label className="flex items-center gap-2 text-[13px] font-bold">
          <input type="checkbox" checked={skipMon} onChange={(e) => setSkipMon(e.target.checked)} className="h-4 w-4" />
          Skip Mondays (Caminito closed)
        </label>
      </div>
      <button disabled={busy} className="btn btn-dark disabled:opacity-50">{busy ? "Adding…" : "Add dates"}</button>
      {msg && <p className="text-[13px] font-bold text-turquoise">{msg}</p>}
    </form>
  );
}
