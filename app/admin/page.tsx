import Link from "next/link";
import { EducationBlock } from "@/components/education-block";
import { MerchantAdminClient } from "@/components/merchant-admin-client";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [merchants, providers, users, orders, appeals] = await Promise.all([
    prisma.merchant.findMany({ orderBy: { displayName: "asc" } }),
    prisma.provider.findMany({ orderBy: { displayName: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.paymentOrder.findMany(),
    prisma.appeal.findMany()
  ]);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Платформенный контроль"
        title="Админ-панель"
        description="Администратор видит всю систему целиком: участников, провайдеров, статусы операций, спорные зоны и настройки."
      />
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Мерчанты" value={formatNumber(merchants.length)} hint="Подключенные клиенты платформы." />
        <MetricCard label="Провайдеры" value={formatNumber(providers.length)} hint="Интеграции и каскады." accent="moss" />
        <MetricCard label="Пользователи" value={formatNumber(users.length)} hint="Роли демо-контура." accent="brass" />
        <MetricCard label="Риски" value={formatNumber(orders.filter((order) => order.status === "DISPUTED").length + appeals.filter((appeal) => ["NEW", "OPEN"].includes(appeal.status)).length)} hint="Споры и активные апелляции." accent="red" />
      </section>

      <MerchantAdminClient merchants={merchants.map((merchant) => ({ id: merchant.id, displayName: merchant.displayName, name: merchant.name }))} />

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Мерчанты</h2>
          <div className="mt-4 grid gap-3">
            {merchants.map((merchant) => (
              <div key={merchant.id} className="rounded-2xl bg-white/60 p-4">
                <p className="font-semibold">{merchant.displayName}</p>
                <p className="mt-1 text-sm text-graphite/55">{merchant.name} · trust limit {merchant.trustLimit.toString()} RUB</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Провайдеры</h2>
          <div className="mt-4 grid gap-3">
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 p-4">
                <div>
                  <p className="font-semibold">{provider.displayName}</p>
                  <p className="text-sm text-graphite/55">{provider.type}</p>
                </div>
                <StatusBadge status={provider.status} type="provider" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/events" className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">Открыть журнал</Link>
        <Link href="/integrations" className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-ink">Интеграции</Link>
      </div>
      <EducationBlock
        items={[
          "Администраторская роль нужна для полного обзора и настройки платформы.",
          "В демо нет опасных действий вроде удаления данных, чтобы прототип оставался безопасным.",
          "Главный фокус админки: контроль состояния, рисков и интеграций.",
          "Для реального продукта здесь добавились бы права, аудит, настройки маршрутизации и лимиты."
        ]}
      />
    </div>
  );
}
