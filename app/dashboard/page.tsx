import Link from "next/link";
import { EducationBlock } from "@/components/education-block";
import { MoneyBreakdown } from "@/components/money-breakdown";
import { PageHeader } from "@/components/page-header";
import { QuickScenarioLauncher } from "@/components/quick-scenario-launcher";
import { StatusBadge } from "@/components/status-badge";
import { convertBreakdownToBase, convertMoneyToBase, getFxSnapshot } from "@/lib/fx";
import { formatDate, formatMoney, formatNumber, formatRate, toNumber, totalByCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ChartPoint = {
  label: string;
  value: number;
};

function FinanceKpiCard({
  label,
  value,
  description,
  delta,
  tone = "jade"
}: {
  label: string;
  value: React.ReactNode;
  description: string;
  delta: string;
  tone?: "jade" | "brass" | "moss" | "red" | "blue";
}) {
  const toneClass = {
    jade: "bg-jade/10 text-jade border-jade/20",
    brass: "bg-brass/10 text-brass border-brass/25",
    moss: "bg-moss/10 text-moss border-moss/20",
    red: "bg-red-500/10 text-red-700 border-red-500/20",
    blue: "bg-sky-500/10 text-sky-700 border-sky-500/20"
  }[tone];

  return (
    <article className="card kpi-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-graphite/48">{label}</p>
          <div className="amount mt-3 break-words text-ink">{value}</div>
        </div>
        <span className={`pill shrink-0 ${toneClass}`}>{delta}</span>
      </div>
      <p className="copy-sm mt-3">{description}</p>
    </article>
  );
}

function MiniBarChart({ points }: { points: ChartPoint[] }) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="mt-5 flex h-44 items-end gap-2 rounded-[var(--radius-lg)] border border-ink/10 bg-white/45 p-4">
      {points.map((point) => {
        const height = Math.max((point.value / max) * 100, point.value > 0 ? 12 : 4);
        return (
          <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-jade to-emerald-300 shadow-insetSoft"
                style={{ height: `${height}%` }}
                title={`${point.label}: ${formatMoney(point.value, "RUB")}`}
              />
            </div>
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-graphite/50">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function SuccessRateChart({ value }: { value: number }) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="mt-5 grid gap-4 rounded-[var(--radius-lg)] border border-ink/10 bg-white/45 p-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Конверсия в успешные операции</p>
          <p className="mt-1 text-xs text-graphite/60">Completed / все платежные ордера</p>
        </div>
        <p className="amount text-ink">{safeValue.toFixed(1)}%</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-gradient-to-r from-jade to-emerald-300" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

function InsightRow({ label, value, hint }: { label: string; value: React.ReactNode; hint: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/55 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <div className="text-right font-semibold text-ink">{value}</div>
      </div>
      <p className="mt-2 text-xs leading-5 text-graphite/60">{hint}</p>
    </div>
  );
}

function daysAgoLabel(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short" }).format(date);
}

export default async function DashboardPage() {
  const [orders, payouts, balances, appeals, events, providers, fx] = await Promise.all([
    prisma.paymentOrder.findMany({ include: { merchant: true, provider: true, requisite: true }, orderBy: { createdAt: "desc" } }),
    prisma.payout.findMany({ include: { merchant: true }, orderBy: { createdAt: "desc" } }),
    prisma.balanceAccount.findMany({ include: { merchant: true } }),
    prisma.appeal.findMany({ include: { order: true, merchant: true }, orderBy: { updatedAt: "desc" } }),
    prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.provider.findMany({ orderBy: { availability: "desc" } }),
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
  const fees = totalByCurrency(
    [
      ...orders.map((order) => ({ amount: order.commission, currency: order.currency })),
      ...payouts.map((payout) => ({ amount: payout.commission, currency: payout.currency }))
    ],
    (item) => item.amount,
    (item) => item.currency
  );

  const completedOrders = orders.filter((order) => order.status === "COMPLETED");
  const pendingOrders = orders.filter((order) => ["CREATED", "WAITING_PAYMENT", "PAID", "CONFIRMED"].includes(order.status));
  const pendingPayouts = payouts.filter((payout) => ["CREATED", "PENDING_APPROVAL", "HOLD"].includes(payout.status));
  const openAppeals = appeals.filter((appeal) => ["NEW", "OPEN"].includes(appeal.status));
  const riskOrders = orders.filter((order) => ["DISPUTED", "FAILED"].includes(order.status));
  const successRate = orders.length ? (completedOrders.length / orders.length) * 100 : 0;
  const providerHealth = providers.length ? providers.reduce((sum, provider) => sum + provider.availability, 0) / providers.length : 100;

  const turnoverBase = convertBreakdownToBase(turnover, fx);
  const availableBase = convertBreakdownToBase(available, fx);
  const frozenBase = convertBreakdownToBase(frozen, fx);
  const feesBase = convertBreakdownToBase(fees, fx);

  const now = new Date();
  const paymentVolume7d = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const dateKey = date.toISOString().slice(0, 10);
    const value = orders
      .filter((order) => order.createdAt.toISOString().slice(0, 10) === dateKey)
      .reduce((sum, order) => sum + (convertMoneyToBase(order.amount, order.currency, fx) ?? 0), 0);

    return { label: daysAgoLabel(date), value };
  });

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Общий обзор"
        title="Главный dashboard"
        description="Финансовый control room платежной платформы: где деньги, что в холде, какие операции требуют внимания и как чувствует себя API-контур."
      />

      <section className="kpi-grid">
        <FinanceKpiCard
          label="Available balance"
          value={<MoneyBreakdown totals={available} />}
          description={`Деньги, которые мерчанты могут использовать для выплат. Управленческий эквивалент: ${availableBase === null ? "курс USD/RUB не задан" : formatMoney(availableBase, "RUB")}.`}
          delta="+12.4%"
          tone="moss"
        />
        <FinanceKpiCard
          label="On hold"
          value={<MoneyBreakdown totals={frozen} />}
          description={`Средства в заморозке из-за выплат, risk hold или апелляций. Эквивалент: ${frozenBase === null ? "курс USD/RUB не задан" : formatMoney(frozenBase, "RUB")}.`}
          delta={`${formatNumber(openAppeals.length)} disputes`}
          tone="brass"
        />
        <FinanceKpiCard
          label="Pending payouts"
          value={formatNumber(pendingPayouts.length)}
          description="Заявки на вывод, которые ждут подтверждения, проверки или снятия холда."
          delta="SLA 15 мин"
          tone="blue"
        />
        <FinanceKpiCard
          label="Platform revenue"
          value={<MoneyBreakdown totals={fees} />}
          description={`Комиссионный доход платформы по pay-in и payout операциям. Эквивалент: ${feesBase === null ? "курс USD/RUB не задан" : formatMoney(feesBase, "RUB")}.`}
          delta="+8.1%"
        />
        <FinanceKpiCard
          label="Success rate"
          value={`${successRate.toFixed(1)}%`}
          description={`${formatNumber(completedOrders.length)} завершенных ордеров из ${formatNumber(orders.length)}. Это главный показатель качества маршрутизации.`}
          delta="conversion"
          tone="moss"
        />
        <FinanceKpiCard
          label="Risk queue"
          value={formatNumber(riskOrders.length + openAppeals.length)}
          description="Ордера и апелляции, которые требуют внимания operator/support и могут влиять на баланс."
          delta="manual review"
          tone="red"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="section-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="eyebrow">Payment volume</p>
              <h2 className="section-title mt-2 text-ink">Оборот за 7 дней</h2>
              <p className="copy mt-2">
                График показывает управленческий RUB-эквивалент оборота. Исходные суммы RUB и USD в таблицах не смешиваются и показываются отдельно.
              </p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/55 px-4 py-3 text-sm">
              <p className="font-semibold text-ink">{turnoverBase === null ? "Курс не задан" : formatMoney(turnoverBase, "RUB")}</p>
              <p className="mt-1 text-xs text-graphite/55">Эквивалент общего оборота</p>
            </div>
          </div>
          <MiniBarChart points={paymentVolume7d} />
        </div>

        <div className="grid gap-5">
          <div className="section-card">
            <p className="eyebrow">Quality</p>
            <h2 className="section-title mt-2 text-ink">Success rate</h2>
            <SuccessRateChart value={successRate} />
          </div>
          <div className="section-card">
            <p className="eyebrow">Currency split</p>
            <h2 className="section-title mt-2 text-ink">Раздельно RUB и USD</h2>
            <div className="mt-4">
              <MoneyBreakdown totals={turnover} showZero />
            </div>
            <p className="copy mt-3">
              Это не “рубли и их долларовый эквивалент”, а реальные суммы в разных валютах. Для сводной аналитики отдельно считается RUB-эквивалент по курсу.
            </p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="eyebrow">Курсы валют</p>
            <h2 className="section-title mt-2 text-ink">Базовая валюта отчетности: RUB</h2>
            <p className="copy mt-2">
              RUB и USD хранятся как разные валюты. Для общей картины dashboard использует управленческий пересчет USD в RUB.
              {fx.usdRubRate ? ` Текущий курс: ${formatRate(fx.usdRubRate)} RUB за 1 USD.` : " Курс USD/RUB пока не задан."}
              {fx.usdRate ? ` Источник: ${fx.usdRate.source}, дата курса: ${formatDate(fx.usdRate.sourceDate)}.` : null}
            </p>
            {fx.warning ? <p className="mt-2 text-sm font-semibold text-brass">{fx.warning}</p> : null}
          </div>
          <Link href="/exchange-rates" className="focus-ring rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-moss">
            Открыть курсы
          </Link>
        </div>
      </section>

      <QuickScenarioLauncher />

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="section-card">
          <p className="eyebrow">Risk queue</p>
          <h2 className="section-title mt-2 text-ink">Что требует внимания</h2>
          <div className="mt-4 grid gap-3">
            {openAppeals.slice(0, 3).map((appeal) => (
              <InsightRow
                key={appeal.id}
                label={`${appeal.merchant.displayName} · ${appeal.order.externalId}`}
                value={<StatusBadge status={appeal.status} />}
                hint={`${appeal.reason}. Заморозка: ${formatMoney(toNumber(appeal.frozenAmount), appeal.order.currency)}.`}
              />
            ))}
            {riskOrders.slice(0, 3).map((order) => (
              <InsightRow
                key={order.id}
                label={`${order.externalId} · ${order.merchant.displayName}`}
                value={<StatusBadge status={order.status} />}
                hint={`Сумма: ${formatMoney(toNumber(order.amount), order.currency)}. Проверьте провайдера, реквизит и историю статусов.`}
              />
            ))}
            {!openAppeals.length && !riskOrders.length ? (
              <div className="rounded-2xl border border-ink/10 bg-white/55 p-4 text-sm text-graphite/65">Критичных задач нет. Это хорошее состояние для презентации стабильной операционной модели.</div>
            ) : null}
          </div>
        </div>

        <div className="section-card">
          <p className="eyebrow">API health</p>
          <h2 className="section-title mt-2 text-ink">Интеграции и webhooks</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <InsightRow label="Provider uptime" value={`${providerHealth.toFixed(1)}%`} hint="Средняя доступность подключенных демо-провайдеров." />
            <InsightRow label="Webhook events" value={formatNumber(events.filter((event) => event.type.includes("STATUS") || event.type.includes("SCENARIO")).length)} hint="События, которые можно показывать как callback/webhook поток." />
            <InsightRow label="Pending orders" value={formatNumber(pendingOrders.length)} hint="Операции, которые еще не дошли до финального статуса." />
          </div>
          <div className="mt-4 grid gap-3">
            {providers.slice(0, 4).map((provider) => (
              <div key={provider.id} className="grid gap-3 rounded-2xl border border-ink/10 bg-white/55 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-semibold text-ink">{provider.displayName}</p>
                  <p className="mt-1 text-xs text-graphite/55">{provider.type} · комиссия {formatRate(toNumber(provider.commissionRate) * 100)}%</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="status-dot" />
                  {provider.availability}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="section-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Payments</p>
              <h2 className="section-title mt-2 text-ink">Последние операции</h2>
            </div>
            <Link href="/orders" className="rounded-full border border-ink/10 bg-white/55 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-white">
              Все ордера
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {orders.slice(0, 6).map((order) => (
              <div key={order.id} className="grid gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-mono text-sm font-semibold text-ink">{order.externalId}</p>
                  <p className="mt-1 text-sm text-graphite/60">
                    {order.merchant.displayName} · {formatMoney(toNumber(order.amount), order.currency)} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Audit log</p>
              <h2 className="section-title mt-2 text-ink">Последние события</h2>
            </div>
            <Link href="/events" className="rounded-full border border-ink/10 bg-white/55 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-white">
              Журнал
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-ink/10 bg-white/55 p-4">
                <p className="text-sm font-semibold text-ink">{event.title}</p>
                <p className="mt-1 text-xs text-graphite/50">
                  {event.actorName} · {formatDate(event.createdAt)}
                </p>
                <p className="mt-2 text-sm leading-6 text-graphite/70">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EducationBlock
        items={[
          "Dashboard отвечает на главный вопрос: где деньги, что уже доступно, что заморожено и где платформа зарабатывает комиссию.",
          "RUB и USD показаны как отдельные валюты, чтобы не создавать ложное ощущение, что одна сумма является эквивалентом другой.",
          "Risk queue показывает операции, которые могут задержать деньги или потребовать ручного решения.",
          "Live-сценарии нужны для демонстрации инвестору или клиенту: они показывают не макет, а изменение данных, статусов, балансов и событий."
        ]}
      />
    </div>
  );
}
