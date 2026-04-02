import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { getEnv } from "@/lib/env";

export function getSessionCookieName() {
  return getEnv().SESSION_COOKIE_NAME;
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(`${getEnv().APP_SECRET}:${token}`).digest("hex");
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + getEnv().SESSION_TTL_HOURS * 60 * 60 * 1000);
}

export async function getSessionTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(getSessionCookieName())?.value;
}

export function getSessionCookieOptions(expires: Date) {
  return {
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  };
}
