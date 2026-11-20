"use client";
// Partner-facing pages (signup, login, dashboard): Spanish first, English for non-Spanish devices.
import { useEffect, useState } from "react";
import Link from "next/link";

export const P = {
  es: {
    tagline: "Programa de colaboradores",
    // signup
    h1a: "Envíanos a tus huéspedes.", h1b: "Gana con cada reserva.",
    intro: "Hoteles, campings, alojamientos y negocios locales: tienes tu propio enlace y código QR. Cada huésped que reserva a través de él se te asigna automáticamente y lo ves en directo en tu panel. La comisión se acuerda directamente con Wonder: nos facturas tú o te facturamos nosotros, como prefieras.",
    perks: ["Tu propio enlace y código QR", "Panel de reservas en directo", "El pase de las 9:00 encanta a tus huéspedes"],
    howTitle: "Cómo funciona",
    how: ["Te registras en 2 minutos.", "Te aprobamos y recibes tu enlace y tu QR.", "Tus huéspedes reservan; tú ves cada reserva."],
    formTitle: "Hazte colaborador",
    companyName: "Nombre del negocio (razón social)", contactName: "Persona de contacto",
    email: "Email (será tu usuario)", password: "Contraseña (mín. 8 caracteres)",
    taxId: "NIF / CIF", phone: "Teléfono / WhatsApp", address: "Domicilio fiscal", city: "Ciudad", postalCode: "Código postal",
    iban: "IBAN (opcional — para pagarte comisiones; si te facturamos nosotros no hace falta)",
    code: "Código de seguimiento preferido (opcional, p. ej. HOTELSOL)",
    notes: "¿Cómo quieres trabajar? (opcional)", notesPh: "p. ej. facturamos mensualmente, 10 % según lo acordado…",
    privacy: "Usamos estos datos solo para gestionar la colaboración y la facturación.",
    submit: "Solicitar colaboración", sending: "Enviando…",
    already: "¿Ya estás aprobado?", loginLink: "Acceso colaboradores",
    doneTitle: "Solicitud recibida",
    doneBody: (code) => `Tu código de seguimiento es ${code}. Nuestro equipo revisa cada solicitud: te avisaremos por WhatsApp o email cuando estés aprobado, y entonces se activan tu enlace, tu QR y tu panel.`,
    back: "Volver al inicio",
    errors: { MISSING: "Rellena todos los campos obligatorios.", PASSWORD: "La contraseña debe tener al menos 8 caracteres.", EMAIL_TAKEN: "Ese email ya tiene una cuenta. Prueba a entrar.", DEFAULT: "No se ha podido enviar. Inténtalo de nuevo." },
    // login
    loginTitle: "Acceso colaboradores", loginEmail: "Email", loginPassword: "Contraseña",
    signIn: "Entrar", signingIn: "Entrando…", newHere: "¿Nuevo?", becomePartner: "Hazte colaborador",
    loginErrors: { WRONG: "Email o contraseña incorrectos.", PENDING: "Tu cuenta está pendiente de aprobación — te contactaremos pronto.", DEFAULT: "No se ha podido entrar." },
    // dashboard
    partnerLabel: "Colaborador Wonder", logout: "Cerrar sesión",
    linkTitle: "Tu enlace de seguimiento", linkSub: "Compártelo donde quieras: web, email, WhatsApp a tus huéspedes.",
    copy: "Copiar", copied: "Copiado ✓",
    linkNote: (code) => `Los huéspedes que lo abren quedan asignados a ti durante 30 días, aunque reserven más tarde. Tu código: ${code}`,
    qrTitle: "Tu código QR", qrSub: "Imprímelo para recepción o las habitaciones: al escanearlo, el huésped llega a la web con tu código.", qrDownload: "Descargar QR",
    monthly: "Resumen mensual", none: "Aún no hay reservas. Comparte tu enlace para empezar.",
    guests: "huéspedes", booked: "reservados",
    commission: "La comisión se liquida directamente con Wonder según vuestro acuerdo (tu factura a nosotros, o la nuestra a ti).",
    yourBookings: "Tus reservas", nothing: "Nada todavía.",
    status: { PENDING: "Pendiente", CONFIRMED: "Confirmada", CANCELLED: "Cancelada", COMPLETED: "Completada" },
    locale: "es-ES",
  },
  en: {
    tagline: "Partner programme",
    h1a: "Send us your guests.", h1b: "Earn with every booking.",
    intro: "Hotels, campsites, hosts and local businesses: you get your own tracking link and QR code. Every guest who books through it is credited to you automatically, and you see it live in your own dashboard. Commission is agreed directly with Wonder: you invoice us, or we invoice you — your choice.",
    perks: ["Your own link and QR code", "Live bookings dashboard", "Guests love the 9AM slot"],
    howTitle: "How it works",
    how: ["Sign up in 2 minutes.", "We approve you and send your link and QR.", "Your guests book; you see every booking."],
    formTitle: "Become a partner",
    companyName: "Business name (legal name)", contactName: "Contact person",
    email: "Email (your login)", password: "Password (min. 8 characters)",
    taxId: "NIF / CIF (Spanish tax ID)", phone: "Phone / WhatsApp", address: "Fiscal address", city: "City", postalCode: "Postal code",
    iban: "IBAN (optional — for commission payouts; not needed if we invoice you)",
    code: "Preferred tracking code (optional, e.g. HOTELSOL)",
    notes: "How do you want to work? (optional)", notesPh: "e.g. we invoice monthly, 10% as agreed…",
    privacy: "We only use this data to manage the partnership and invoicing.",
    submit: "Apply to partner with Wonder", sending: "Sending…",
    already: "Already approved?", loginLink: "Partner login",
    doneTitle: "Application received",
    doneBody: (code) => `Your tracking code is ${code}. Our team reviews every application — we'll let you know by WhatsApp or email when you're approved, and then your link, QR code and dashboard go live.`,
    back: "Back to home",
    errors: { MISSING: "Please fill in all required fields.", PASSWORD: "Password must be at least 8 characters.", EMAIL_TAKEN: "That email already has an account. Try logging in.", DEFAULT: "Could not send. Please try again." },
    loginTitle: "Partner login", loginEmail: "Email", loginPassword: "Password",
    signIn: "Sign in", signingIn: "Signing in…", newHere: "New here?", becomePartner: "Become a partner",
    loginErrors: { WRONG: "Wrong email or password.", PENDING: "Your account is awaiting approval — we'll be in touch soon.", DEFAULT: "Could not sign in." },
    partnerLabel: "Wonder partner", logout: "Log out",
    linkTitle: "Your tracking link", linkSub: "Share it anywhere: your website, emails, WhatsApp to guests.",
    copy: "Copy", copied: "Copied ✓",
    linkNote: (code) => `Guests who open it are credited to you for 30 days, even if they book later. Your code: ${code}`,
    qrTitle: "Your QR code", qrSub: "Print it for reception or the rooms: guests scan it and land on the site with your code.", qrDownload: "Download QR",
    monthly: "Monthly summary", none: "No bookings yet. Share your link to get started.",
    guests: "guests", booked: "booked",
    commission: "Commission is settled directly with Wonder per your agreement (your invoice to us, or ours to you).",
    yourBookings: "Your bookings", nothing: "Nothing yet.",
    status: { PENDING: "Pending", CONFIRMED: "Confirmed", CANCELLED: "Cancelled", COMPLETED: "Completed" },
    locale: "en-GB",
  },
};

// Spanish-family devices (es, ca, gl, eu) → Spanish; everything else → English. A manual pick is remembered.
export function usePartnerLang() {
  const [lang, setLangState] = useState("es");
  useEffect(() => {
    const stored = localStorage.getItem("wplang");
    const device = (navigator.languages?.[0] || navigator.language || "es").toLowerCase();
    const auto = /^(es|ca|gl|eu)\b/.test(device) ? "es" : "en";
    const l = stored === "es" || stored === "en" ? stored : auto;
    setLangState(l);
    document.documentElement.lang = l;
  }, []);
  const setLang = (l) => { setLangState(l); localStorage.setItem("wplang", l); document.documentElement.lang = l; };
  return [lang, setLang];
}

// Her original two-option pill
export function LangPill({ lang, setLang }) {
  return (
    <div className="flex items-center rounded-full border border-black/10 bg-white/70 p-1" role="group" aria-label="Idioma / Language">
      {["es", "en"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1 text-[12px] font-bold tracking-wide transition ${lang === l ? "bg-rock text-white" : "text-rock/60 hover:text-rock"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function PartnerHeader({ lang, setLang, t, right }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-sand/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rock text-[11px] font-bold tracking-widest text-sand">W</span>
          <span className="min-w-0 leading-none">
            <span className="block whitespace-nowrap text-[15px] font-extrabold">Wonder Caminito</span>
            <span className="mt-1 block whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.1em] text-rock/70">{t.tagline}</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {right}
          <LangPill lang={lang} setLang={setLang} />
        </div>
      </div>
    </header>
  );
}
