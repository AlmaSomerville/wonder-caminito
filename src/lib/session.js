// Tiny signed-cookie sessions (no extra deps). HMAC-SHA256 with AUTH_SECRET.
import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";

function sign(data) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function makeToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function readToken(token) {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  const expected = sign(data);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

const WEEK = 7 * 24 * 3600 * 1000;

export function setSessionCookie(name, payload) {
  cookies().set(name, makeToken({ ...payload, exp: Date.now() + WEEK }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK / 1000,
  });
}

export function clearSessionCookie(name) {
  cookies().set(name, "", { path: "/", maxAge: 0 });
}

export function getAdminSession() {
  const p = readToken(cookies().get("wadmin")?.value);
  return p?.role === "admin" ? p : null;
}

export function getPartnerSession() {
  const p = readToken(cookies().get("wpartner")?.value);
  return p?.role === "partner" ? p : null;
}
