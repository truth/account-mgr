import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import {
  createSessionToken,
  getSessionCookieOptions,
  getSessionExpiryDate,
  getSessionCookieName,
  hashSessionToken,
} from "@/lib/server/session";
import { verifyPassword } from "@/lib/server/password";

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const sessionCookieName = getSessionCookieName();

  const cookieToken = cookieStore.get(sessionCookieName)?.value;
  const authorization = headerStore.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
  const token = bearerToken ?? cookieToken;

  if (!token) {
    return null;
  }

  const session = await db.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  await db.session.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date() },
  });

  return session.user;
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireApiUser() {
  return getCurrentUser();
}

export async function loginUser(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(user.passwordHash, password);

  if (!isValid) {
    return null;
  }

  const token = createSessionToken();
  const expiresAt = getSessionExpiryDate();

  await db.session.create({
    data: {
      userId: user.id,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

export async function attachSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set({
    ...getSessionCookieOptions(expiresAt),
    value: token,
  });
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const sessionCookieName = getSessionCookieName();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await db.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  cookieStore.delete(sessionCookieName);
}
