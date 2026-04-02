import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/server/password";

describe("password", () => {
  it("hashes and verifies a password", async () => {
    const password = "P@ssword123";
    const hash = await hashPassword(password);

    await expect(verifyPassword(hash, password)).resolves.toBe(true);
    await expect(verifyPassword(hash, "wrong-password")).resolves.toBe(false);
  });
});
