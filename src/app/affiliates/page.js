"use client";
import { useState } from "react";
import Link from "next/link";

export default function AffiliatesPage() {
  const [form, setForm] = useState({
    companyName: "", contactName: "", email: "", phone: "", password: "",
    taxId: "", address: "", city: "", postalCode: "", iban: "", notes: "", code: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const res = await fetch("/api/affiliates/signup", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      setDone(data);
    } catch (err) {
      setError(err.message || "Could not sign up.");
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-turquoise text-3xl text-white">✓</div>
        <h1 className="mt-6 font-serif text-[30px] font-bold">Application received</h1>
        <p className="mt-3 text-[15px] leading-relaxed opacity-75">
          Your tracking code is <span className="rounded bg-sand px-2 py-0.5 font-mono font-bold">{done.code}</span>.
          Nati reviews every partner personally — you'll get a WhatsApp or email when you're approved,
          and then your link and dashboard go live at <b>/partner</b>.
        </p>
        <Link href="/" className="btn btn-dark mt-8">Back to home</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="text-[13px] font-bold opacity-60">← Wonder</Link>
      <h1 className="mt-3 font-serif text-[clamp(30px,6vw,44px)] font-bold leading-tight">
        Send us your guests.<br />Earn with every booking.
      </h1>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed opacity-80">
        Hotels, campsites, hosts and local businesses: you get a personal tracking link and QR.
        Every guest who books through it is credited to you — you see it live in your own dashboard.
        Commission terms are agreed directly with Nati (you invoice us, or we invoice you — your choice).
      </p>
      <ul className="mt-6 grid gap-3 text-[14px] sm:grid-cols-3">
        {["Your own tracking link", "Live bookings dashboard", "Guests love the 9AM slot"].map((x) => (
          <li key={x} className="rounded-2xl bg-sand px-4 py-3 font-bold">{x}</li>
        ))}
      </ul>

      <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
        <h2 className="font-serif text-[22px] font-bold">Become a partner</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Business name (razón social)</label><input required className="field" value={form.companyName} onChange={set("companyName")} /></div>
          <div><label className="label">Contact person</label><input required className="field" value={form.contactName} onChange={set("contactName")} /></div>
          <div><label className="label">Email (your login)</label><input required type="email" className="field" value={form.email} onChange={set("email")} /></div>
          <div><label className="label">Password</label><input required type="password" minLength={8} className="field" value={form.password} onChange={set("password")} /></div>
          <div><label className="label">NIF / CIF</label><input required className="field" value={form.taxId} onChange={set("taxId")} /></div>
          <div><label className="label">Phone / WhatsApp</label><input className="field" value={form.phone} onChange={set("phone")} /></div>
          <div className="sm:col-span-2"><label className="label">Fiscal address</label><input className="field" value={form.address} onChange={set("address")} /></div>
          <div><label className="label">City</label><input className="field" value={form.city} onChange={set("city")} /></div>
          <div><label className="label">Postal code</label><input className="field" value={form.postalCode} onChange={set("postalCode")} /></div>
          <div className="sm:col-span-2"><label className="label">IBAN (optional — for payouts, if we invoice you it's not needed)</label><input className="field" value={form.iban} onChange={set("iban")} /></div>
          <div className="sm:col-span-2"><label className="label">Preferred tracking code (optional, e.g. HOTELSOL)</label><input className="field uppercase" maxLength={20} value={form.code} onChange={set("code")} /></div>
          <div className="sm:col-span-2"><label className="label">How do you want to work? (optional)</label><input className="field" placeholder="e.g. we invoice monthly, 10% discussed with Nati…" value={form.notes} onChange={set("notes")} /></div>
        </div>
        {error && <p className="rounded-2xl bg-terracotta/10 p-4 text-[14px] font-bold text-terracotta">{error}</p>}
        <button disabled={busy} className="btn btn-primary w-full disabled:opacity-50">{busy ? "Sending…" : "Apply to partner with Wonder"}</button>
        <p className="text-center text-[13px] opacity-60">
          Already approved? <Link href="/partner/login" className="font-bold underline">Partner login</Link>
        </p>
      </form>
    </main>
  );
}
