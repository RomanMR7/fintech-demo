import { PageHeader } from "@/components/page-header";

export default function NotificationsEventsEducationPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Обучающий режим"
        title="Уведомления и журнал событий"
        description="Уведомление говорит роли, что делать дальше. Журнал событий сохраняет историю того, что уже произошло."
      />
      <section className="grid gap-4 md:grid-cols-2">
        <article className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Уведомления</h2>
          <p className="mt-3 text-sm leading-6 text-graphite/70">Рабочие сигналы для конкретной роли: новая апелляция, выплата на подтверждение, успешный ордер или риск по реквизиту.</p>
        </article>
        <article className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Журнал событий</h2>
          <p className="mt-3 text-sm leading-6 text-graphite/70">Аудит действий: кто сделал, что изменилось, к какой сущности относится событие и когда оно произошло.</p>
        </article>
      </section>
    </div>
  );
}
