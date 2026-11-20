"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const tabs = [
  ["/admin", "Overview"],
  ["/admin/bookings", "Bookings"],
  ["/admin/availability", "Availability"],
  ["/admin/pricing", "Prices & rules"],
  ["/admin/offers", "Offers"],
  ["/admin/affiliates", "Partners"],
];

export function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <div className="sticky top-0 z-30 border-b border-black/[0.06] bg-cream/95 backdrop-blur">
      <div className="mx-auto max-w-4xl px-5">
        <div className="flex items-center justify-between py-3">
          <p className="text-[13px] font-extrabold tracking-wide">WONDER · Nati's panel</p>
          <button
            className="text-[12px] font-bold opacity-60"
            onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); }}
          >
            Log out
          </button>
        </div>
        <nav className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: "none" }}>
          {tabs.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-bold ${path === href ? "bg-rock text-sand" : "hover:bg-rock/5"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

// Generic "do a POST/PATCH and refresh" button
export function ActionButton({ url, method = "PATCH", body, children, className = "btn btn-ghost !py-2 text-[13px]", confirmText }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      className={className + " disabled:opacity-50"}
      onClick={async () => {
        if (confirmText && !window.confirm(confirmText)) return;
        setBusy(true);
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        setBusy(false);
        router.refresh();
      }}
    >
      {children}
    </button>
  );
}
