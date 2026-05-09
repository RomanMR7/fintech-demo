import { PageHeader } from "@/components/page-header";

const steps = [
  ["Создан", "Ордер появился в системе, но реквизит еще может быть не назначен."],
  ["Ожидает оплаты", "Плательщик получил реквизиты и должен отправить деньги."],
  ["Оплачен", "Есть сигнал об оплате, но требуется подтверждение."],
  ["Подтвержден", "Оператор или провайдер подтвердил корректность операции."],
  ["Завершен", "Баланс мерчанта обновлен, комиссия удержана."],
  ["Спор", "Есть конфликт или расхождение, требуется апелляция."]
];

export default function OrderLifecyclePage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Обучающий режим"
        title="Жизненный цикл платежного ордера"
        description="Операция не становится финансово успешной сразу: сначала она проходит реквизиты, оплату, сверку и только потом влияет на баланс."
      />
      <section className="card rounded-[1.75rem] p-6">
        <div className="grid gap-4">
          {steps.map(([title, description], index) => (
            <div key={title} className="flex gap-4 rounded-2xl bg-white/60 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-jade font-semibold text-white">{index + 1}</div>
              <div>
                <h2 className="font-display text-xl font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-graphite/70">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
