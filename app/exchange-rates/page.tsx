import Link from "next/link";

import { EducationBlock } from "@/components/education-block";
import { ExchangeRateRefreshButton } from "@/components/exchange-rate-refresh-button";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { getFxSnapshot } from "@/lib/fx";
import { formatDate, formatRate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ExchangeRatesPage() {
  const fx = await getFxSnapshot();
  const usdRate = fx.usdRate;

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Валютный контроль"
        title="Курсы валют"
        description="Здесь видно, по какому курсу демо пересчитывает USD в базовую валюту RUB для дашборда, балансов и коммерческой модели."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Базовая валюта" value="RUB" hint="Все управленческие эквиваленты считаются в рублях." />
        <MetricCard
          label="USD/RUB"
          value={usdRate ? `${formatRate(usdRate.rate)} RUB` : "нет курса"}
          hint={usdRate ? `За 1 USD. Источник: ${usdRate.source}.` : "Нужно обновить или выполнить seed."}
          accent={fx.isStale ? "brass" : "moss"}
        />
        <MetricCard
          label="Актуальность"
          value={fx.isStale ? "требует обновления" : "актуально"}
          hint={usdRate ? `Дата курса: ${formatDate(usdRate.sourceDate)}. Получен: ${formatDate(usdRate.fetchedAt)}.` : "Курс пока не сохранен."}
          accent={fx.isStale ? "red" : "moss"}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Обновление курса</h2>
          <p className="mt-2 text-sm leading-6 text-graphite/68">
            Кнопка обращается к локальному API route, сервер получает справочный курс ЦБ РФ и сохраняет запись в SQLite через Prisma.
            Если внешний источник временно недоступен, приложение продолжает работать на последнем сохраненном курсе.
          </p>
          {fx.warning ? <p className="mt-3 rounded-2xl bg-brass/12 px-4 py-3 text-sm font-semibold text-brass">{fx.warning}</p> : null}
          <div className="mt-5">
            <ExchangeRateRefreshButton />
          </div>
        </div>

        <div className="card rounded-[1.75rem] p-5">
          <h2 className="font-display text-2xl font-semibold">Сохраненные курсы</h2>
          <div className="mt-4 grid gap-3">
            {fx.rates.length ? (
              fx.rates.map((rate) => (
                <div key={rate.id} className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{rate.quoteCurrency} → {rate.baseCurrency}</p>
                      <p className="mt-1 text-sm text-graphite/60">{rate.note ?? "Курс для демо-пересчета."}</p>
                    </div>
                    <p className="font-display text-2xl font-semibold">{formatRate(rate.rate)} RUB</p>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-graphite/45">
                    Источник {rate.source} · дата {formatDate(rate.sourceDate)} · {rate.isManual ? "ручной/fallback" : "получен автоматически"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-white/60 p-4 text-sm text-graphite/65">Курсов пока нет. Запустите seed или нажмите обновление.</div>
            )}
          </div>
        </div>
      </section>

      <section className="card rounded-[1.75rem] bg-ink p-5 text-white">
        <h2 className="font-display text-2xl font-semibold">Почему это важно для инвестора и клиента</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-white/75">
          Если платформа работает с RUB и USD, нельзя просто сложить 100 000 RUB и 2 000 USD как одну сумму. Нужно показать исходные валюты,
          курс, дату курса и управленческий эквивалент. Так финансовые показатели выглядят честно, объяснимо и пригодно для обсуждения экономики продукта.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-jade hover:text-white">На дашборд</Link>
          <Link href="/commercial" className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink">Экономика</Link>
          <Link href="/balances" className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink">Балансы</Link>
        </div>
      </section>

      <EducationBlock
        items={[
          "Курс нужен только для управленческого эквивалента: оригинальные суммы ордеров, выплат и балансов остаются в своей валюте.",
          "Источник ЦБ РФ используется как справочный курс для демо, а не как биржевой real-time курс.",
          "Если курс устарел, система явно показывает предупреждение, чтобы не вводить зрителя в заблуждение.",
          "В реальном продукте можно добавить несколько источников курсов, историю, ручное утверждение и правила округления."
        ]}
      />
    </div>
  );
}
