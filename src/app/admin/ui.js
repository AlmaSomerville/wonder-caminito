"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const tabs = [
  ["/admin", "Resumen"],
  ["/admin/bookings", "Reservas"],
  ["/admin/availability", "Fechas"],
  ["/admin/pricing", "Precios y reglas"],
  ["/admin/offers", "Ofertas"],
  ["/admin/team", "Equipo"],
  ["/admin/products", "Productos"],
  ["/admin/photos", "Fotos"],
  ["/admin/affiliates", "Colaboradores"],
];

export function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <div className="sticky top-0 z-30 border-b border-black/[0.06] bg-sand/95 backdrop-blur">
      <div className="mx-auto max-w-4xl px-5">
        <div className="flex items-center justify-between py-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-rock text-[10px] font-bold text-sand">W</span>
            <span className="text-[14px] font-extrabold">Panel Wonder</span>
          </Link>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-[13px] font-bold text-rock/70">Ver la web ↗</a>
            <button
              className="text-[13px] font-bold text-rock/70"
              onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
        <nav className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: "none" }}>
          {tabs.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[14px] font-bold ${path === href ? "bg-rock text-sand" : "hover:bg-rock/5"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

// Botón genérico: hace la llamada y refresca la página
export function ActionButton({ url, method = "PATCH", body, children, className = "btn btn-ghost !py-2 text-[14px]", confirmText }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      className={className + " disabled:opacity-50"}
      onClick={async () => {
        if (confirmText && !window.confirm(confirmText)) return;
        setBusy(true);
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        setBusy(false);
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          window.alert(d.message || "No se ha podido guardar. Inténtalo de nuevo.");
        }
        router.refresh();
      }}
    >
      {children}
    </button>
  );
}
