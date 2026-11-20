"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const fields = [
  ["priceAdult", "Adult price (€)", "number", "All-inclusive price per adult."],
  ["priceChild", "Child price (€)", "number", "Ages 8–17. Under 8 can't walk the Caminito."],
  ["defaultCapacity", "Default group size", "number", "Pre-filled when you open new dates."],
  ["defaultTime", "Default start time", "time", "Pre-filled when you open new dates."],
  ["cutoffHours", "Booking cutoff (hours)", "number", "Stop online bookings this many hours before the slot. 14 = roughly 'book until the evening before'."],
  ["minPerBooking", "Min people per booking", "number", ""],
  ["maxPerBooking", "Max people per booking", "number", "Can't exceed the date's capacity anyway."],
];

const toggles = [
  ["allowSameDay", "Allow same-day booking", "Off = guests must book by the day before (your next-day ticket model)."],
  ["oneBookingPerEmailPerDay", "Block duplicate bookings", "Same email can't book the same date twice."],
];

export function PricingForm({ initial }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
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
            {help && <p className="mt-1.5 text-[13px] text-rock/70">{help}</p>}
          </div>
        ))}
        {toggles.map(([k, label, help]) => (
          <label key={k} className="card flex cursor-pointer items-start gap-3 p-4">
            <input type="checkbox" className="mt-1 h-5 w-5" checked={!!form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />
            <span>
              <span className="block text-[14px] font-bold">{label}</span>
              <span className="block text-[13px] text-rock/70">{help}</span>
            </span>
          </label>
        ))}
      </div>
      <button disabled={busy} className="btn btn-primary disabled:opacity-50">
        {busy ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </form>
  );
}
