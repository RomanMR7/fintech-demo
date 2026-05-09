import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function resolveDatabaseUrl() {
  if (process.env.VERCEL === "1") {
    const bundledDbPath = join(process.cwd(), "prisma", "dev.db");
    const runtimeDbPath = join(tmpdir(), "fintech-demo-dev.db");

    if (!existsSync(runtimeDbPath) && existsSync(bundledDbPath)) {
      copyFileSync(bundledDbPath, runtimeDbPath);
    }

    return `file:${runtimeDbPath.replace(/\\/g, "/")}`;
  }

  return process.env.DATABASE_URL ?? "file:./dev.db";
}

process.env.DATABASE_URL = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
