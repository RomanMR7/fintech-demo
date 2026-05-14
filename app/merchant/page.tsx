import Link from "next/link";
import { EducationBlock } from "@/components/education-block";
import { MetricCard } from "@/components/metric-card";
import { MoneyBreakdown } from "@/components/money-breakdown";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney, formatMoneyBreakdown, toNumber, totalByCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MerchantCabinetPage() {
  const merchant = await prisma.merchant.findUnique({
    where: { id: "merchant-orbita" },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 5 },
      payouts: { orderBy: { createdAt: "desc" }, take: 4 },
      balances: true,
      requisites: true,
      notifications: { orderBy: { createdAt: "desc" }, take: 4 }
    }
  });

  if (!merchant) return null;

  const available = totalByCurrency(merchant.balances.filter((balance) => balance.type === "AVAILABLE"), (balance) => balance.amount, (balance) => balance.currency);
  const frozen = totalByCurrency(merchant.balances.filter((balance) => balance.type === "FROZEN"), (balance) => balance.amount, (balance) => balance.currency);
  const fees = totalByCurrency(merchant.balances.filter((balance) => balance.type === "FEES"), (balance) => balance.amount, (balance) => balance.currency);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Роль мерчанта"
        title={`Кабинет ${merchant.displayName}`}
        description="Мерчант видит свои операции, доступный баланс, выплаты, реквизиты, уведомления и API-параметры."
      >
        <Link href="/api-demo" className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">
          Смотреть API
        </Link>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Доступно по валютам" value={<MoneyBreakdown totals={available} />} hint="Это отдельные кошельки мерчанта в RUB и USD, не пересчет." accent="moss" />
        <MetricCard label="В холде по валютам" value={<MoneyBreakdown totals={frozen} />} hint="Споры и выплаты на проверке, раздельно по валютам." accent="brass" />
        <MetricCard label="Комиссии по валютам" value={<MoneyBreakdown totals={fees} />} hint="Удержанные комиссии в валюте исходной операции." />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Последние ордера</h2>
          <div className="mt-4 grid gap-3">
            {merchant.orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 p-4">
                <div>
                  <p className="font-semibold">{order.externalId}</p>
                  <p className="text-sm text-graphite/55">{formatMoney(toNumber(order.amount), order.currency)} · {formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Настройки интеграции</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="rounded-2xl bg-white/60 p-4">
              <p className="text-graphite/55">API key</p>
              <p className="mt-1 font-mono font-semibold">{merchant.apiKey}</p>
            </div>
            <div className="rounded-2xl bg-white/60 p-4">
              <p className="text-graphite/55">Callback URL</p>
              <p className="mt-1 break-all font-mono font-semibold">{merchant.callbackUrl}</p>
            </div>
            <div className="rounded-2xl bg-white/60 p-4">
              <p className="text-graphite/55">Активные реквизиты</p>
              <p className="mt-1 font-semibold">{merchant.requisites.filter((item) => item.status === "ACTIVE").length} из {merchant.requisites.length}</p>
            </div>
          </div>
        </div>
      </section>

      <EducationBlock
        items={[
          "Кабинет мерчанта намеренно проще админки: только собственные данные и бизнес-действия.",
          "Мерчант создает ордера и выплаты, но не управляет чужими провайдерами или глобальными статусами.",
          "API key и callback URL показаны как демо-поля, без настоящей авторизации.",
          "При переключении роли в верхней панели таблицы начинают показывать merchant-view."
        ]}
      />
    </div>
  );
}
