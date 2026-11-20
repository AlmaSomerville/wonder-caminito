"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { T } from "@/lib/i18n";
import { useLang, LanguageSwitcher } from "../lang";

const WA = process.env.NEXT_PUBLIC_WHATSAPP || "34604411426";

function Stepper({ value, onChange, min = 0, max = 10, label, sub }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-rock/15 bg-white px-4 py-3">
      <div>
        <p className="text-[15px] font-bold">{label}</p>
        <p className="text-[13px] text-rock/70">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="grid h-10 w-10 place-items-center rounded-full border border-rock/20 text-xl font-bold active:scale-95" aria-label={`− ${label}`}>−</button>
        <span className="w-6 text-center text-[17px] font-extrabold">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="grid h-10 w-10 place-items-center rounded-full bg-rock text-xl font-bold text-sand active:scale-95" aria-label={`+ ${label}`}>+</button>
      </div>
    </div>
  );
}

function BookInner() {
  const params = useSearchParams();
  const [lang, setLang] = useLang();
  const s = T[lang];
  const fmtDate = (d) =>
    new Date(d + "T12:00:00").toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "short" });

  const [slots, setSlots] = useState(null);
  const [products, setProducts] = useState([]);
  const [extras, setExtras] = useState({}); // { productId: { qty, size } }
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
      setProducts(d.products || []);
      if (d.slots?.length) setSlotId(d.slots[0].id);
    });
  }, []);

  const selected = useMemo(() => slots?.find((x) => x.id === slotId), [slots, slotId]);
  const extrasPayload = useMemo(
    () => Object.entries(extras).filter(([, v]) => v.qty > 0).map(([id, v]) => ({ id, qty: v.qty, size: v.size })),
    [extras]
  );
  const setExtra = (p, patch) =>
    setExtras((prev) => {
      const sizes = (p.sizes || "").split(",").map((z) => z.trim()).filter(Boolean);
      const cur = prev[p.id] || { qty: 0, size: sizes[1] || sizes[0] || null };
      return { ...prev, [p.id]: { ...cur, ...patch } };
    });
  const tomorrow = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    if (!slotId) return;
    const ctl = new AbortController();
    fetch(`/api/bookings?quote=1&slotId=${slotId}&adults=${adults}&children=${children}&offer=${encodeURIComponent(offer)}&extras=${encodeURIComponent(JSON.stringify(extrasPayload))}`, { signal: ctl.signal })
      .then((r) => r.json()).then(setQuote).catch(() => {});
    return () => ctl.abort();
  }, [slotId, adults, children, offer, extrasPayload]);

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, adults, children, offerCode: offer, extras: extrasPayload, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      setDone(data.booking);
    } catch (err) {
      setError(err.message || s.errFallback);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    // Message to the business stays in English/Spanish — the team reads those.
    const extrasText = (done.extras || []).map((l) => `${l.qty}× ${l.name}${l.size ? ` (${l.size})` : ""}`).join(", ");
    const msg = `Hola Wonder! Booking ${done.ref} — ${done.name}, ${done.date} ${done.time}, ${done.adults} adults${done.children ? ` + ${done.children} children` : ""}${extrasText ? ` + ${extrasText}` : ""}.`;
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-turquoise text-3xl text-white">✓</div>
        <h1 className="mt-6 tracking-tight text-[32px] font-bold">{s.doneTitle}</h1>
        <p className="mt-2 text-[15px] opacity-75">
          {s.doneHeld} <span className="rounded bg-sand px-2 py-0.5 font-mono font-bold">{done.ref}</span>
        </p>
        <div className="card mt-6 p-5 text-left text-[14px]">
          <p><b>{fmtDate(done.date)}</b> · {done.time} · {done.adults + done.children} {s.people}</p>
          {(done.extras || []).map((l) => (
            <p key={l.id} className="mt-1">+ {l.qty}× {l.name}{l.size ? ` (${l.size})` : ""}</p>
          ))}
          <p className="mt-1">{s.total}: <b>€{done.totalEUR}</b> — {s.donePay}</p>
          <p className="mt-2 opacity-70">{s.doneConfirm}</p>
        </div>
        <a href={`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`} className="btn btn-primary mt-6 w-full">
          {s.doneWa}
        </a>
        <Link href="/" className="mt-4 block text-[13px] font-bold underline underline-offset-4">{s.doneBack}</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-[13px] font-bold opacity-60">← Wonder</Link>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>
      <h1 className="mt-3 tracking-tight text-[32px] font-extrabold leading-tight">{s.bTitle}</h1>
      <p className="mt-1 text-[15px] text-rock/80">{s.bSub}</p>

      <h2 className="label mt-7">{s.pickDate}</h2>
      {slots === null ? (
        <p className="text-[14px] opacity-60">{s.loading}</p>
      ) : slots.length === 0 ? (
        <div className="card p-5 text-[14px]">
          {s.noDates} <a className="font-bold text-terracotta underline" href={`https://wa.me/${WA}`}>{s.askWa}</a> {s.canOpen}
        </div>
      ) : (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: "none" }}>
          {slots.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setSlotId(x.id)}
              className={`min-w-[116px] rounded-2xl border p-3 text-center transition ${
                x.id === slotId ? "border-rock bg-rock text-sand" : x.note ? "border-terracotta/40 bg-[#FFF1EB]" : "border-rock/15 bg-white"
              }`}
            >
              {x.date === tomorrow && (
                <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wide ${x.id === slotId ? "bg-turquoise text-rock" : "bg-turquoise text-white"}`}>{s.tomorrow}</span>
              )}
              <p className="whitespace-nowrap text-[14px] font-bold">{fmtDate(x.date)}</p>
              <p className={`text-[11px] ${x.id === slotId ? "opacity-80" : "opacity-60"}`}>{x.time} · {x.left} {s.left}</p>
              {x.note && <p className="mt-0.5 text-[10px] font-bold text-terracotta">{x.note}</p>}
            </button>
          ))}
        </div>
      )}

      <h2 className="label mt-6">{s.who}</h2>
      <div className="space-y-3">
        <Stepper label={s.adults} sub={s.adultsSub} value={adults} min={1} max={selected?.left ?? 10} onChange={setAdults} />
        <Stepper label={s.children} sub={s.childrenSub} value={children} min={0} max={Math.max(0, (selected?.left ?? 10) - adults)} onChange={setChildren} />
      </div>

      {products.length > 0 && (
        <>
          <h2 className="label mt-6">{s.addExtras}</h2>
          <div className="space-y-3">
            {products.map((p) => {
              const sizes = (p.sizes || "").split(",").map((z) => z.trim()).filter(Boolean);
              const cur = extras[p.id] || { qty: 0, size: sizes[1] || sizes[0] || null };
              return (
                <div key={p.id} className="rounded-2xl border border-rock/15 bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.photoUrl && <img src={p.photoUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold">{lang === "es" ? p.nameEs : p.nameEn} · €{p.price}</p>
                      <p className="text-[12px] text-rock/70">{s.payWithTour}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setExtra(p, { qty: Math.max(0, cur.qty - 1) })} className="grid h-9 w-9 place-items-center rounded-full border border-rock/20 text-lg font-bold" aria-label="−">−</button>
                      <span className="w-5 text-center text-[16px] font-extrabold">{cur.qty}</span>
                      <button type="button" onClick={() => setExtra(p, { qty: Math.min(20, cur.qty + 1) })} className="grid h-9 w-9 place-items-center rounded-full bg-rock text-lg font-bold text-sand" aria-label="+">+</button>
                    </div>
                  </div>
                  {sizes.length > 0 && cur.qty > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[13px] font-bold text-rock/75">{s.size}</span>
                      {sizes.map((z) => (
                        <button
                          key={z}
                          type="button"
                          onClick={() => setExtra(p, { size: z })}
                          className={`h-9 min-w-9 rounded-full px-2.5 text-[13px] font-bold ${cur.size === z ? "bg-rock text-sand" : "border border-rock/20"}`}
                        >
                          {z}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="name">{s.yourName}</label>
          <input id="name" required className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="phone">{s.waNum}</label>
          <input id="phone" required className="field" type="tel" placeholder="+44 7..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="email">{s.email}</label>
          <input id="email" required className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="language">{s.tourLang}</label>
            <select id="language" className="field" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="offer">{s.offerCode}</label>
            <input id="offer" className="field uppercase" placeholder={s.optional} value={offer} onChange={(e) => setOffer(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="notes">{s.notes}</label>
          <input id="notes" className="field" placeholder={s.notesPh} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        {error && <p className="rounded-2xl bg-terracotta/10 p-4 text-[14px] font-bold text-terracotta">{error}</p>}

        <div className="fixed inset-x-0 bottom-0 border-t border-black/[0.08] bg-cream/95 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-50">{s.total}</p>
              <p className="tracking-tight text-[26px] font-extrabold leading-none">
                €{quote?.total ?? "—"}
                {quote?.appliedOffer && <span className="ml-2 align-middle text-[11px] font-bold text-turquoise">{quote.appliedOffer} ✓</span>}
              </p>
            </div>
            <button disabled={busy || !slotId} className="btn btn-primary flex-1 disabled:opacity-50">
              {busy ? s.reserving : s.reserve}
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
