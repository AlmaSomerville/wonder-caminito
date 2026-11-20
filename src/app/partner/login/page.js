"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PartnerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    const res = await fetch("/api/partner/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (res.ok) router.push("/partner");
    else setError((await res.json()).message || "Login failed.");
  }

  return (
    <main className="mx-auto max-w-sm px-5 py-16">
      <Link href="/" className="text-[13px] font-bold opacity-60">← Wonder</Link>
      <h1 className="mt-3 tracking-tight text-[30px] font-bold">Partner login</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><label className="label">Email</label><input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Password</label><input className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p className="rounded-2xl bg-terracotta/10 p-4 text-[14px] font-bold text-terracotta">{error}</p>}
        <button disabled={busy} className="btn btn-dark w-full">{busy ? "Signing in…" : "Sign in"}</button>
        <p className="text-center text-[13px] text-rock/70">New here? <Link href="/affiliates" className="font-bold underline">Become a partner</Link></p>
      </form>
    </main>
  );
}
