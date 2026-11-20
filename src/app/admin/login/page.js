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
    else setError("Contraseña incorrecta.");
  }

  return (
    <main className="mx-auto max-w-sm px-5 py-20">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-rock text-[13px] font-bold text-sand">W</span>
      <h1 className="mt-5 text-[30px] font-extrabold tracking-tight">Hola Nati 👋</h1>
      <p className="mt-1 text-[15px] text-rock/80">Tu panel: reservas, fechas, precios, equipo y más.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input className="field" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        {error && <p className="text-[14px] font-bold text-terracotta">{error}</p>}
        <button className="btn btn-dark w-full">Entrar</button>
      </form>
    </main>
  );
}
