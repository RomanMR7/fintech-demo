import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";
import { formatMoney, toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CommissionsPage() {
  const [rules, merchants, providers] = await Promise.all([
    prisma.commissionRule.findMany({ orderBy: { name: "asc" } }),
    prisma.merchant.findMany({ orderBy: { displayName: "asc" } }),
    prisma.provider.findMany({ orderBy: { displayName: "asc" } })
  ]);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Монетизация"
        title="Комиссии"
        description="Демо показывает, из чего складывается комиссия: ставка мерчанта, ставка выплаты, доля платформы и комиссия провайдера."
      />
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Правила комиссий</h2>
          <div className="mt-4 grid gap-3">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-2xl bg-white/60 p-4">
                <div className="flex justify-between gap-4">
                  <p className="font-semibold">{rule.name}</p>
                  <p className="font-semibold">{(toNumber(rule.rate) * 100).toFixed(2)}%</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-graphite/65">{rule.description}</p>
                <p className="mt-2 text-xs text-graphite/45">Диапазон: {formatMoney(toNumber(rule.minAmount))} - {toNumber(rule.maxAmount) ? formatMoney(toNumber(rule.maxAmount)) : "без лимита"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="card rounded-[1.75rem] p-5">
            <h2 className="font-display text-2xl font-semibold">Ставки мерчантов</h2>
            <div className="mt-4 grid gap-3">
              {merchants.map((merchant) => (
                <div key={merchant.id} className="flex justify-between rounded-2xl bg-white/60 p-4 text-sm">
                  <span className="font-semibold">{merchant.displayName}</span>
                  <span>Прием {(toNumber(merchant.payinFeeRate) * 100).toFixed(2)}% · Выплаты {(toNumber(merchant.payoutFeeRate) * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card rounded-[1.75rem] p-5">
            <h2 className="font-display text-2xl font-semibold">Комиссии провайдеров</h2>
            <div className="mt-4 grid gap-3">
              {providers.map((provider) => (
                <div key={provider.id} className="flex justify-between rounded-2xl bg-white/60 p-4 text-sm">
                  <span className="font-semibold">{provider.displayName}</span>
                  <span>{(toNumber(provider.commissionRate) * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <EducationBlock
        items={[
          "Комиссия фиксируется на ордере, чтобы будущие изменения ставок не ломали историю.",
          "Платформенная прибыль может быть частью общей комиссии или отдельной ставкой.",
          "Комиссия выплаты резервируется вместе с суммой выплаты.",
          "В реальном продукте правила могли бы зависеть от страны, банка, типа реквизита, лимитов и SLA провайдера."
        ]}
      />
    </div>
  );
}
