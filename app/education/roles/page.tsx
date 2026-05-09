import { PageHeader } from "@/components/page-header";

const roles = [
  ["Администратор платформы", "Полный обзор, интеграции, настройки, все события и все участники."],
  ["Мерчант", "Свои ордера, выплаты, балансы, реквизиты, уведомления и API-настройки."],
  ["Оператор", "Очередь операций, статусы, реквизиты, спорные кейсы и ручная обработка."],
  ["Финансовый менеджер", "Балансы, комиссии, холды, подтверждение выплат и финансовые события."],
  ["Support / апелляции", "Апелляции, комментарии, доказательства, решения и история споров."]
];

export default function RolesEducationPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Обучающий режим"
        title="Роли и ответственность"
        description="Роли помогают объяснить, кто принимает решения на каждом этапе и почему один пользователь не должен видеть лишние данные."
      />
      <section className="grid gap-4 md:grid-cols-2">
        {roles.map(([title, description]) => (
          <article key={title} className="card rounded-[1.75rem] p-5">
            <h2 className="font-display text-2xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-graphite/70">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
