"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const WA = process.env.NEXT_PUBLIC_WHATSAPP || "34600000000";

function Stepper({ value, onChange, min = 0, max = 10, label, sub }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-rock/15 bg-white px-4 py-3">
      <div>
        <p className="text-[15px] font-bold">{label}</p>
        <p className="text-[12px] opacity-60">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="grid h-10 w-10 place-items-center rounded-full border border-rock/20 text-xl font-bold active:scale-95" aria-label={`Fewer ${label}`}>−</button>
        <span className="w-6 text-center text-[17px] font-extrabold">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="grid h-10 w-10 place-items-center rounded-full bg-rock text-xl font-bold text-sand active:scale-95" aria-label={`More ${label}`}>+</button>
      </div>
    </div>
  );
}

function fmtDate(d) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function BookInner() {
  const params = useSearchParams();
  const [slots, setSlots] = useState(null);
  const [slotId, setSlotId] = useState(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", language: "en", notes: "" });
  const [offer, setOffer] = useState(params.get("offer") || "");
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    fetch("/api/slots").then((r) => r.json()).then((d) => {
      setSlots(d.slots || []);
      if (d.slots?.length) setSlotId(d.slots[0].id);
    });
  }, []);

  const selected = useMemo(() => slots?.find((s) => s.id === slotId), [slots, slotId]);
  const tomorrow = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  // live price quote
  useEffect(() => {
    if (!slotId) return;
    const ctl = new AbortController();
    fetch(`/api/bookings?quote=1&slotId=${slotId}&adults=${adults}&children=${children}&offer=${encodeURIComponent(offer)}`, { signal: ctl.signal })
      .then((r) => r.json()).then(setQuote).catch(() => {});
    return () => ctl.abort();
  }, [slotId, adults, children, offer]);

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, adults, children, offerCode: offer, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      setDone(data.booking);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again or message us on WhatsApp.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const msg = `Hola Nati! Booking ${done.ref} — ${done.name}, ${done.date} ${done.time}, ${done.adults} adults${done.children ? ` + ${done.children} children` : ""}.`;
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-turquoise text-3xl text-white">✓</div>
        <h1 className="mt-6 font-serif text-[32px] font-bold">Reserved!</h1>
        <p className="mt-2 text-[15px] opacity-75">
          Your morning is held. Reference <span className="rounded bg-sand px-2 py-0.5 font-mono font-bold">{done.ref}</span>
        </p>
        <div className="card mt-6 p-5 text-left text-[14px]">
          <p><b>{fmtDate(done.date)}</b> · {done.time} · {done.adults + done.children} people</p>
          <p className="mt-1">Total: <b>€{done.totalEUR}</b> — pay on confirmation, nothing charged now.</p>
          <p className="mt-2 opacity-70">Nati will confirm on WhatsApp within the hour (usually in minutes).</p>
        </div>
        <a href={`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`} className="btn btn-primary mt-6 w-full">
          Open WhatsApp to confirm faster
        </a>
        <Link href="/" className="mt-4 block text-[13px] font-bold underline underline-offset-4">Back to home</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-8">
      <Link href="/" className="text-[13px] font-bold opacity-60">← Wonder</Link>
      <h1 className="mt-3 font-serif text-[34px] font-bold leading-tight">Book your 9AM morning</h1>
      <p className="mt-1 text-[14px] opacity-70">Under a minute. No payment now — pay on confirmation.</p>

      {/* Dates */}
      <h2 className="label mt-7">Pick a date</h2>
      {slots === null ? (
        <p className="text-[14px] opacity-60">Loading dates…</p>
      ) : slots.length === 0 ? (
        <div className="card p-5 text-[14px]">
          No online dates right now. <a className="font-bold text-terracotta underline" href={`https://wa.me/${WA}`}>Ask on WhatsApp</a> — we can often open one.
        </div>
      ) : (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: "none" }}>
          {slots.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSlotId(s.id)}
              className={`min-w-[108px] rounded-2xl border p-3 text-center transition ${
                s.id === slotId ? "border-rock bg-rock text-sand" : s.note ? "border-terracotta/40 bg-[#FFF1EB]" : "border-rock/15 bg-white"
              }`}
            >
              {s.date === tomorrow && (
                <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wide ${s.id === slotId ? "bg-turquoise text-rock" : "bg-turquoise text-white"}`}>TOMORROW</span>
              )}
              <p className="text-[14px] font-bold">{fmtDate(s.date)}</p>
              <p className={`text-[11px] ${s.id === slotId ? "opacity-80" : "opacity-60"}`}>{s.time} · {s.left} left</p>
              {s.note && <p className="mt-0.5 text-[10px] font-bold text-terracotta">{s.note}</p>}
            </button>
          ))}
        </div>
      )}

      {/* People */}
      <h2 className="label mt-6">Who's coming</h2>
      <div className="space-y-3">
        <Stepper label="Adults" sub="18+" value={adults} min={1} max={selected?.left ?? 10} onChange={setAdults} />
        <Stepper label="Children" sub="Ages 8–17 (under 8 not allowed)" value={children} min={0} max={Math.max(0, (selected?.left ?? 10) - adults)} onChange={setChildren} />
      </div>

      {/* Details */}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" required className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="phone">WhatsApp number</label>
          <input id="phone" required className="field" type="tel" placeholder="+44 7..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" required className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="language">Tour language</label>
            <select id="language" className="field" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="offer">Offer code</label>
            <input id="offer" className="field uppercase" placeholder="Optional" value={offer} onChange={(e) => setOffer(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="notes">Anything we should know?</label>
          <input id="notes" className="field" placeholder="Optional — fear of heights, pickup question…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        {error && <p className="rounded-2xl bg-terracotta/10 p-4 text-[14px] font-bold text-terracotta">{error}</p>}

        {/* Sticky total + submit */}
        <div className="fixed inset-x-0 bottom-0 border-t border-black/[0.08] bg-cream/95 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-50">Total</p>
              <p className="font-serif text-[26px] font-extrabold leading-none">
                €{quote?.total ?? "—"}
                {quote?.appliedOffer && <span className="ml-2 align-middle text-[11px] font-bold text-turquoise">{quote.appliedOffer} ✓</span>}
              </p>
            </div>
            <button disabled={busy || !slotId} className="btn btn-primary flex-1 disabled:opacity-50">
              {busy ? "Reserving…" : "Reserve — pay later"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense>
      <BookInner />
    </Suspense>
  );
}
