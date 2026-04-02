import "server-only";

import { db } from "@/lib/db";
import type { AccountInput, AccountUpdateInput } from "@/lib/validation/account";
import { decryptSecret, encryptSecret } from "@/lib/server/encryption";
import { ensurePlatformOwnership } from "@/lib/server/platforms";

type AccountRecord = {
  id: string;
  platformId: string | null;
  platform: {
    id: string;
    name: string;
    websiteUrl: string | null;
  } | null;
  siteName: string;
  websiteUrl: string | null;
  username: string;
  notes: string | null;
  registrationInfo: string | null;
  tags: string | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AccountSummary = ReturnType<typeof serializeAccount>;

function mapTags(raw: string | null) {
  if (!raw) {
    return [] as string[];
  }

  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function serializeAccount(account: AccountRecord) {
  return {
    id: account.id,
    platformId: account.platformId,
    platformName: account.platform?.name ?? null,
    siteName: account.siteName,
    websiteUrl: account.platform?.websiteUrl ?? account.websiteUrl,
    username: account.username,
    notes: account.notes,
    registrationInfo: account.registrationInfo,
    tags: mapTags(account.tags),
    isFavorite: account.isFavorite,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
    passwordMasked: "••••••••",
  };
}

export async function listAccounts(userId: string, filters?: { platformId?: string }) {
  const accounts = await db.managedAccount.findMany({
    where: {
      ownerUserId: userId,
      ...(filters?.platformId ? { platformId: filters.platformId } : {}),
    },
    include: {
      platform: {
        select: {
          id: true,
          name: true,
          websiteUrl: true,
        },
      },
    },
    orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
  });

  return accounts.map(serializeAccount);
}

export async function getAccountById(userId: string, accountId: string) {
  const account = await db.managedAccount.findFirst({
    where: {
      id: accountId,
      ownerUserId: userId,
    },
    include: {
      platform: {
        select: {
          id: true,
          name: true,
          websiteUrl: true,
        },
      },
    },
  });

  if (!account) {
    return null;
  }

  return serializeAccount(account);
}

export async function createAccount(userId: string, input: AccountInput) {
  const platform = await ensurePlatformOwnership(userId, input.platformId);

  if (!platform) {
    return null;
  }

  const encrypted = encryptSecret(input.password);

  const account = await db.managedAccount.create({
    data: {
      ownerUserId: userId,
      platformId: platform.id,
      siteName: input.siteName,
      websiteUrl: platform.websiteUrl,
      username: input.username,
      encryptedPassword: encrypted.ciphertext,
      passwordIv: encrypted.iv,
      passwordAuthTag: encrypted.authTag,
      passwordKeyVersion: encrypted.keyVersion,
      notes: input.notes,
      registrationInfo: input.registrationInfo,
      tags: input.tags.join(","),
      isFavorite: input.isFavorite,
    },
  });

  return getAccountById(userId, account.id);
}

export async function updateAccount(userId: string, accountId: string, input: AccountUpdateInput) {
  const existing = await db.managedAccount.findFirst({
    where: { id: accountId, ownerUserId: userId },
  });

  if (!existing) {
    return null;
  }

  const platform = await ensurePlatformOwnership(userId, input.platformId);

  if (!platform) {
    return null;
  }

  const encrypted = input.password ? encryptSecret(input.password) : null;

  await db.managedAccount.update({
    where: { id: accountId },
    data: {
      platformId: platform.id,
      siteName: input.siteName,
      websiteUrl: platform.websiteUrl,
      username: input.username,
      notes: input.notes,
      registrationInfo: input.registrationInfo,
      tags: input.tags.join(","),
      isFavorite: input.isFavorite,
      ...(encrypted
        ? {
            encryptedPassword: encrypted.ciphertext,
            passwordIv: encrypted.iv,
            passwordAuthTag: encrypted.authTag,
            passwordKeyVersion: encrypted.keyVersion,
          }
        : {}),
    },
  });

  return getAccountById(userId, accountId);
}

export async function deleteAccount(userId: string, accountId: string) {
  const deleted = await db.managedAccount.deleteMany({
    where: { id: accountId, ownerUserId: userId },
  });

  return deleted.count > 0;
}

export async function revealAccountPassword(userId: string, accountId: string) {
  const account = await db.managedAccount.findFirst({
    where: { id: accountId, ownerUserId: userId },
  });

  if (!account) {
    return null;
  }

  return decryptSecret({
    ciphertext: account.encryptedPassword,
    iv: account.passwordIv,
    authTag: account.passwordAuthTag,
  });
}
