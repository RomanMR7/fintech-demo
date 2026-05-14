import Link from "next/link";
import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { AppealStatus, OrderStatus, PayoutStatus, RequisiteStatus } from "@/lib/constants";
import { formatDate, formatMoney, formatNumber, toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function priority(status: string, amount: number) {
  if (["DISPUTED", "FAILED", AppealStatus.NEW, AppealStatus.OPEN].includes(status)) return { label: "P1", className: "bg-red-500/10 text-red-700 border-red-500/20" };
  if (amount > 150000 || status === PayoutStatus.HOLD) return { label: "P2", className: "bg-brass/10 text-brass border-brass/25" };
  return { label: "P3", className: "bg-jade/10 text-jade border-jade/20" };
}

export default async function OperationsPage() {
  const [orders, payouts, appeals, requisites, events] = await Promise.all([
    prisma.paymentOrder.findMany({
      where: { status: { in: [OrderStatus.CREATED, OrderStatus.WAITING_PAYMENT, OrderStatus.PAID, OrderStatus.CONFIRMED, OrderStatus.DISPUTED] } },
      include: { merchant: true, provider: true },
      orderBy: { updatedAt: "desc" },
      take: 10
    }),
    prisma.payout.findMany({
      where: { status: { in: [PayoutStatus.CREATED, PayoutStatus.PENDING_APPROVAL, PayoutStatus.HOLD] } },
      include: { merchant: true },
      orderBy: { updatedAt: "desc" },
      take: 8
    }),
    prisma.appeal.findMany({ where: { status: { in: [AppealStatus.NEW, AppealStatus.OPEN] } }, include: { merchant: true, order: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.paymentRequisite.findMany({ where: { status: { in: [RequisiteStatus.LIMITED, RequisiteStatus.PAUSED] } }, include: { merchant: true, provider: true }, take: 6 }),
    prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 })
  ]);

  const reviewOrderStatuses = [OrderStatus.PAID, OrderStatus.CONFIRMED, OrderStatus.DISPUTED] as string[];
  const reviewOrders = orders.filter((order) => reviewOrderStatuses.includes(order.status));
  const highRiskTransactions = orders.filter((order) => order.status === OrderStatus.DISPUTED || toNumber(order.amount) > (order.currency === "USD" ? 2500 : 180000));

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Роль оператора"
        title="Операционный кабинет"
        description="Рабочая очередь команды operations: выплаты на подтверждении, операции на ручной проверке, спорные ордера, high risk transactions и реквизиты с лимитами."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card kpi-card compact">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-graphite/45">Manual review</p>
          <p className="mt-3 font-display text-3xl font-semibold text-ink">{formatNumber(reviewOrders.length)}</p>
          <p className="mt-2 text-sm text-graphite/65">Ордера, где нужен оператор или сверка провайдера.</p>
        </div>
        <div className="card kpi-card compact">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-graphite/45">Payout queue</p>
          <p className="mt-3 font-display text-3xl font-semibold text-ink">{formatNumber(payouts.length)}</p>
          <p className="mt-2 text-sm text-graphite/65">Выплаты ждут подтверждения или снятия hold.</p>
        </div>
        <div className="card kpi-card compact">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-graphite/45">Open disputes</p>
          <p className="mt-3 font-display text-3xl font-semibold text-ink">{formatNumber(appeals.length)}</p>
          <p className="mt-2 text-sm text-graphite/65">Активные апелляции support-команды.</p>
        </div>
        <div className="card kpi-card compact">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-graphite/45">High risk</p>
          <p className="mt-3 font-display text-3xl font-semibold text-ink">{formatNumber(highRiskTransactions.length)}</p>
          <p className="mt-2 text-sm text-graphite/65">Крупные или спорные транзакции.</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="section-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Task queue</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Ордера в работе</h2>
            </div>
            <Link href="/orders" className="rounded-full border border-ink/10 bg-white/55 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-white">
              Все ордера
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {orders.map((order) => {
              const itemPriority = priority(order.status, toNumber(order.amount));
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="grid gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 transition hover:bg-white md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${itemPriority.className}`}>{itemPriority.label}</span>
                      <p className="font-mono text-sm font-semibold text-ink">{order.externalId}</p>
                    </div>
                    <p className="mt-2 text-sm text-graphite/55">
                      {order.merchant.displayName} · {formatMoney(toNumber(order.amount), order.currency)} · {order.provider?.displayName ?? order.providerName ?? "provider не назначен"} · {formatDate(order.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="section-card">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Payout approvals</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Очередь выплат</h2>
            <div className="mt-4 grid gap-3">
              {payouts.map((payout) => (
                <Link key={payout.id} href="/payouts" className="rounded-2xl border border-ink/10 bg-white/60 p-4 transition hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{payout.merchant.displayName}</p>
                      <p className="mt-1 text-sm text-graphite/55">{formatMoney(toNumber(payout.amount), payout.currency)} · {payout.recipient}</p>
                    </div>
                    <StatusBadge status={payout.status} type="payout" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="section-card">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Payment details</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Реквизиты внимания</h2>
            <div className="mt-4 grid gap-3">
              {requisites.map((requisite) => (
                <div key={requisite.id} className="grid gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-semibold text-ink">{requisite.bank}</p>
                    <p className="mt-1 text-sm text-graphite/55">
                      {requisite.merchant?.displayName ?? "Без мерчанта"} · used {formatMoney(toNumber(requisite.dailyUsed), requisite.currency)} / {formatMoney(toNumber(requisite.dailyLimit), requisite.currency)}
                    </p>
                  </div>
                  <StatusBadge status={requisite.status} type="requisite" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="section-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Disputes</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Спорные операции</h2>
          <div className="mt-4 grid gap-3">
            {appeals.map((appeal) => (
              <Link key={appeal.id} href="/appeals" className="rounded-2xl border border-ink/10 bg-white/60 p-4 transition hover:bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{appeal.order.externalId} · {appeal.merchant.displayName}</p>
                    <p className="mt-1 text-sm leading-6 text-graphite/60">{appeal.reason}</p>
                  </div>
                  <StatusBadge status={appeal.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="section-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Audit pulse</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Последние события</h2>
          <div className="mt-4 grid gap-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-ink/10 bg-white/55 p-4">
                <p className="font-semibold text-ink">{event.title}</p>
                <p className="mt-1 text-xs text-graphite/50">{event.actorName} · {formatDate(event.createdAt)}</p>
                <p className="mt-2 text-sm leading-6 text-graphite/68">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EducationBlock
        items={[
          "Оператор видит не просто цифры, а очередь задач: что нужно подтвердить, сверить, отправить в спор или проверить вручную.",
          "Статусные решения оператора запускают финансовую логику: завершение пополняет баланс, спор переводит часть средств в hold.",
          "High risk transactions помогают объяснить, зачем платформе risk layer и ручная проверка.",
          "Audit pulse показывает, что каждое действие фиксируется, поэтому процесс можно разбирать после инцидента."
        ]}
      />
    </div>
  );
}
