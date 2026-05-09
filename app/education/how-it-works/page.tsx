import { PageHeader } from "@/components/page-header";

export default function HowItWorksPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Обучающий режим"
        title="Как работает система"
        description="Платформа принимает ордера от мерчантов, назначает реквизиты, получает статусы от операторов/провайдеров, обновляет балансы и разбирает спорные операции через апелляции."
      />
      <section className="card rounded-[1.75rem] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Мерчант создает ордер через интерфейс или API.",
            "Платформа выбирает провайдера и подходящий реквизит с учетом лимитов.",
            "Оператор или webhook переводит ордер по статусам.",
            "После успешного завершения баланс мерчанта увеличивается на сумму за вычетом комиссии.",
            "Если операция спорная, создается апелляция и часть суммы может быть заморожена.",
            "Support принимает решение, а журнал событий сохраняет историю действий."
          ].map((item) => (
            <p key={item} className="rounded-2xl bg-white/60 p-5 text-sm leading-6 text-graphite/75">{item}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
