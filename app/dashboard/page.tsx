import Link from "next/link";
import { EducationBlock } from "@/components/education-block";
import { MetricCard } from "@/components/metric-card";
import { MoneyBreakdown } from "@/components/money-breakdown";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { convertBreakdownToBase, getFxSnapshot } from "@/lib/fx";
import { formatDate, formatMoney, formatMoneyBreakdown, formatNumber, formatRate, toNumber, totalByCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [orders, balances, appeals, events, fx] = await Promise.all([
    prisma.paymentOrder.findMany({ include: { merchant: true }, orderBy: { createdAt: "desc" } }),
    prisma.balanceAccount.findMany({ include: { merchant: true } }),
    prisma.appeal.findMany(),
    prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    getFxSnapshot()
  ]);

  const turnover = totalByCurrency(orders, (order) => order.amount, (order) => order.currency);
  const available = totalByCurrency(
    balances.filter((item) => item.type === "AVAILABLE"),
    (item) => item.amount,
    (item) => item.currency
  );
  const frozen = totalByCurrency(
    balances.filter((item) => item.type === "FROZEN"),
    (item) => item.amount,
    (item) => item.currency
  );
  const turnoverBase = convertBreakdownToBase(turnover, fx);
  const availableBase = convertBreakdownToBase(available, fx);
  const frozenBase = convertBreakdownToBase(frozen, fx);
  const fxHint = fx.usdRubRate ? `USD пересчитан по ${formatRate(fx.usdRubRate)} RUB за 1 USD.` : "Курс USD/RUB не задан.";

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
        <MetricCard
          label="Оборот по валютам"
          value={<MoneyBreakdown totals={turnover} />}
          hint={`Выше исходные суммы, не конвертация. Управленческий эквивалент в RUB: ${turnoverBase === null ? "курс не задан" : formatMoney(turnoverBase, "RUB")}. ${fxHint}`}
        />
        <MetricCard
          label="Доступно по валютам"
          value={<MoneyBreakdown totals={available} />}
          hint={`Выше отдельные балансы RUB и USD. Управленческий эквивалент в RUB: ${availableBase === null ? "курс не задан" : formatMoney(availableBase, "RUB")}.`}
          accent="moss"
        />
        <MetricCard
          label="Заморожено по валютам"
          value={<MoneyBreakdown totals={frozen} />}
          hint={`Выше отдельные холды RUB и USD. Управленческий эквивалент в RUB: ${frozenBase === null ? "курс не задан" : formatMoney(frozenBase, "RUB")}.`}
          accent="brass"
        />
        <MetricCard label="Апелляции" value={formatNumber(appeals.length)} hint="Все обращения support-команды." accent="red" />
      </section>

      <section className={`card rounded-[1.75rem] p-5 ${fx.isStale ? "border border-brass/35 bg-brass/10" : "border border-jade/20 bg-jade/8"}`}>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Курсы валют</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Базовая валюта отчетности: RUB</h2>
            <p className="mt-2 text-sm leading-6 text-graphite/68">
              В карточках выше суммы не смешиваются напрямую: RUB и USD показываются отдельно, а для общей картины считается рублевый эквивалент.
              {fx.usdRate ? ` Источник: ${fx.usdRate.source}, дата курса: ${formatDate(fx.usdRate.sourceDate)}.` : " Курс USD/RUB пока не найден."}
            </p>
            {fx.warning ? <p className="mt-2 text-sm font-semibold text-brass">{fx.warning}</p> : null}
          </div>
          <a href="/exchange-rates" className="rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-moss">
            Открыть курсы
          </a>
        </div>
      </section>

      <section className="card rounded-[1.75rem] bg-ink p-5 text-white">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Маршрут для презентации</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Начните с экономики, затем покажите сценарии и баланс</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
              Такой порядок лучше работает для инвестора или клиента: сначала объясняем, где деньги и ценность, затем показываем, как система проводит операции,
              меняет статусы, фиксирует события и защищает баланс.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/commercial" className="rounded-2xl bg-jade px-4 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink">Экономика</Link>
            <Link href="/scenarios" className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink">Сценарии</Link>
            <Link href="/balances" className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink">Балансы</Link>
          </div>
        </div>
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
