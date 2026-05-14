import { PrismaClient } from "@prisma/client";

import { runScenarioStep } from "../lib/domain";

const prisma = new PrismaClient();

async function main() {
  const scenarios = await prisma.scenarioState.findMany({ orderBy: { key: "asc" } });

  for (const scenario of scenarios) {
    for (let step = 1; step <= scenario.totalSteps; step += 1) {
      await runScenarioStep(scenario.key, step);
    }
  }

  console.log(`Проверены сценарии: ${scenarios.length}. Все шаги выполнились без ошибок.`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
