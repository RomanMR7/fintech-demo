import { PageHeader } from "@/components/page-header";

export default function PayoutLifecyclePage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Обучающий режим"
        title="Жизненный цикл выплаты"
        description="Выплата показывает обратное движение средств: мерчант запрашивает вывод, платформа резервирует сумму, финансы подтверждают или отменяют."
      />
      <section className="grid gap-4 md:grid-cols-2">
        {[
          "Создание выплаты проверяет доступный баланс и получателя.",
          "Сумма выплаты и комиссия переводятся в замороженный баланс.",
          "Финансовый менеджер проверяет заявку и подтверждает или отменяет ее.",
          "При подтверждении холд списывается, при отмене возвращается в доступный баланс."
        ].map((item) => (
          <p key={item} className="card rounded-[1.75rem] p-5 text-sm leading-6 text-graphite/75">{item}</p>
        ))}
      </section>
    </div>
  );
}
