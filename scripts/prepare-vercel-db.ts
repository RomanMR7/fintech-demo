import { execSync } from "node:child_process";

const isVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_URL);

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

function runPrisma(args: string[]) {
  execSync(`npx prisma ${args.join(" ")}`, {
    stdio: "inherit",
    env: process.env
  });
}

console.log("Генерирую Prisma Client для сборки...");
runPrisma(["generate"]);

if (!isVercel) {
  console.log("Локальная сборка: миграции и seed не запускаются автоматически.");
  process.exit(0);
}

console.log("Vercel-сборка: создаю SQLite demo-базу, применяю миграции и seed.");
runPrisma(["migrate", "deploy"]);
runPrisma(["db", "seed"]);
