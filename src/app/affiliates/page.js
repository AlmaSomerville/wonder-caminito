"use client";
import { useState } from "react";
import Link from "next/link";
import { P, usePartnerLang, PartnerHeader } from "../partner/i18n";

const EMPTY = {
  companyName: "", contactName: "", email: "", phone: "", password: "",
  taxId: "", address: "", city: "", postalCode: "", iban: "", notes: "", code: "",
};

export default function AffiliatesPage() {
  const [lang, setLang] = usePartnerLang();
  const t = P[lang];
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null); // error key from the API
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const res = await fetch("/api/affiliates/signup", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "DEFAULT"); return; }
      setDone(data);
    } catch {
      setError("DEFAULT");
    } finally { setBusy(false); }
  }

  // Called as a function (not <Field/>) so inputs keep focus while typing
  const field = ({ k, label, type = "text", required, span, ...rest }) => (
    <div key={k} className={span ? "sm:col-span-2" : ""}>
      <label className="label" htmlFor={k}>{label}{required && <span className="text-terracotta"> *</span>}</label>
      <input id={k} type={type} required={required} className="field" value={form[k]} onChange={set(k)} {...rest} />
    </div>
  );

  return (
    <div className="min-h-screen bg-sand">
      <PartnerHeader lang={lang} setLang={setLang} t={t} />

      {done ? (
        <main className="mx-auto max-w-md px-5 py-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-turquoise text-3xl text-white">✓</div>
          <h1 className="mt-6 text-[30px] font-extrabold tracking-tight">{t.doneTitle}</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-rock/85">{t.doneBody(done.code)}</p>
          <Link href="/" className="btn btn-dark mt-8">{t.back}</Link>
        </main>
      ) : (
        <main className="mx-auto max-w-3xl px-5 py-10 md:py-14">
          <h1 className="font-display text-[clamp(32px,6vw,48px)] font-bold leading-[1.02] tracking-[-0.01em]">
            {t.h1a}
            <br />
            {t.h1b}
          </h1>
          <p className="mt-4 max-w-[62ch] text-[16px] leading-[1.65] text-rock/85">{t.intro}</p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {t.perks.map((x) => (
              <li key={x} className="flex items-center gap-2.5 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-[14px] font-bold">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-turquoise text-[10px] text-white">✓</span>
                {x}
              </li>
            ))}
          </ul>

          <section className="mt-8 rounded-[24px] bg-rock p-6 text-sand md:p-7">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-turquoise">{t.howTitle}</h2>
            <ol className="mt-4 grid gap-4 sm:grid-cols-3">
              {t.how.map((x, i) => (
                <li key={x} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[14px] font-extrabold">{i + 1}</span>
                  <span className="pt-1 text-[15px] leading-snug">{x}</span>
                </li>
              ))}
            </ol>
          </section>

          <form onSubmit={submit} className="card mt-8 space-y-4 p-6 md:p-7">
            <h2 className="text-[22px] font-extrabold tracking-tight">{t.formTitle}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {field({ k: "companyName", label: t.companyName, required: true, autoComplete: "organization" })}
              {field({ k: "contactName", label: t.contactName, required: true, autoComplete: "name" })}
              {field({ k: "email", label: t.email, type: "email", required: true, autoComplete: "email" })}
              {field({ k: "password", label: t.password, type: "password", required: true, minLength: 8, autoComplete: "new-password" })}
              {field({ k: "taxId", label: t.taxId, required: true })}
              {field({ k: "phone", label: t.phone, type: "tel", autoComplete: "tel" })}
              {field({ k: "address", label: t.address, span: true, autoComplete: "street-address" })}
              {field({ k: "city", label: t.city, autoComplete: "address-level2" })}
              {field({ k: "postalCode", label: t.postalCode, autoComplete: "postal-code" })}
              {field({ k: "iban", label: t.iban, span: true })}
              {field({ k: "code", label: t.code, span: true, maxLength: 20, className: "field uppercase" })}
              {field({ k: "notes", label: t.notes, span: true, placeholder: t.notesPh })}
            </div>
            <p className="text-[13px] text-rock/70">{t.privacy}</p>
            {error && <p className="rounded-2xl bg-terracotta/10 p-4 text-[15px] font-bold text-terracotta">{t.errors[error] || t.errors.DEFAULT}</p>}
            <button disabled={busy} className="btn btn-primary w-full disabled:opacity-50">{busy ? t.sending : t.submit}</button>
            <p className="text-center text-[14px] text-rock/80">
              {t.already} <Link href="/partner/login" className="font-bold underline">{t.loginLink}</Link>
            </p>
          </form>
        </main>
      )}
    </div>
  );
}
