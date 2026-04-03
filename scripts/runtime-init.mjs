import { spawnSync } from "node:child_process";

import { runProductionBootstrap } from "./bootstrap-production.mjs";

function runMigrateDeploy() {
  const migrate = spawnSync("node", ["node_modules/prisma/build/index.js", "migrate", "deploy"], {
    stdio: "inherit",
    env: process.env,
  });

  if (migrate.status !== 0) {
    throw new Error(`prisma migrate deploy failed with exit code ${migrate.status ?? "unknown"}.`);
  }
}

async function main() {
  console.log("[init] Applying Prisma migrations...");
  runMigrateDeploy();

  console.log("[init] Running idempotent bootstrap...");
  await runProductionBootstrap();

  console.log("[init] Runtime init completed successfully.");
}

main().catch((error) => {
  console.error("[init] Runtime init failed.");
  console.error(error);
  process.exit(1);
});
