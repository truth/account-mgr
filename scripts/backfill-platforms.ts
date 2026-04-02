import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PLATFORM_NAMES = ["github", "cloudflare", "railway.com", "google", "tidbcloud"] as const;
const IMPORTED_PLATFORM_NAME = "Imported";

const DEFAULT_PLATFORM_WEBSITES: Record<(typeof DEFAULT_PLATFORM_NAMES)[number], string> = {
  github: "https://github.com",
  cloudflare: "https://dash.cloudflare.com",
  "railway.com": "https://railway.com",
  google: "https://accounts.google.com",
  tidbcloud: "https://tidbcloud.com",
};

async function ensureDefaultPlatformsForUser(userId: string) {
  await Promise.all(
    DEFAULT_PLATFORM_NAMES.map((name) =>
      prisma.platform.upsert({
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

async function ensureImportedPlatformForUser(userId: string) {
  return prisma.platform.upsert({
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

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      accounts: {
        where: {
          platformId: null,
        },
        select: {
          id: true,
        },
      },
    },
  });

  for (const user of users) {
    await ensureDefaultPlatformsForUser(user.id);

    if (!user.accounts.length) {
      continue;
    }

    const imported = await ensureImportedPlatformForUser(user.id);

    await prisma.managedAccount.updateMany({
      where: {
        ownerUserId: user.id,
        platformId: null,
      },
      data: {
        platformId: imported.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
