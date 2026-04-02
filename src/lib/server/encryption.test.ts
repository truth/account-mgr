import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/account_mgr";
  process.env.APP_SECRET = "12345678901234567890123456789012";
  process.env.MASTER_KEY = Buffer.alloc(32, 7).toString("base64");
});

describe("encryption", () => {
  it("encrypts and decrypts secrets", async () => {
    const { decryptSecret, encryptSecret } = await import("@/lib/server/encryption");

    const encrypted = encryptSecret("super-secret");

    expect(decryptSecret(encrypted)).toBe("super-secret");
  });

  it("fails when ciphertext is tampered", async () => {
    const { decryptSecret, encryptSecret } = await import("@/lib/server/encryption");
    const encrypted = encryptSecret("super-secret");
    const tampered = {
      ...encrypted,
      ciphertext: Buffer.from("tampered").toString("base64"),
    };

    expect(() => decryptSecret(tampered)).toThrow();
  });
});
