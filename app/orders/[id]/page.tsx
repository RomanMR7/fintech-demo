import Link from "next/link";
import { notFound } from "next/navigation";
import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { convertMoneyToBase, getFxSnapshot } from "@/lib/fx";
import { formatDate, formatMoney, toNumber } from "@/lib/format";
import { orderStatusMeta } from "@/lib/status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const lifecycle = ["CREATED", "WAITING_PAYMENT", "PAID", "CONFIRMED", "COMPLETED"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.paymentOrder.findUnique({
    where: { id },
    include: {
      merchant: true,
      provider: true,
      requisite: true,
      appeals: { include: { comments: true } },
      transactions: { orderBy: { createdAt: "desc" } }
    }
  });
  const fx = await getFxSnapshot();

  if (!order) notFound();

  const currentIndex = lifecycle.indexOf(order.status);
  const amountBase = convertMoneyToBase(order.amount, order.currency, fx);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Детали операции"
        title={`Ордер ${order.externalId}`}
        description="Детальная карточка показывает связи ордера с мерчантом, провайдером, реквизитом, балансом и апелляциями."
      >
        <Link href="/orders" className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-ink">
          Назад к ордерам
        </Link>
      </PageHeader>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="card rounded-[1.75rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">Параметры</h2>
            <StatusBadge status={order.status} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            {[
              ["Мерчант", order.merchant.displayName],
              ["Сумма", formatMoney(toNumber(order.amount), order.currency)],
              ["Эквивалент в RUB", amountBase === null ? "курс не задан" : formatMoney(amountBase, "RUB")],
              ["Комиссия", formatMoney(toNumber(order.commission), order.currency)],
              ["К зачислению", formatMoney(toNumber(order.merchantNet), order.currency)],
              ["Провайдер", order.providerName ?? order.provider?.displayName ?? "Не назначен"],
              ["Реквизит", order.requisite ? `${order.requisite.bank} · ${order.requisite.maskedNumber}` : "Не назначен"],
              ["Создан", formatDate(order.createdAt)],
              ["Завершен", formatDate(order.completedAt)]
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 rounded-2xl bg-white/55 p-4">
                <dt className="text-graphite/55">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Жизненный цикл</h2>
          <div className="mt-5 grid gap-4">
            {lifecycle.map((status, index) => {
              const active = currentIndex >= index || order.status === status;
              return (
                <div key={status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-9 w-9 rounded-full ${active ? "bg-jade" : "bg-ink/10"} flex items-center justify-center text-sm font-semibold text-white`}>
                      {index + 1}
                    </div>
                    {index < lifecycle.length - 1 ? <div className="timeline-line mt-2 h-10 w-0.5 rounded-full opacity-50" /> : null}
                  </div>
                  <div>
                    <p className="font-semibold">{orderStatusMeta[status as keyof typeof orderStatusMeta].label}</p>
                    <p className="mt-1 text-sm leading-6 text-graphite/65">{orderStatusMeta[status as keyof typeof orderStatusMeta].description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Движения баланса</h2>
          <div className="mt-4 grid gap-3">
            {order.transactions.length ? order.transactions.map((tx) => (
              <div key={tx.id} className="rounded-2xl bg-white/55 p-4">
                <p className="font-semibold">{tx.description}</p>
                <p className="mt-1 text-sm text-graphite/60">
                  {tx.direction} · {formatMoney(toNumber(tx.amount), tx.currency)} · {formatDate(tx.createdAt)}
                </p>
              </div>
            )) : <p className="text-sm text-graphite/60">По этому ордеру пока нет финансовых движений.</p>}
          </div>
        </div>

        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Связанные апелляции</h2>
          <div className="mt-4 grid gap-3">
            {order.appeals.length ? order.appeals.map((appeal) => (
              <div key={appeal.id} className="rounded-2xl bg-white/55 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{appeal.id}</p>
                  <StatusBadge status={appeal.status} type="appeal" />
                </div>
                <p className="mt-2 text-sm leading-6 text-graphite/70">{appeal.reason}</p>
              </div>
            )) : <p className="text-sm text-graphite/60">Апелляций по этому ордеру нет.</p>}
          </div>
        </div>
      </section>

      <EducationBlock
        items={[
          "Детальная карточка полезна для разбора причин статуса и финансовых последствий.",
          "Timeline помогает объяснить инвестору, где именно находится операция.",
          "Связанные апелляции и движения баланса показывают, почему сумма могла попасть в холд.",
          "В реальной системе здесь были бы webhook-логи, файлы чеков и подписи запросов."
        ]}
      />
    </div>
  );
}
