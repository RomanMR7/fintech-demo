import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const providers = await prisma.provider.findMany({ orderBy: { displayName: "asc" } });

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Внешний контур"
        title="Интеграции"
        description="Провайдеры и интеграторы в демо показывают доступность, комиссии, тестовый режим и возможность pay-in/pay-out."
      />
      <section className="grid gap-4 lg:grid-cols-2">
        {providers.map((provider) => (
          <article key={provider.id} className="card rounded-[1.75rem] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl font-semibold">{provider.displayName}</p>
                <p className="mt-1 text-sm text-graphite/60">{provider.type} · {provider.name}</p>
              </div>
              <StatusBadge status={provider.status} type="provider" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-graphite/45">Комиссия</p>
                <p className="mt-2 font-display text-2xl font-semibold">{(toNumber(provider.commissionRate) * 100).toFixed(2)}%</p>
              </div>
              <div className="rounded-2xl bg-white/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-graphite/45">Доступность</p>
                <p className="mt-2 font-display text-2xl font-semibold">{provider.availability}%</p>
              </div>
              <div className="rounded-2xl bg-white/60 p-4 text-sm">
                Pay-in: {provider.payinAvailable ? "доступен" : "нет"}
              </div>
              <div className="rounded-2xl bg-white/60 p-4 text-sm">
                Pay-out: {provider.payoutAvailable ? "доступен" : "нет"}
              </div>
            </div>
          </article>
        ))}
      </section>
      <EducationBlock
        items={[
          "Интеграции в демо не делают реальные запросы, но показывают, какие параметры обычно важны.",
          "Доступность и статус провайдера влияют на маршрутизацию ордера.",
          "Комиссия провайдера участвует в экономике операции.",
          "Тестовый режим нужен, чтобы демонстрировать API без реальных платежей."
        ]}
      />
    </div>
  );
}
