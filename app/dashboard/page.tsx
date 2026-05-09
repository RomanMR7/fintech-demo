import { EducationBlock } from "@/components/education-block";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney, formatNumber, toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [orders, balances, appeals, events] = await Promise.all([
    prisma.paymentOrder.findMany({ include: { merchant: true }, orderBy: { createdAt: "desc" } }),
    prisma.balanceAccount.findMany({ include: { merchant: true } }),
    prisma.appeal.findMany(),
    prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 })
  ]);

  const turnover = orders.reduce((sum, order) => sum + toNumber(order.amount), 0);
  const available = balances.filter((item) => item.type === "AVAILABLE").reduce((sum, item) => sum + toNumber(item.amount), 0);
  const frozen = balances.filter((item) => item.type === "FROZEN").reduce((sum, item) => sum + toNumber(item.amount), 0);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Общий обзор"
        title="Главный дашборд"
        description="Сводная картина платежной платформы: операции, успешность, спорные кейсы, оборот и состояние балансов."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Ордера" value={formatNumber(orders.length)} hint="Всего платежных ордеров в демо-базе." />
        <MetricCard label="Успешные" value={formatNumber(orders.filter((order) => order.status === "COMPLETED").length)} hint="Операции, которые уже обновили баланс." accent="moss" />
        <MetricCard label="В ожидании" value={formatNumber(orders.filter((order) => ["CREATED", "WAITING_PAYMENT", "PAID", "CONFIRMED"].includes(order.status)).length)} hint="Очередь операционной обработки." accent="brass" />
        <MetricCard label="Споры" value={formatNumber(orders.filter((order) => order.status === "DISPUTED").length + appeals.filter((appeal) => ["NEW", "OPEN"].includes(appeal.status)).length)} hint="Операции и апелляции, где есть риск." accent="red" />
        <MetricCard label="Оборот" value={formatMoney(turnover)} hint="Сумма всех платежных ордеров." />
        <MetricCard label="Доступно" value={formatMoney(available)} hint="Баланс, которым мерчанты могут распоряжаться." accent="moss" />
        <MetricCard label="Заморожено" value={formatMoney(frozen)} hint="Холды по выплатам и спорным операциям." accent="brass" />
        <MetricCard label="Апелляции" value={formatNumber(appeals.length)} hint="Все обращения support-команды." accent="red" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Последние операции</h2>
          <div className="mt-4 grid gap-3">
            {orders.slice(0, 6).map((order) => (
              <div key={order.id} className="flex flex-col gap-3 rounded-2xl bg-white/60 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{order.externalId} · {order.merchant.displayName}</p>
                  <p className="mt-1 text-sm text-graphite/60">{formatMoney(toNumber(order.amount), order.currency)} · {formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Последние события</h2>
          <div className="mt-4 grid gap-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-ink/10 bg-white/55 p-4">
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="mt-1 text-xs text-graphite/50">{event.actorName} · {formatDate(event.createdAt)}</p>
                <p className="mt-2 text-sm leading-6 text-graphite/70">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EducationBlock
        items={[
          "Дашборд собирает показатели из ордеров, выплат, балансов, апелляций и журнала событий.",
          "Для инвестора это быстрый способ увидеть масштаб, риски и управляемость процессов.",
          "Для операционной команды важны ожидания, споры и последние события.",
          "Для финансовой команды важны доступный баланс, холды и комиссии."
        ]}
      />
    </div>
  );
}
