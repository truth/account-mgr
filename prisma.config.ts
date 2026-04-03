import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL ?? "mysql://prisma:prisma@127.0.0.1:3306/prisma";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --import tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
