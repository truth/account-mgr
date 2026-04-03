import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import defaultPlatformsConfig from "../src/config/default-platforms.json" with { type: "json" };

const defaultPlatforms = defaultPlatformsConfig.defaults;

async function hashPassword(password) {
  return argon2.hash(password, {
    type: argon2.argon2id,
  });
}

async function ensureDefaultPlatformsForUser(prisma, userId) {
  await Promise.all(
    defaultPlatforms.map((platform) =>
      prisma.platform.upsert({
        where: {
          userId_name: {
            userId,
            name: platform.name,
          },
        },
        update: {
          websiteUrl: platform.websiteUrl,
        },
        create: {
          userId,
          name: platform.name,
          websiteUrl: platform.websiteUrl,
        },
      }),
    ),
  );
}

export async function runProductionBootstrap() {
  const prisma = new PrismaClient();
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email) {
    throw new Error("ADMIN_EMAIL is required for production bootstrap.");
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    const user = existingUser
      ? existingUser
      : await (async () => {
          if (!password) {
            throw new Error("ADMIN_PASSWORD is required when bootstrap needs to create the admin user.");
          }

          return prisma.user.create({
            data: {
              email,
              passwordHash: await hashPassword(password),
            },
            select: { id: true },
          });
        })();

    await ensureDefaultPlatformsForUser(prisma, user.id);

    if (existingUser) {
      console.log(`[bootstrap] Admin user already exists for ${email}; password hash left unchanged.`);
    } else {
      console.log(`[bootstrap] Created admin user for ${email}.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}
