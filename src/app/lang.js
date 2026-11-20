"use client";
import { useEffect, useRef, useState } from "react";
import { LANGS, pickLang } from "@/lib/i18n";

// Device language on first visit → English fallback → remembered forever after any manual pick.
export function useLang() {
  const [lang, setLangState] = useState("en");
  useEffect(() => {
    const stored = localStorage.getItem("wlang");
    const detected = pickLang(stored || navigator.language || navigator.languages?.[0]);
    setLangState(detected);
    document.documentElement.lang = detected;
  }, []);
  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem("wlang", l);
    document.documentElement.lang = l;
  };
  return [lang, setLang];
}

// One tap to open, one tap to pick. Flag + native name, current one ticked.
export function LanguageSwitcher({ lang, setLang, dark = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold ${
          dark ? "border-sand/25 text-sand" : "border-rock/15"
        }`}
      >
        <span aria-hidden>{current.flag}</span>
        <span className="uppercase">{current.code}</span>
        <span className={`text-[9px] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>▾</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-black/10 bg-white py-1 shadow-xl"
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={l.code === lang}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] text-rock hover:bg-sand ${
                l.code === lang ? "bg-sand font-bold" : ""
              }`}
            >
              <span aria-hidden>{l.flag}</span>
              <span className="flex-1">{l.name}</span>
              {l.code === lang && <span className="text-turquoise" aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
