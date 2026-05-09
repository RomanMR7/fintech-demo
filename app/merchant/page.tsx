import Link from "next/link";
import { EducationBlock } from "@/components/education-block";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney, toNumber } from "@/lib/format";
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

  const available = merchant.balances.find((balance) => balance.type === "AVAILABLE");
  const frozen = merchant.balances.find((balance) => balance.type === "FROZEN");
  const fees = merchant.balances.find((balance) => balance.type === "FEES");

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
        <MetricCard label="Доступно" value={formatMoney(toNumber(available?.amount ?? 0))} hint="Можно использовать для выплат." accent="moss" />
        <MetricCard label="В холде" value={formatMoney(toNumber(frozen?.amount ?? 0))} hint="Споры и выплаты на проверке." accent="brass" />
        <MetricCard label="Комиссии" value={formatMoney(toNumber(fees?.amount ?? 0))} hint="Удержанные комиссии по операциям." />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Последние ордера</h2>
          <div className="mt-4 grid gap-3">
            {merchant.orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 p-4">
                <div>
                  <p className="font-semibold">{order.externalId}</p>
                  <p className="text-sm text-graphite/55">{formatMoney(toNumber(order.amount))} · {formatDate(order.createdAt)}</p>
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
