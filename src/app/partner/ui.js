"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { P, usePartnerLang, PartnerHeader } from "./i18n";

const BADGE = {
  PENDING: "bg-peach text-terracotta",
  CONFIRMED: "bg-turquoise/15 text-[#2b8a80]",
  CANCELLED: "bg-black/5 text-rock/60",
  COMPLETED: "bg-rock text-sand",
};

export function PartnerView({ company, code, link, bookings }) {
  const router = useRouter();
  const [lang, setLang] = usePartnerLang();
  const t = P[lang];
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState(null);

  useEffect(() => {
    QRCode.toDataURL(link, { width: 640, margin: 2, color: { dark: "#2D3A3A", light: "#FFFFFF" } }).then(setQr).catch(() => {});
  }, [link]);

  const months = useMemo(() => {
    const m = {};
    for (const b of bookings) {
      if (b.status === "CANCELLED") continue;
      m[b.month] ??= { bookings: 0, pax: 0, eur: 0 };
      m[b.month].bookings++;
      m[b.month].pax += b.pax;
      m[b.month].eur += b.total;
    }
    return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0]));
  }, [bookings]);

  const monthName = (key) => {
    const [y, mo] = key.split("-");
    const s = new Date(+y, +mo - 1, 15).toLocaleDateString(t.locale, { month: "long", year: "numeric" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const day = (d) => new Date(d + "T12:00:00").toLocaleDateString(t.locale, { weekday: "short", day: "numeric", month: "short" });

  const logout = (
    <button
      className="hidden rounded-full px-3 py-1.5 text-[13px] font-bold text-rock/70 sm:block"
      onClick={async () => { await fetch("/api/partner/logout", { method: "POST" }); router.push("/partner/login"); }}
    >
      {t.logout}
    </button>
  );

  return (
    <div className="min-h-screen bg-sand">
      <PartnerHeader lang={lang} setLang={setLang} t={t} right={logout} />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-rock/65">{t.partnerLabel}</p>
        <h1 className="text-[30px] font-extrabold leading-tight tracking-tight">{company}</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <section className="card min-w-0 p-5">
            <h2 className="text-[17px] font-extrabold">{t.linkTitle}</h2>
            <p className="mt-1 text-[14px] text-rock/80">{t.linkSub}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate rounded-2xl bg-sand px-4 py-3 text-[14px] font-semibold">{link.replace(/^https?:\/\//, "")}</span>
              <button
                className="btn btn-dark !px-4 !py-2.5 text-[14px]"
                onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              >
                {copied ? t.copied : t.copy}
              </button>
            </div>
            <p className="mt-3 text-[13px] text-rock/75">{t.linkNote(code)}</p>
          </section>

          <section className="card flex min-w-0 gap-4 p-5 md:flex-col md:items-start">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-white md:h-32 md:w-32">
              {qr && <img src={qr} alt={`QR ${code}`} className="h-full w-full" />}
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold">{t.qrTitle}</h2>
              <p className="mt-1 text-[14px] text-rock/80">{t.qrSub}</p>
              {qr && (
                <a href={qr} download={`wonder-qr-${code}.png`} className="btn btn-ghost mt-3 !py-2 text-[14px]">{t.qrDownload}</a>
              )}
            </div>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="text-[22px] font-extrabold tracking-tight">{t.monthly}</h2>
          {months.length === 0 ? (
            <p className="mt-2 text-[15px] text-rock/80">{t.none}</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {months.map(([m, v]) => (
                <div key={m} className="card p-4">
                  <p className="text-[13px] font-bold text-rock/70">{monthName(m)}</p>
                  <p className="text-[28px] font-extrabold leading-tight">{v.bookings}</p>
                  <p className="text-[13px] text-rock/80">{v.pax} {t.guests} · {v.eur.toFixed(0)} € {t.booked}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[13px] text-rock/75">{t.commission}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-[22px] font-extrabold tracking-tight">{t.yourBookings}</h2>
          <div className="mt-3 space-y-2">
            {bookings.length === 0 && <p className="text-[15px] text-rock/80">{t.nothing}</p>}
            {bookings.map((b) => (
              <div key={b.id} className="card flex flex-wrap items-center justify-between gap-2 p-4 text-[15px]">
                <div>
                  <p className="font-bold"><span className="capitalize">{day(b.date)}</span> · {b.time} — {b.name}</p>
                  <p className="text-[13px] text-rock/75">{b.pax} {t.guests} · {b.total} € · {b.ref}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${BADGE[b.status]}`}>{t.status[b.status]}</span>
              </div>
            ))}
          </div>
        </section>

        <button
          className="mt-10 text-[14px] font-bold text-rock/70 underline sm:hidden"
          onClick={async () => { await fetch("/api/partner/logout", { method: "POST" }); router.push("/partner/login"); }}
        >
          {t.logout}
        </button>
      </main>
    </div>
  );
}
