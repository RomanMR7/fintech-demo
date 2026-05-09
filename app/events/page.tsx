import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";
import { roleLabel, DemoRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.eventLog.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Аудит"
        title="Журнал событий"
        description="Журнал фиксирует каждое важное действие: создание ордера, смену статуса, холд, выплату, апелляцию и изменения реквизитов."
      />
      <section className="card rounded-[1.75rem] p-5">
        <div className="grid gap-3">
          {events.map((event) => (
            <div key={event.id} className="grid gap-3 rounded-2xl bg-white/60 p-4 lg:grid-cols-[180px_1fr_220px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-jade">{event.type}</p>
                <p className="mt-2 text-sm text-graphite/55">{formatDate(event.createdAt)}</p>
              </div>
              <div>
                <p className="font-semibold">{event.title}</p>
                <p className="mt-1 text-sm leading-6 text-graphite/70">{event.description}</p>
              </div>
              <div className="text-sm text-graphite/60 lg:text-right">
                <p>{event.actorName}</p>
                <p>{roleLabel(event.actorRole as DemoRole)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <EducationBlock
        items={[
          "Журнал нужен для объяснимости и разбора инцидентов.",
          "Каждый сценарий тоже пишет событие, чтобы было видно, что именно сделал пользователь.",
          "В реальном продукте журнал мог бы быть неизменяемым audit log.",
          "Для демо достаточно локальных записей SQLite, которые обновляются через API routes."
        ]}
      />
    </div>
  );
}
