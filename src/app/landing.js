"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { T } from "@/lib/i18n";
import { useLang, LanguageSwitcher } from "./lang";

const WA = process.env.NEXT_PUBLIC_WHATSAPP || "34604411426";
const wa = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

// Her 8 gallery concepts. Drop /public/gallery/<key>.jpg and the photo replaces the tile.
const TILES = [
  { key: "emerald-pool", bg: "#CDEFEA", accent: "#3AA99E", emoji: "💎", span: "col-span-2 md:row-span-2" },
  { key: "cave-formations", bg: "#E8E0D0", accent: "#8B7355", emoji: "🪨", span: "" },
  { key: "train-crossing", bg: "#D5E8D4", accent: "#5A7D5A", emoji: "🚂", span: "" },
  { key: "suspension-bridge", bg: "#FFE8D6", accent: "#D96C3E", emoji: "🌉", span: "md:col-span-2" },
  { key: "old-bridge-1905", bg: "#D6D0C8", accent: "#2D3A3A", emoji: "🏚️", span: "" },
  { key: "rain-adventure", bg: "#C9D6E8", accent: "#4A6FA5", emoji: "🌧️", span: "" },
  { key: "small-group", bg: "#E9D5FF", accent: "#7C3AED", emoji: "💜", span: "" },
  { key: "river-view", bg: "#BFDBFE", accent: "#2563EB", emoji: "💙", span: "col-span-2 md:col-span-1" },
];

function WaIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M12.04 2C6.58 2 2.14 6.45 2.14 11.91c0 1.75.46 3.45 1.32 4.95L2.08 22l5.3-1.39a9.87 9.87 0 004.66 1.19h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.01h-.01a8.08 8.08 0 01-4.11-1.13l-.29-.17-3.15.83.84-3.07-.19-.31a8.09 8.09 0 01-1.24-4.25c0-4.47 3.63-8.1 8.1-8.1 2.16 0 4.19.84 5.72 2.37a8.03 8.03 0 012.37 5.73c0 4.47-3.63 8.1-8.09 8.1zm4.44-6.07c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.1-.1.24-.26.36-.39.12-.13.16-.22.24-.36.08-.14.04-.27-.02-.39-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41l-.46-.01c-.16 0-.42.06-.64.27-.22.22-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

// Shows the photo once it loads; until then (or if it doesn't exist yet) her coloured tile.
function Photo({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const img = ref.current;
    if (img?.complete) img.naturalWidth > 0 ? setLoaded(true) : setFailed(true);
  }, []);
  if (failed) return null;
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}

function OfferPopup({ s, lang }) {
  const [offer, setOffer] = useState(null);
  const [open, setOpen] = useState(false);
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
  // Nati writes offers in EN + ES; the other languages see the English text.
  const title = lang === "es" ? offer.titleEs : offer.titleEn;
  const body = lang === "es" ? offer.bodyEs : offer.bodyEn;
  const close = () => { setOpen(false); sessionStorage.setItem("offerSeen", "1"); };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-rock/40 p-4 sm:items-center" onClick={close}>
      <div className="w-full max-w-sm overflow-hidden rounded-[24px] bg-cream" onClick={(e) => e.stopPropagation()}>
        <div className="bg-terracotta p-6 text-white">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/85">{s.offer}</p>
          <h3 className="mt-1 text-[22px] font-extrabold leading-tight">{title}</h3>
        </div>
        <div className="p-6">
          {body && <p className="text-[15px] leading-[1.55] text-rock/85">{body}</p>}
          {offer.discountPct > 0 && (
            <p className="mt-3 text-[14px]">
              {s.code}: <span className="rounded-md bg-sand px-2 py-0.5 font-bold">{offer.code}</span> · −{offer.discountPct}%
            </p>
          )}
          <div className="mt-5 flex gap-2">
            <Link href={`/book?offer=${offer.code}`} onClick={close} className="grid h-12 flex-1 place-items-center rounded-full bg-rock text-[13px] font-bold uppercase tracking-[0.06em] text-white">
              {s.book}
            </Link>
            <button onClick={close} aria-label="Close" className="grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-sand">✕</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing({ price = 52 }) {
  const [lang, setLang] = useLang();
  const s = T[lang];
  const euro = `€${Number.isInteger(price) ? price : price.toFixed(2)}`;
  const label = "text-[12px] font-bold uppercase tracking-[0.14em]";

  return (
    <div className="min-h-screen overflow-x-clip bg-sand text-rock">
      {/* Header — her lockup */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-sand/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-5 md:px-10">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rock text-[11px] font-bold tracking-widest text-sand">W</span>
            <span className="min-w-0 leading-none">
              <span className="block whitespace-nowrap text-[15px] font-extrabold tracking-[-0.01em]">Wonder Caminito</span>
              <span className="mt-1 hidden text-[10.5px] font-semibold uppercase tracking-[0.12em] text-rock/70 sm:block">{s.tagline}</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 md:gap-6">
            <nav className="hidden items-center gap-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-rock/75 lg:flex">
              <a href="#why" className="hover:text-rock">{s.navFirst}</a>
              <a href="#tour" className="hover:text-rock">{s.navTour}</a>
              <Link href="/where-is-caminito-del-rey" className="hover:text-rock">{s.whereIs}</Link>
            </nav>
            <LanguageSwitcher lang={lang} setLang={setLang} />
            <Link href="/book" className="grid h-9 place-items-center rounded-full bg-terracotta px-4 text-[12px] font-bold uppercase tracking-[0.06em] text-white">
              {s.book}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — her photo is the star */}
      <section className="relative h-[calc(100svh-64px)] min-h-[560px] w-full overflow-hidden bg-black">
        <Image
          src="/hero.jpg"
          alt="Caminito del Rey boardwalk in the misty Desfiladero de los Gaitanes gorge, early morning"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "50% 62%" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 42%, rgba(0,0,0,0.03) 66%, rgba(0,0,0,0.12) 100%)" }}
        />
        <div className="relative z-10 flex h-full flex-col justify-end pb-[9vh]">
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-10">
            <p className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-turquoise" />
              {s.badge}
            </p>
            <h1 className="font-display text-[clamp(36px,10vw,88px)] font-[800] leading-[0.92] tracking-[-0.01em] text-white [text-wrap:balance] drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
              {s.h1a}
              <br />
              {s.h1b}
            </h1>
            <p className="mt-6 max-w-[560px] text-[16px] leading-[1.55] text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] md:text-[18px]">
              {s.sub}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="grid h-12 place-items-center rounded-full bg-white px-7 text-[13px] font-bold uppercase tracking-[0.08em] text-rock transition hover:bg-sand">
                {s.ctaBook}
              </Link>
              <a href="#why" className="grid h-12 place-items-center rounded-full border border-white/50 px-7 text-[13px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-md transition hover:bg-white/10">
                {s.ctaWhy}
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-5 left-1/2 h-12 w-px -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 opacity-70" aria-hidden />
      </section>

      {/* Meet Nati + Why 9AM */}
      <section className="mx-auto grid max-w-[1280px] items-start gap-12 px-5 py-16 md:gap-20 md:px-10 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-turquoise to-rock">
              <span className="absolute inset-0 grid place-items-center font-display text-[20px] font-bold text-white">N</span>
              <Photo src="/nati.jpg" alt="Nati, official Caminito del Rey guide" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[17px] font-extrabold leading-none">{s.guideName}</p>
              <p className="mt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-rock/70">{s.meetGuide}</p>
            </div>
            <div className="ml-auto hidden gap-2 md:flex">
              <span className="rounded-full bg-turquoise/12 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#2b8a80]">{s.chipLocal}</span>
              <span className="rounded-full bg-terracotta/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-terracotta">{s.chipOfficial}</span>
            </div>
          </div>

          <h2 className="font-display text-[clamp(30px,5vw,46px)] font-bold leading-[1.02] tracking-[-0.01em] [text-wrap:balance]">
            {s.introH2}
          </h2>
          <p className="mt-6 max-w-[62ch] text-[16px] leading-[1.7] text-rock/85 md:text-[17px]">{s.introBody}</p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {s.stats.map(([k, v, d]) => (
              <div key={k} className="rounded-2xl border border-black/[0.06] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-rock/60">{k}</p>
                <p className="mt-1.5 text-[22px] font-extrabold leading-none tracking-tight">{v}</p>
                <p className="mt-1.5 text-[12.5px] leading-snug text-rock/75">{d}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4 rounded-[20px] bg-rock p-5 text-sand">
            <span className="text-[24px]" aria-hidden>🐐</span>
            <p className="text-[14px] leading-[1.6]">{s.fauna}</p>
          </div>
        </div>

        <div id="why" className="scroll-mt-20 overflow-hidden rounded-[28px] border border-black/[0.06] bg-white">
          <div className="p-6 md:p-8">
            <p className={`inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3 py-1.5 text-terracotta ${label} !text-[11.5px] !tracking-[0.1em]`}>
              <span aria-hidden>●</span> {s.whyTitle}
            </p>
            <div className="mt-6 space-y-4">
              {[[0, "☀️"], [1, "🐐🦅"]].map(([i, icon]) => (
                <div key={i} className="relative overflow-hidden rounded-[18px] border border-terracotta/20 bg-peach p-5">
                  <span className="absolute -right-5 -top-6 text-[64px] opacity-10" aria-hidden>{icon.slice(0, 2)}</span>
                  <div className="relative flex gap-3">
                    <span className="text-[22px] leading-none" aria-hidden>{icon}</span>
                    <div>
                      <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-terracotta">{s.why[i][0]}</h3>
                      <p className="mt-1 text-[15px] font-medium leading-[1.5]">{s.why[i][1]}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[[2, "🤫"], [3, "🌡️"]].map(([i, icon]) => (
                  <div key={i} className="rounded-2xl border border-black/[0.04] bg-sand p-4">
                    <span className="text-[16px]" aria-hidden>{icon}</span>
                    <h3 className="mt-2 text-[13px] font-bold uppercase tracking-[0.06em]">{s.why[i][0]}</h3>
                    <p className="mt-1 text-[14px] leading-[1.5] text-rock/80">{s.why[i][1]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-black/[0.06] bg-sand px-6 py-4 md:px-8">
            <p className={`${label} !text-[11.5px] text-rock/70`}>{s.whyFooter}</p>
            <p className="text-[12px] font-bold">max 10</p>
          </div>
        </div>
      </section>

      {/* Tour + price */}
      <section id="tour" className="scroll-mt-16 bg-rock text-sand">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 md:px-10 md:py-20 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className={`${label} text-turquoise`}>{s.tourLabel}</p>
            <h2 className="mt-3 font-display text-[clamp(34px,6vw,56px)] font-bold leading-[0.98] tracking-[-0.015em] [text-wrap:balance]">
              {s.inclTitle}
            </h2>
            <div className="mt-8 flex items-baseline gap-4">
              <span className="font-display text-[clamp(64px,12vw,92px)] font-[800] leading-none tracking-[-0.02em]">{euro}</span>
              <span className="max-w-[220px] text-[15px] leading-[1.4] text-sand/85">{s.price}</span>
            </div>
            <ul className="mt-8 flex max-w-[680px] flex-wrap gap-2.5">
              {s.incl.map((item) => (
                <li key={item} className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.07] px-4 py-2 text-[14px]">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-turquoise text-[10px] font-bold text-rock">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] bg-cream p-7 text-rock md:p-8">
            <p className={`${label} !text-[11.5px] text-terracotta`}>{s.cardLabel}</p>
            <p className="mt-3 text-[26px] font-extrabold leading-[1.15] tracking-tight">{s.soldout}</p>
            <p className="mt-2 text-[15px] leading-[1.55] text-rock/80">{s.soldoutBody}</p>
            <div className="mt-6 flex gap-2">
              <Link href="/book" className="grid h-12 flex-1 place-items-center rounded-full bg-rock text-[13px] font-bold uppercase tracking-[0.06em] text-white transition hover:bg-black">
                {s.book}
              </Link>
              <a href={wa("Hola Nati! Caminito del Rey 🙂")} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-black/10 bg-sand text-[13px] font-bold uppercase tracking-[0.06em] transition hover:bg-white">
                <WaIcon className="h-4 w-4" /> WhatsApp
              </a>
            </div>
            <p className="mt-4 text-[13px] leading-[1.5] text-rock/70">{s.reply}</p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 md:py-24">
        <p className={`${label} text-rock/65`}>{s.galleryLabel}</p>
        <h2 className="mt-2 font-display text-[clamp(32px,5vw,48px)] font-bold leading-[0.98] tracking-[-0.015em]">{s.galleryTitle}</h2>
        <div className="mt-10 grid auto-rows-[170px] grid-cols-2 gap-3 md:auto-rows-[240px] md:grid-cols-4 md:gap-4">
          {TILES.map((t, i) => (
            <div key={t.key} className={`group relative overflow-hidden rounded-[20px] border border-black/5 ${t.span}`} style={{ background: t.bg }}>
              <div className="absolute inset-0 grid place-items-center" aria-hidden>
                <span className="grid h-24 w-24 place-items-center rounded-full text-[40px]" style={{ background: `${t.accent}26` }}>{t.emoji}</span>
              </div>
              <Photo src={`/gallery/${t.key}.jpg`} alt={s.gallery[i]} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur">
                {s.gallery[i]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — kept for Google */}
      <section className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 md:py-20">
          <h2 className="font-display text-[clamp(32px,5vw,46px)] font-bold leading-[0.98] tracking-[-0.015em]">{s.faqTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {s.faq.map(([q, a, href]) => (
              <div key={q} className="rounded-[20px] border border-black/[0.06] bg-sand p-6">
                <h3 className="text-[17px] font-extrabold leading-snug">{q}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-rock/85">{a}</p>
                {href && (
                  <Link href={href} className="mt-3 inline-block text-[14px] font-bold text-terracotta underline underline-offset-4">
                    {s.more}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Her three closing cards */}
      <section className="mx-auto grid max-w-[1280px] gap-5 px-5 py-16 md:px-10 md:py-20 lg:grid-cols-3">
        <div className="rounded-[24px] border border-black/10 bg-white p-7">
          <p className={`${label} text-rock/65`}>{s.secretsTitle}</p>
          <p className="mt-3 text-[22px] font-extrabold leading-[1.15] tracking-tight">{s.secretsH}</p>
          <ul className="mt-5 space-y-3 text-[15px] leading-[1.5]">
            {s.secrets.map((x, i) => (
              <li key={x} className="flex gap-2.5">
                <span aria-hidden>{["🥘", "☕", "🏊‍♀️"][i]}</span>
                <span className="text-rock/90">{x}</span>
              </li>
            ))}
          </ul>
          <span className="mt-6 inline-flex rounded-full border border-black/10 bg-sand px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-rock/75">{s.secretsChip}</span>
        </div>

        <div className="relative overflow-hidden rounded-[24px] bg-rock p-7 text-sand">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-turquoise/20 blur-2xl" aria-hidden />
          <div className="relative">
            <p className={`${label} text-turquoise`}>Extras</p>
            <p className="mt-3 text-[22px] font-extrabold leading-[1.15] tracking-tight">{s.extrasTitle}</p>
            <p className="mt-3 text-[15px] leading-[1.6] text-sand/85">{s.extrasBody}</p>
            <div className="mt-5 flex gap-2">
              {["S", "M", "L", "XL"].map((z) => (
                <a key={z} href={wa(`Hola Nati! T-shirt ${z}?`)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[13px] font-bold transition hover:bg-white hover:text-rock">
                  {z}
                </a>
              ))}
            </div>
            <span className="mt-6 inline-block rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-sand/75">{s.extrasChip}</span>
          </div>
        </div>

        <div className="rounded-[24px] bg-terracotta p-7 text-white">
          <p className={`${label} text-white/85`}>{s.wonderLabel}</p>
          <p className="mt-3 text-[22px] font-extrabold leading-[1.15] tracking-tight">{s.natiTitle}</p>
          <p className="mt-3 text-[15px] leading-[1.6] text-white/90">{s.wonderBody}</p>
          <a href={wa("Hola Nati!")} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-bold uppercase tracking-[0.06em] text-terracotta transition hover:bg-sand">
            <WaIcon className="h-4 w-4" /> {s.chatNati}
          </a>
        </div>
      </section>

      {/* Partners */}
      <section className="mx-auto max-w-[1280px] px-5 pb-16 md:px-10">
        <Link href="/affiliates" className="block rounded-[24px] border border-turquoise/40 bg-turquoise/10 p-6 text-center text-[16px] font-bold transition hover:bg-turquoise/20">
          {s.partner}
        </Link>
      </section>

      {/* Footer — hers */}
      <footer className="border-t border-black/10 bg-cream">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-5 py-10 md:flex-row md:px-10">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-rock text-[11px] font-bold text-sand">W</span>
            <div className="text-[13px] leading-[1.35]">
              <p className="font-bold">Wonder Caminito · Nati</p>
              <p className="text-rock/70">{s.tagline}</p>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[14px] font-bold">
            <Link href="/book">{s.book}</Link>
            <Link href="/where-is-caminito-del-rey">{s.whereIs}</Link>
            <Link href="/affiliates">{s.partners}</Link>
          </nav>
          <p className="text-center text-[12.5px] leading-[1.5] text-rock/70 md:text-right">
            © {new Date().getFullYear()} Wonder Caminito · {s.footerLine}
            <br />
            {s.footerFauna}
          </p>
        </div>
      </footer>

      <a
        href={wa("Hola Nati!")}
        aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_rgba(37,211,102,0.4)] transition hover:scale-[1.05]"
      >
        <WaIcon className="h-7 w-7" />
      </a>

      <OfferPopup s={s} lang={lang} />
    </div>
  );
}
