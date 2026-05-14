import Link from "next/link";
import { EducationBlock } from "@/components/education-block";
import { MerchantAdminClient } from "@/components/merchant-admin-client";
import { MetricCard } from "@/components/metric-card";
import { MoneyBreakdown } from "@/components/money-breakdown";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney, formatNumber, formatRate, toNumber, totalByCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getPermissionMatrix, permissionLabels } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function riskLevel(disputes: number, volume: number) {
  if (disputes >= 2 || volume > 250000) return { label: "High", className: "border-red-500/20 bg-red-500/10 text-red-700" };
  if (disputes === 1 || volume > 120000) return { label: "Review", className: "border-brass/25 bg-brass/10 text-brass" };
  return { label: "Low", className: "border-jade/20 bg-jade/10 text-jade" };
}

export default async function AdminPage() {
  const [merchants, providers, users, orders, payouts, appeals, balances] = await Promise.all([
    prisma.merchant.findMany({
      include: {
        balances: true,
        orders: { orderBy: { createdAt: "desc" }, take: 10 },
        appeals: true
      },
      orderBy: { displayName: "asc" }
    }),
    prisma.provider.findMany({ orderBy: { displayName: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.paymentOrder.findMany(),
    prisma.payout.findMany(),
    prisma.appeal.findMany(),
    prisma.balanceAccount.findMany()
  ]);

  const totalVolume = totalByCurrency(orders, (order) => order.amount, (order) => order.currency);
  const frozenFunds = totalByCurrency(balances.filter((balance) => balance.type === "FROZEN"), (balance) => balance.amount, (balance) => balance.currency);
  const platformFees = totalByCurrency(
    [
      ...orders.map((order) => ({ amount: order.commission, currency: order.currency })),
      ...payouts.map((payout) => ({ amount: payout.commission, currency: payout.currency }))
    ],
    (item) => item.amount,
    (item) => item.currency
  );
  const openDisputes = appeals.filter((appeal) => ["NEW", "OPEN"].includes(appeal.status)).length + orders.filter((order) => order.status === "DISPUTED").length;
  const permissionMatrix = getPermissionMatrix();

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Платформенный контроль"
        title="Админ-панель"
        description="Администратор видит всю систему: мерчантов, лимиты, комиссии, провайдеров, риск-очередь, frozen funds и состояние интеграций."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total volume" value={<MoneyBreakdown totals={totalVolume} />} hint="Оборот по исходным валютам операций." />
        <MetricCard label="Active merchants" value={formatNumber(merchants.filter((merchant) => merchant.status === "active").length)} hint={`Всего подключено: ${formatNumber(merchants.length)}.`} accent="moss" />
        <MetricCard label="Frozen funds" value={<MoneyBreakdown totals={frozenFunds} />} hint="Деньги в hold из-за выплат, risk и апелляций." accent="brass" />
        <MetricCard label="Platform fees" value={<MoneyBreakdown totals={platformFees} />} hint="Комиссионный доход платформы." />
        <MetricCard label="Open disputes" value={formatNumber(openDisputes)} hint="Операции и апелляции, требующие решения." accent="red" />
      </section>

      <MerchantAdminClient merchants={merchants.map((merchant) => ({ id: merchant.id, displayName: merchant.displayName, name: merchant.name }))} />

      <details className="section-card group">
        <summary className="focus-ring flex cursor-pointer list-none flex-col gap-3 rounded-[var(--radius-lg)] outline-none md:flex-row md:items-start md:justify-between [&::-webkit-details-marker]:hidden">
          <div>
            <p className="eyebrow">RBAC</p>
            <h2 className="section-title mt-2 text-ink">Матрица прав</h2>
            <p className="copy mt-2 max-w-3xl">Показывает, какие роли могут выполнять критичные действия. В demo UI недоступные действия блокируются и объясняют причину.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pill">Sandbox access control</span>
            <span className="pill bg-white/60 text-ink">Показать / скрыть</span>
          </div>
        </summary>
        <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {permissionMatrix.map((row) => (
            <article
              key={row.role}
              className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/55 p-4 shadow-insetSoft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-ink">{row.role}</p>
                  <p className="copy-sm mt-1">{row.actions.length} доступных действий</p>
                </div>
                <span className="pill bg-jade/10 text-jade">{row.actions.length}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {row.actions.map((action) => (
                  <span
                    key={action}
                    className="rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-graphite/72"
                  >
                    {permissionLabels[action]}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </details>

      <section className="section-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Merchant portfolio</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Мерчанты, лимиты и риск</h2>
            <p className="mt-2 text-sm leading-6 text-graphite/68">Админ видит, кто приносит оборот, где высокий риск и какие комиссии применяются.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/events" className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss">
              Audit log
            </Link>
            <Link href="/integrations" className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white">
              Интеграции
            </Link>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="enterprise-table min-w-[1120px] text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">Merchant</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Balance</th>
                <th className="px-4 py-2">Trust limit</th>
                <th className="px-4 py-2">Fees</th>
                <th className="px-4 py-2">Risk</th>
                <th className="px-4 py-2">Last activity</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((merchant) => {
                const available = totalByCurrency(merchant.balances.filter((balance) => balance.type === "AVAILABLE"), (balance) => balance.amount, (balance) => balance.currency);
                const merchantVolume = merchant.orders.reduce((sum, order) => sum + toNumber(order.amount), 0);
                const risk = riskLevel(merchant.appeals.filter((appeal) => ["NEW", "OPEN"].includes(appeal.status)).length, merchantVolume);
                const lastActivity = merchant.orders[0]?.createdAt ?? merchant.createdAt;

                return (
                  <tr key={merchant.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{merchant.displayName}</p>
                      <p className="mt-1 text-xs text-graphite/55">{merchant.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-jade/20 bg-jade/10 px-2.5 py-1 text-xs font-semibold text-jade">{merchant.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <MoneyBreakdown totals={available} />
                    </td>
                    <td className="px-4 py-3 font-mono">{formatMoney(toNumber(merchant.trustLimit), "RUB")}</td>
                    <td className="px-4 py-3">
                      <p>Pay-in {formatRate(toNumber(merchant.payinFeeRate) * 100)}%</p>
                      <p className="mt-1 text-xs text-graphite/55">Payout {formatRate(toNumber(merchant.payoutFeeRate) * 100)}%</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${risk.className}`}>{risk.label}</span>
                    </td>
                    <td className="px-4 py-3">{formatDate(lastActivity)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/merchant?merchantId=${encodeURIComponent(merchant.id)}`} className="rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-white">
                        Открыть
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="section-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Providers</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Провайдеры</h2>
          <div className="mt-4 grid gap-3">
            {providers.map((provider) => (
              <div key={provider.id} className="grid gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold text-ink">{provider.displayName}</p>
                  <p className="mt-1 text-sm text-graphite/55">
                    {provider.type} · availability {provider.availability}% · комиссия {formatRate(toNumber(provider.commissionRate) * 100)}%
                  </p>
                </div>
                <StatusBadge status={provider.status} type="provider" />
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Users</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Роли demo-контура</h2>
          <div className="mt-4 grid gap-3">
            {users.slice(0, 6).map((user) => (
              <div key={user.id} className="rounded-2xl border border-ink/10 bg-white/55 p-4">
                <p className="font-semibold text-ink">{user.name}</p>
                <p className="mt-1 text-sm text-graphite/60">
                  {user.role} · {user.email}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EducationBlock
        items={[
          "Админ-панель нужна для полного контроля платформы: кто подключен, где деньги, какие комиссии и где риск.",
          "Frozen funds важны для доверия: платформа показывает, какие средства нельзя вывести до решения проверки или апелляции.",
          "Risk level здесь демонстрационный, но показывает принцип: крупные обороты и открытые споры требуют внимания.",
          "В реальном продукте на этом уровне добавляются права доступа, audit policies, лимиты маршрутизации и комплаенс-правила."
        ]}
      />
    </div>
  );
}
