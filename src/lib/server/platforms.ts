import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import defaultPlatformsConfig from "@/config/default-platforms.json";

const defaultPlatforms = defaultPlatformsConfig.defaults;

export const DEFAULT_PLATFORM_NAMES = defaultPlatforms.map((platform) => platform.name);
export const IMPORTED_PLATFORM_NAME = "Imported";

const DEFAULT_PLATFORM_WEBSITES = Object.fromEntries(
  defaultPlatforms.map((platform) => [platform.name, platform.websiteUrl]),
) satisfies Record<string, string>;

type PlatformRecord = {
  id: string;
  userId: string;
  name: string;
  websiteUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    accounts: number;
  };
};

export class PlatformDeleteBlockedError extends Error {
  constructor() {
    super("平台下仍有关联账号，无法删除");
    this.name = "PlatformDeleteBlockedError";
  }
}

export class PlatformNameConflictError extends Error {
  constructor() {
    super("平台名称已存在");
    this.name = "PlatformNameConflictError";
  }
}

function serializePlatform(platform: PlatformRecord) {
  return {
    id: platform.id,
    name: platform.name,
    websiteUrl: platform.websiteUrl,
    accountCount: platform._count?.accounts ?? 0,
    createdAt: platform.createdAt,
    updatedAt: platform.updatedAt,
  };
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function ensureDefaultPlatformsForUser(userId: string) {
  await Promise.all(
    DEFAULT_PLATFORM_NAMES.map((name) =>
      db.platform.upsert({
        where: {
          userId_name: {
            userId,
            name,
          },
        },
        update: {
          websiteUrl: DEFAULT_PLATFORM_WEBSITES[name],
        },
        create: {
          userId,
          name,
          websiteUrl: DEFAULT_PLATFORM_WEBSITES[name],
        },
      }),
    ),
  );
}

export async function ensureImportedPlatformForUser(userId: string) {
  return db.platform.upsert({
    where: {
      userId_name: {
        userId,
        name: IMPORTED_PLATFORM_NAME,
      },
    },
    update: {},
    create: {
      userId,
      name: IMPORTED_PLATFORM_NAME,
      websiteUrl: null,
    },
  });
}

export async function listPlatforms(userId: string) {
  const platforms = await db.platform.findMany({
    where: { userId },
    include: {
      _count: {
        select: { accounts: true },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  return platforms.map(serializePlatform);
}

export async function getPlatformById(userId: string, platformId: string) {
  const platform = await db.platform.findFirst({
    where: {
      id: platformId,
      userId,
    },
    include: {
      _count: {
        select: { accounts: true },
      },
    },
  });

  if (!platform) {
    return null;
  }

  return serializePlatform(platform);
}

export async function createPlatform(userId: string, input: { name: string; websiteUrl?: string }) {
  try {
    const platform = await db.platform.create({
      data: {
        userId,
        name: input.name,
        websiteUrl: input.websiteUrl,
      },
      include: {
        _count: {
          select: { accounts: true },
        },
      },
    });

    return serializePlatform(platform);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new PlatformNameConflictError();
    }

    throw error;
  }
}

export async function updatePlatform(userId: string, platformId: string, input: { name: string; websiteUrl?: string }) {
  try {
    const platform = await db.platform.updateMany({
      where: {
        id: platformId,
        userId,
      },
      data: {
        name: input.name,
        websiteUrl: input.websiteUrl,
      },
    });

    if (!platform.count) {
      return null;
    }

    return getPlatformById(userId, platformId);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new PlatformNameConflictError();
    }

    throw error;
  }
}

export async function deletePlatform(userId: string, platformId: string) {
  const platform = await db.platform.findFirst({
    where: {
      id: platformId,
      userId,
    },
    include: {
      _count: {
        select: { accounts: true },
      },
    },
  });

  if (!platform) {
    return false;
  }

  if (platform._count.accounts > 0) {
    throw new PlatformDeleteBlockedError();
  }

  await db.platform.delete({
    where: { id: platformId },
  });

  return true;
}

export async function ensurePlatformOwnership(userId: string, platformId: string) {
  const platform = await db.platform.findFirst({
    where: {
      id: platformId,
      userId,
    },
  });

  return platform;
}
