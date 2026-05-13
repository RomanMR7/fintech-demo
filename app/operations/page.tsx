import Link from "next/link";
import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney, toNumber } from "@/lib/format";
import { AppealStatus, OrderStatus, RequisiteStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const [orders, appeals, requisites] = await Promise.all([
    prisma.paymentOrder.findMany({
      where: { status: { in: [OrderStatus.CREATED, OrderStatus.WAITING_PAYMENT, OrderStatus.PAID, OrderStatus.CONFIRMED, OrderStatus.DISPUTED] } },
      include: { merchant: true },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.appeal.findMany({ where: { status: { in: [AppealStatus.NEW, AppealStatus.OPEN] } }, include: { merchant: true, order: true }, take: 5 }),
    prisma.paymentRequisite.findMany({ where: { status: { in: [RequisiteStatus.LIMITED, RequisiteStatus.PAUSED] } }, include: { merchant: true }, take: 5 })
  ]);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Роль оператора"
        title="Операционный кабинет"
        description="Рабочая очередь оператора: ордера в обработке, спорные операции, реквизиты с лимитами и задачи для ручной проверки."
      />
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Очередь ордеров</h2>
          <div className="mt-4 grid gap-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 p-4 transition hover:bg-white">
                <div>
                  <p className="font-semibold">{order.externalId} · {order.merchant.displayName}</p>
                  <p className="text-sm text-graphite/55">{formatMoney(toNumber(order.amount), order.currency)} · {formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-5">
          <div className="card rounded-[1.75rem] p-5">
            <h2 className="font-display text-2xl font-semibold">Активные апелляции</h2>
            <div className="mt-4 grid gap-3">
              {appeals.map((appeal) => (
                <div key={appeal.id} className="rounded-2xl bg-white/60 p-4">
                  <p className="font-semibold">{appeal.id} · {appeal.order.externalId}</p>
                  <p className="mt-1 text-sm text-graphite/60">{appeal.merchant.displayName}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card rounded-[1.75rem] p-5">
            <h2 className="font-display text-2xl font-semibold">Реквизиты внимания</h2>
            <div className="mt-4 grid gap-3">
              {requisites.map((requisite) => (
                <div key={requisite.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 p-4">
                  <div>
                    <p className="font-semibold">{requisite.bank}</p>
                    <p className="text-sm text-graphite/55">{requisite.merchant?.displayName}</p>
                  </div>
                  <StatusBadge status={requisite.status} type="requisite" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <EducationBlock
        items={[
          "Оператор не занимается бухгалтерией, но его статусные решения запускают финансовую логику.",
          "Главная задача оператора: не потерять платеж в переходах между реквизитом, провайдером и мерчантом.",
          "Спорные операции лучше переводить в апелляцию, чтобы решение было зафиксировано.",
          "Реквизиты с лимитами требуют внимания, иначе новые ордера могут назначаться на перегруженные каналы."
        ]}
      />
    </div>
  );
}
