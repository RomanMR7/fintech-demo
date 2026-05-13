import { EducationBlock } from "@/components/education-block";
import { BalanceAdjustClient } from "@/components/balance-adjust-client";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { formatDate, formatMoney, toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BalancesPage() {
  const [balances, transactions, merchants] = await Promise.all([
    prisma.balanceAccount.findMany({ include: { merchant: true }, orderBy: [{ merchantId: "asc" }, { type: "asc" }] }),
    prisma.balanceTransaction.findMany({ include: { merchant: true }, orderBy: { createdAt: "desc" }, take: 18 }),
    prisma.merchant.findMany({ orderBy: { displayName: "asc" } })
  ]);

  const available = balances.filter((item) => item.type === "AVAILABLE").reduce((sum, item) => sum + toNumber(item.amount), 0);
  const frozen = balances.filter((item) => item.type === "FROZEN").reduce((sum, item) => sum + toNumber(item.amount), 0);
  const fees = balances.filter((item) => item.type === "FEES").reduce((sum, item) => sum + toNumber(item.amount), 0);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Финансовая модель"
        title="Балансы"
        description="Баланс показывает, какие средства доступны мерчанту, какие заморожены по выплатам/спорам и сколько удержано комиссий."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Доступный баланс" value={formatMoney(available)} hint="Можно использовать для выплат или операций." accent="moss" />
        <MetricCard label="Замороженный баланс" value={formatMoney(frozen)} hint="Холды по выплатам и апелляциям." accent="brass" />
        <MetricCard label="Комиссии" value={formatMoney(fees)} hint="Удержанные комиссии платформы и провайдеров." />
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
