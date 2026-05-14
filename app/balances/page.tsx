import { EducationBlock } from "@/components/education-block";
import { BalanceAdjustClient } from "@/components/balance-adjust-client";
import { MetricCard } from "@/components/metric-card";
import { MoneyBreakdown } from "@/components/money-breakdown";
import { PageHeader } from "@/components/page-header";
import { convertBreakdownToBase, getFxSnapshot } from "@/lib/fx";
import { formatDate, formatMoney, formatMoneyBreakdown, formatRate, toNumber, totalByCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BalancesPage() {
  const [balances, transactions, merchants, fx] = await Promise.all([
    prisma.balanceAccount.findMany({ include: { merchant: true }, orderBy: [{ merchantId: "asc" }, { type: "asc" }] }),
    prisma.balanceTransaction.findMany({ include: { merchant: true }, orderBy: { createdAt: "desc" }, take: 18 }),
    prisma.merchant.findMany({ orderBy: { displayName: "asc" } }),
    getFxSnapshot()
  ]);

  const available = totalByCurrency(balances.filter((item) => item.type === "AVAILABLE"), (item) => item.amount, (item) => item.currency);
  const frozen = totalByCurrency(balances.filter((item) => item.type === "FROZEN"), (item) => item.amount, (item) => item.currency);
  const fees = totalByCurrency(balances.filter((item) => item.type === "FEES"), (item) => item.amount, (item) => item.currency);
  const availableBase = convertBreakdownToBase(available, fx);
  const frozenBase = convertBreakdownToBase(frozen, fx);
  const feesBase = convertBreakdownToBase(fees, fx);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Финансовая модель"
        title="Балансы"
        description="Баланс показывает, какие средства доступны мерчанту, какие заморожены по выплатам/спорам и сколько удержано комиссий."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Доступно по валютам"
          value={<MoneyBreakdown totals={available} />}
          hint={`Это отдельные кошельки, не пересчет. Управленческий эквивалент в RUB: ${availableBase === null ? "курс не задан" : formatMoney(availableBase, "RUB")}.`}
          accent="moss"
        />
        <MetricCard
          label="Холды по валютам"
          value={<MoneyBreakdown totals={frozen} />}
          hint={`Это отдельные замороженные суммы. Управленческий эквивалент в RUB: ${frozenBase === null ? "курс не задан" : formatMoney(frozenBase, "RUB")}.`}
          accent="brass"
        />
        <MetricCard
          label="Комиссии по валютам"
          value={<MoneyBreakdown totals={fees} />}
          hint={`Комиссии хранятся в валюте операции. Управленческий эквивалент в RUB: ${feesBase === null ? "курс не задан" : formatMoney(feesBase, "RUB")}.`}
        />
      </section>

      <section className="card rounded-[1.75rem] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Пересчет валют</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">RUB и USD хранятся раздельно</h2>
            <p className="mt-2 text-sm leading-6 text-graphite/68">
              Балансы не конвертируются автоматически при движении денег. Курс используется только для управленческого рублевого эквивалента.
              {fx.usdRubRate ? ` Текущий USD/RUB в демо: ${formatRate(fx.usdRubRate)}.` : " Курс USD/RUB пока не задан."}
            </p>
          </div>
          <a href="/exchange-rates" className="rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-moss">
            Управлять курсом
          </a>
        </div>
      </section>

      <BalanceAdjustClient merchants={merchants.map((merchant) => ({ id: merchant.id, displayName: merchant.displayName }))} />

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Состояние счетов</h2>
          <div className="mt-4 grid gap-3">
            {balances.map((balance) => (
              <div key={balance.id} className="rounded-2xl bg-white/60 p-4">
                <div className="flex justify-between gap-4">
                  <p className="font-semibold">{balance.merchant.displayName}</p>
                  <p className="font-semibold">{formatMoney(toNumber(balance.amount), balance.currency)}</p>
                </div>
                <p className="mt-1 text-sm text-graphite/55">{balance.type === "AVAILABLE" ? "Доступный" : balance.type === "FROZEN" ? "Замороженный" : "Комиссии"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">История изменений</h2>
          <div className="mt-4 grid gap-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="rounded-2xl border border-ink/10 bg-white/55 p-4">
                <div className="flex justify-between gap-3">
                  <p className="font-semibold">{tx.description}</p>
                  <p className="shrink-0 font-semibold">{formatMoney(toNumber(tx.amount), tx.currency)}</p>
                </div>
                <p className="mt-1 text-sm text-graphite/55">{tx.merchant.displayName} · {tx.direction} · {formatDate(tx.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EducationBlock
        items={[
          "Успешный прием платежа увеличивает доступный баланс на сумму за вычетом комиссии.",
          "Выплата сначала переводит деньги в холд, чтобы исключить двойное использование средств.",
          "Апелляция может заморозить часть суммы до решения support-команды.",
          "Журнал транзакций нужен для объяснимости: почему баланс изменился и кто инициировал действие."
        ]}
      />
    </div>
  );
}
