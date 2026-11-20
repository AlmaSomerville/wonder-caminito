"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "@/lib/i18n";
import { useLang, LanguageSwitcher } from "./lang";

const WA = process.env.NEXT_PUBLIC_WHATSAPP || "34600000000";
const wa = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

const secrets = [
  "Bar El Caminito — migas con vistas, solo locales",
  "Panadería Álora — mollete recién hecho 8AM",
  "Lagos de El Chorro — baño después del tour (verano)",
];

function OfferPopup({ lang }) {
  const [offer, setOffer] = useState(null);
  const [open, setOpen] = useState(false);
  const s = T[lang];
  useEffect(() => {
    if (sessionStorage.getItem("offerSeen")) return;
    fetch("/api/offers/active")
      .then((r) => r.json())
      .then((d) => {
        if (d.offer?.showPopup) {
          setOffer(d.offer);
          setTimeout(() => setOpen(true), 2500);
        }
      })
      .catch(() => {});
  }, []);
  if (!offer || !open) return null;
  // Offers are written by Nati in EN + ES; other languages read the English version.
  const title = lang === "es" ? offer.titleEs : offer.titleEn;
  const body = lang === "es" ? offer.bodyEs : offer.bodyEn;
  const close = () => { setOpen(false); sessionStorage.setItem("offerSeen", "1"); };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rock/40 p-4 sm:items-center" onClick={close}>
      <div className="card w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-terracotta p-5 text-white">
          <p className="text-[11px] font-bold tracking-widest">{s.offer}</p>
          <h3 className="font-serif text-[22px] font-bold leading-tight">{title}</h3>
        </div>
        <div className="p-5">
          {body && <p className="text-[14px] opacity-80">{body}</p>}
          {offer.discountPct > 0 && (
            <p className="mt-2 text-[13px]">
              {s.code}: <span className="rounded bg-sand px-2 py-0.5 font-mono font-bold">{offer.code}</span> · −{offer.discountPct}%
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Link href={`/book?offer=${offer.code}`} className="btn btn-primary flex-1" onClick={close}>
              {s.book}
            </Link>
            <button className="btn btn-ghost" onClick={close} aria-label="Close">✕</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useLang();
  const s = T[lang];
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-rock text-[11px] font-extrabold tracking-widest text-sand">W</span>
            <span className="text-[14px] font-extrabold tracking-wide">WONDER</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher lang={lang} setLang={setLang} />
            <Link href="/book" className="btn btn-primary !px-5 !py-2 text-[13px]">{s.book}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-rock text-sand">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{ background: "radial-gradient(70% 60% at 70% 20%, #3AA99E55 0%, transparent 60%), radial-gradient(60% 50% at 20% 90%, #D96C3E44 0%, transparent 60%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-sand/20 px-4 py-1.5 text-[12px] font-bold tracking-wide">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-turquoise" />
            {s.badge}
          </p>
          <h1 className="mt-6 font-serif text-[clamp(44px,9vw,96px)] font-extrabold leading-[0.95]">
            {s.h1a}
            <br />
            <span className="text-turquoise">{s.h1b}</span>
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-sand/85">{s.sub}</p>

          <div className="mt-8 max-w-xl rounded-3xl border border-terracotta/40 bg-terracotta/15 p-5">
            <p className="font-serif text-[20px] font-bold text-peach">{s.soldout}</p>
            <p className="mt-1 text-[14px] text-sand/85">{s.soldoutBody}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn btn-primary">{s.ctaBook}</Link>
            <a href="#why" className="btn border border-sand/25 text-sand hover:bg-sand/10">{s.ctaWhy}</a>
            <a href={wa("Hola Nati! Caminito del Rey info please 🙂")} className="btn border border-sand/25 text-sand hover:bg-sand/10">
              {s.ctaWa}
            </a>
          </div>
        </div>
      </section>

      {/* Why 9AM */}
      <section id="why" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <h2 className="font-serif text-[clamp(28px,5vw,44px)] font-bold leading-tight">{s.whyTitle}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {s.why.map(([k, v], i) => (
            <div key={k} className={`rounded-3xl p-6 ${i === 0 ? "border border-terracotta/25 bg-[#FFF1EB]" : "border border-black/[0.06] bg-sand"}`}>
              <h3 className="font-serif text-[20px] font-bold">{k}</h3>
              <p className="mt-2 text-[14px] leading-relaxed opacity-75">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Included + price */}
      <section className="bg-rock text-sand">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-20">
          <div>
            <h2 className="font-serif text-[clamp(28px,5vw,40px)] font-bold">{s.inclTitle}</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {s.incl.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px]">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-turquoise text-[10px] font-bold text-rock">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-sand p-7 text-rock">
            <span className="font-serif text-[56px] font-extrabold leading-none">€52</span>
            <p className="mt-1 text-[13px] opacity-70">{s.price}</p>
            <Link href="/book" className="btn btn-primary mt-6 w-full">{s.ctaBook}</Link>
            <p className="mt-3 text-[12px] leading-relaxed opacity-60">{s.reply}</p>
          </div>
        </div>
      </section>

      {/* Nati */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="grid items-start gap-10 md:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-serif text-[clamp(28px,5vw,40px)] font-bold leading-tight">{s.natiTitle}</h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed opacity-80">{s.natiBody}</p>
            <div className="mt-6 flex gap-4 rounded-3xl bg-rock p-5 text-sand">
              <span className="text-[24px]" aria-hidden>🐐</span>
              <p className="text-[13px] leading-relaxed opacity-90">{s.fauna}</p>
            </div>
          </div>
          <div className="rounded-3xl bg-terracotta p-7 text-white">
            <h3 className="font-serif text-[24px] font-bold">{s.secretsTitle}</h3>
            <p className="mt-1 text-[13px] text-white/80">{s.secretsSub}</p>
            <ul className="mt-5 space-y-3">
              {secrets.map((x) => (
                <li key={x} className="rounded-2xl bg-white/10 px-4 py-3 text-[14px]">{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-serif text-[clamp(28px,5vw,40px)] font-bold">{s.faqTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {s.faq.map(([q, a, href]) => (
              <div key={q} className="card p-6">
                <h3 className="text-[16px] font-bold">{q}</h3>
                <p className="mt-2 text-[14px] leading-relaxed opacity-75">{a}</p>
                {href && (
                  <Link href={href} className="mt-3 inline-block text-[13px] font-bold text-terracotta underline underline-offset-4">
                    {s.more}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner strip */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <Link href="/affiliates" className="block rounded-3xl border border-turquoise/40 bg-turquoise/10 p-6 text-center text-[15px] font-bold text-rock transition hover:bg-turquoise/20">
          {s.partner}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 py-10 md:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-rock text-[11px] font-extrabold text-sand">W</span>
            <p className="text-[12px] opacity-70">{s.footerLine}</p>
          </div>
          <nav className="flex gap-5 text-[13px] font-bold">
            <Link href="/book">{s.book}</Link>
            <Link href="/where-is-caminito-del-rey">{s.whereIs}</Link>
            <Link href="/affiliates">{s.partners}</Link>
            <a href={wa("Hola!")} aria-label="WhatsApp">WhatsApp</a>
          </nav>
        </div>
      </footer>

      <a
        href={wa("Hola Nati!")}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-2.9-1.3-4.8-4.2-5-4.4-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 .9c.3.2.5.2.6.4 0 .1 0 .7-.4 1.2Z" />
        </svg>
      </a>

      <OfferPopup lang={lang} />
    </div>
  );
}
