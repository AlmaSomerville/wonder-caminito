"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { P, usePartnerLang, PartnerHeader } from "../i18n";

export default function PartnerLogin() {
  const router = useRouter();
  const [lang, setLang] = usePartnerLang();
  const t = P[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null); setBusy(true);
    const res = await fetch("/api/partner/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (res.ok) router.push("/partner");
    else setError((await res.json().catch(() => ({}))).error || "DEFAULT");
  }

  return (
    <div className="min-h-screen bg-sand">
      <PartnerHeader lang={lang} setLang={setLang} t={t} />
      <main className="mx-auto max-w-sm px-5 py-14">
        <h1 className="text-[30px] font-extrabold tracking-tight">{t.loginTitle}</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label" htmlFor="email">{t.loginEmail}</label><input id="email" className="field" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="label" htmlFor="password">{t.loginPassword}</label><input id="password" className="field" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p className="rounded-2xl bg-terracotta/10 p-4 text-[15px] font-bold text-terracotta">{t.loginErrors[error] || t.loginErrors.DEFAULT}</p>}
          <button disabled={busy} className="btn btn-dark w-full disabled:opacity-50">{busy ? t.signingIn : t.signIn}</button>
          <p className="text-center text-[14px] text-rock/80">{t.newHere} <Link href="/affiliates" className="font-bold underline">{t.becomePartner}</Link></p>
        </form>
      </main>
    </div>
  );
}
