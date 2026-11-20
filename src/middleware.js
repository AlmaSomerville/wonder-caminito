import { NextResponse } from "next/server";

// Affiliate tracking: any visit with ?ref=CODE (or /a/CODE) drops a 30-day cookie.
// The booking API reads it, so partners get credited even if the guest books days later.
export function middleware(req) {
  const url = req.nextUrl;
  let ref = url.searchParams.get("ref");

  if (!ref && url.pathname.startsWith("/a/")) {
    ref = url.pathname.split("/")[2];
    const clean = url.clone();
    clean.pathname = "/";
    clean.search = "";
    const res = NextResponse.redirect(clean);
    setRef(res, ref);
    return res;
  }

  if (ref) {
    const res = NextResponse.next();
    setRef(res, ref);
    return res;
  }
  return NextResponse.next();
}

function setRef(res, ref) {
  if (!ref) return;
  res.cookies.set("wref", ref.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32), {
    maxAge: 30 * 24 * 3600,
    sameSite: "lax",
    path: "/",
  });
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
