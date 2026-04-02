import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/account_mgr";
  process.env.APP_SECRET = "12345678901234567890123456789012";
  process.env.MASTER_KEY = Buffer.alloc(32, 7).toString("base64");
  process.env.SESSION_COOKIE_NAME = "account_mgr_session";
  process.env.SESSION_TTL_HOURS = "24";
});

describe("session", () => {
  it("creates and hashes session tokens", async () => {
    const { createSessionToken, hashSessionToken } = await import("@/lib/server/session");

    const token = createSessionToken();

    expect(token).toBeTruthy();
    expect(hashSessionToken(token)).toHaveLength(64);
  });

  it("returns a future expiry date", async () => {
    const { getSessionExpiryDate } = await import("@/lib/server/session");
    const expiry = getSessionExpiryDate();

    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });
});
