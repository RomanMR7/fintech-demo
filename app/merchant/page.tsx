import Link from "next/link";
import { EducationBlock } from "@/components/education-block";
import { MerchantIntegrationPanel } from "@/components/merchant-integration-panel";
import { MetricCard } from "@/components/metric-card";
import { MoneyBreakdown } from "@/components/money-breakdown";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney, toNumber, totalByCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MerchantCabinetPage() {
  const merchant = await prisma.merchant.findUnique({
    where: { id: "merchant-orbita" },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 6 },
      payouts: { orderBy: { createdAt: "desc" }, take: 5 },
      balances: true,
      requisites: true,
      notifications: { orderBy: { createdAt: "desc" }, take: 5 }
    }
  });

  if (!merchant) return null;

  const available = totalByCurrency(merchant.balances.filter((balance) => balance.type === "AVAILABLE"), (balance) => balance.amount, (balance) => balance.currency);
  const frozen = totalByCurrency(merchant.balances.filter((balance) => balance.type === "FROZEN"), (balance) => balance.amount, (balance) => balance.currency);
  const fees = totalByCurrency(merchant.balances.filter((balance) => balance.type === "FEES"), (balance) => balance.amount, (balance) => balance.currency);
  const activeRequisites = merchant.requisites.filter((item) => item.status === "ACTIVE").length;

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Роль мерчанта"
        title={`Кабинет ${merchant.displayName}`}
        description="Мерчант видит только свои деньги и операции: доступный баланс, холды, выплаты, последние ордера, реквизиты и параметры API-интеграции."
      >
        <Link href="/api-demo" className="focus-ring rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss">
          Смотреть API
        </Link>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Доступно по валютам" value={<MoneyBreakdown totals={available} />} hint="Отдельные кошельки RUB и USD. Это реальные валюты операций, а не пересчет." accent="moss" />
        <MetricCard label="В hold по валютам" value={<MoneyBreakdown totals={frozen} />} hint="Деньги временно заморожены из-за выплат, проверки риска или апелляций." accent="brass" />
        <MetricCard label="Комиссии" value={<MoneyBreakdown totals={fees} />} hint="Удержанные комиссии по операциям в валюте исходного ордера." />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card rounded-[1.75rem] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Orders</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Последние ордера</h2>
            </div>
            <Link href="/orders" className="rounded-full border border-ink/10 bg-white/55 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-white">
              Все
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {merchant.orders.map((order) => (
              <div key={order.id} className="grid gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-mono text-sm font-semibold text-ink">{order.externalId}</p>
                  <p className="mt-1 text-sm text-graphite/55">
                    {formatMoney(toNumber(order.amount), order.currency)} · комиссия {formatMoney(toNumber(order.commission), order.currency)} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card rounded-[1.75rem] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Payouts</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Выплаты</h2>
            </div>
            <Link href="/payouts" className="rounded-full border border-ink/10 bg-white/55 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-white">
              Открыть
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {merchant.payouts.map((payout) => (
              <div key={payout.id} className="grid gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold text-ink">{payout.recipient}</p>
                  <p className="mt-1 text-sm text-graphite/55">
                    {formatMoney(toNumber(payout.amount), payout.currency)} · комиссия {formatMoney(toNumber(payout.commission), payout.currency)}
                  </p>
                </div>
                <StatusBadge status={payout.status} type="payout" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <MerchantIntegrationPanel apiKey={merchant.apiKey} callbackUrl={merchant.callbackUrl} activeRequisites={activeRequisites} totalRequisites={merchant.requisites.length} />

      <section className="card rounded-[1.75rem] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Notifications</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Что важно мерчанту</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {merchant.notifications.map((notification) => (
            <div key={notification.id} className="rounded-2xl border border-ink/10 bg-white/55 p-4">
              <p className="font-semibold text-ink">{notification.title}</p>
              <p className="mt-2 text-sm leading-6 text-graphite/68">{notification.message}</p>
              <p className="mt-2 text-xs text-graphite/45">{formatDate(notification.createdAt)}</p>
            </div>
          ))}
        </div>
      </section>

      <EducationBlock
        items={[
          "Кабинет мерчанта намеренно проще админки: здесь только собственные операции, деньги, выплаты и API-подключение.",
          "API key и callback URL показаны как demo-поля. Copy и Rotate key нужны, чтобы объяснить инвестору или клиенту процесс интеграции.",
          "Integration checklist показывает, готов ли мерчант принимать платежи и получать webhook-уведомления.",
          "Если статус ордера становится спорным, часть денег уходит в hold, а support получает задачу на разбор."
        ]}
      />
    </div>
  );
}
