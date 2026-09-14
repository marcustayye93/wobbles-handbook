import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { FAMILY_PROFILES, type FamilyProfile } from "./family";

export const FAMILY_COOKIE = "paddington_family";
export const FAMILY_CODE = (process.env.FAMILY_CODE || "HELLOTHERE").trim();
const SECRET = process.env.FAMILY_SESSION_SECRET || "paddington-family-handbook-preview";
export type FamilySession = { ok: true; profile: FamilyProfile; iat: number };

function sign(payload: string) { return createHmac("sha256", SECRET).update(payload).digest("base64url"); }
export function encodeSession(session: FamilySession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function decodeSession(token: string | undefined): FamilySession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (parsed?.ok === true && FAMILY_PROFILES.includes(parsed.profile)) return parsed as FamilySession;
  } catch { return null; }
  return null;
}
function parseCookieHeader(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("="); if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}
export function readSession(req: Request): FamilySession | null {
  return decodeSession(parseCookieHeader(req.headers.cookie)[FAMILY_COOKIE]);
}
export function codeMatches(input: string) {
  const a = Buffer.from(input.trim()); const b = Buffer.from(FAMILY_CODE);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
export function setSessionCookie(res: Response, session: FamilySession, secure: boolean) {
  res.cookie(FAMILY_COOKIE, encodeSession(session), {
    httpOnly: true, path: "/", sameSite: secure ? "none" : "lax", secure, maxAge: 1000 * 60 * 60 * 24 * 365,
  });
}
export function clearSessionCookie(res: Response, secure: boolean) {
  res.clearCookie(FAMILY_COOKIE, { httpOnly: true, path: "/", sameSite: secure ? "none" : "lax", secure });
}
