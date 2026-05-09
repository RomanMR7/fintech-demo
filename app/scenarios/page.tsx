import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";
import { ScenariosClient } from "@/components/scenarios-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ScenariosPage() {
  const scenarios = await prisma.scenarioState.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Интерактивная демонстрация"
        title="Сценарии"
        description="Каждый сценарий выполняет реальное действие в локальной базе: меняет статусы, баланс, апелляции, уведомления и журнал событий."
      />
      <ScenariosClient scenarios={scenarios} />
      <EducationBlock
        items={[
          "Сценарии можно проходить в любом порядке: они используют текущие данные и создают новые, если не хватает подходящих.",
          "После каждого шага обновляются события, поэтому журнал становится живой историей демонстрации.",
          "Если сценарий дошел до конца, кнопка запускает его заново с первого шага.",
          "Это безопасная песочница: нет внешних API, реальных денег и персональных данных."
        ]}
      />
    </div>
  );
}
