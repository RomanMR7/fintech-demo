import { PageHeader } from "@/components/page-header";

export default function ApiModeEducationPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Обучающий режим"
        title="Как работает API в демо-режиме"
        description="API routes в Next.js имитируют backend: создают ордера, меняют статусы, создают выплаты, апелляции и записывают события."
      />
      <section className="card rounded-[1.75rem] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Все API локальные и работают с SQLite через Prisma.",
            "Внешние платежные сервисы не подключаются.",
            "Webhook показан как пример payload, но не отправляется наружу.",
            "Бизнес-логика сосредоточена в lib/domain.ts, чтобы ее было легко читать."
          ].map((item) => (
            <p key={item} className="rounded-2xl bg-white/60 p-5 text-sm leading-6 text-graphite/75">{item}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
