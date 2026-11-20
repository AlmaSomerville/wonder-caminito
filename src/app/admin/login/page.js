"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
    });
    if (res.ok) router.push("/admin");
    else setError("Wrong password.");
  }

  return (
    <main className="mx-auto max-w-sm px-5 py-20">
      <h1 className="font-serif text-[30px] font-bold">Hola Nati 👋</h1>
      <p className="mt-1 text-[14px] opacity-70">Your panel for prices, dates, bookings and offers.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        {error && <p className="text-[14px] font-bold text-terracotta">{error}</p>}
        <button className="btn btn-dark w-full">Enter</button>
      </form>
    </main>
  );
}
