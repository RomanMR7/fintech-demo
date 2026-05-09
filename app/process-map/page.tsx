import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";

const maps = [
  {
    title: "Жизненный цикл ордера",
    steps: ["Создан", "Назначены реквизиты", "Ожидает оплаты", "Оплачен", "Подтвержден", "Завершен"]
  },
  {
    title: "Жизненный цикл выплаты",
    steps: ["Создана", "Сумма в холде", "Проверка финансов", "Подтверждена", "Списана из холда"]
  },
  {
    title: "Жизненный цикл апелляции",
    steps: ["Новая", "В работе", "Комментарий", "Решение", "Баланс обновлен"]
  },
  {
    title: "Движение баланса",
    steps: ["Успешный ордер", "Доступный +", "Создана выплата", "Холд +", "Финальное списание"]
  },
  {
    title: "Связь участников",
    steps: ["Мерчант", "Платформа", "Провайдер", "Оператор", "Support / финансы"]
  }
];

export default function ProcessMapPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Визуальная логика"
        title="Карта процессов"
        description="Схемы помогают объяснить продукт без чтения кода: кто участвует, где меняются статусы и когда двигаются деньги."
      />
      <section className="grid gap-5">
        {maps.map((map) => (
          <article key={map.title} className="card rounded-[1.75rem] p-5">
            <h2 className="font-display text-2xl font-semibold">{map.title}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              {map.steps.map((step, index) => (
                <div key={step} className="relative rounded-2xl border border-ink/10 bg-white/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jade">Шаг {index + 1}</p>
                  <p className="mt-2 font-semibold">{step}</p>
                  {index < map.steps.length - 1 ? (
                    <span className="absolute -right-3 top-1/2 hidden h-0.5 w-6 bg-jade/45 md:block" />
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
      <EducationBlock
        items={[
          "Карта процессов намеренно не перегружена техническими деталями, чтобы ее можно было показывать партнеру.",
          "Каждый блок соответствует странице или сценарию в приложении.",
          "Связь баланса со статусами особенно важна: деньги меняются не при каждом статусе, а только при финансово значимых переходах.",
          "Апелляции отделены от обычного статуса, потому что требуют комментариев, ответственного и решения."
        ]}
      />
    </div>
  );
}
