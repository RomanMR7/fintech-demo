import Link from "next/link";
import { CommercialCalculatorClient } from "@/components/commercial-calculator-client";
import { EducationBlock } from "@/components/education-block";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { convertBreakdownToBase, getFxSnapshot } from "@/lib/fx";
import { formatMoney, formatMoneyBreakdown, formatNumber, sumMoneyTotals, totalByCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CommercialPage() {
  const [orders, payouts, balances, appeals, merchants, providers, fx] = await Promise.all([
    prisma.paymentOrder.findMany({ include: { merchant: true } }),
    prisma.payout.findMany({ include: { merchant: true } }),
    prisma.balanceAccount.findMany(),
    prisma.appeal.findMany(),
    prisma.merchant.findMany({ orderBy: { displayName: "asc" } }),
    prisma.provider.findMany({ orderBy: { displayName: "asc" } }),
    getFxSnapshot()
  ]);

  const payinTurnover = totalByCurrency(orders, (order) => order.amount, (order) => order.currency);
  const payoutTurnover = totalByCurrency(payouts, (payout) => payout.amount, (payout) => payout.currency);
  const payinFees = totalByCurrency(orders, (order) => order.commission, (order) => order.currency);
  const payoutFees = totalByCurrency(payouts, (payout) => payout.commission, (payout) => payout.currency);
  const frozen = totalByCurrency(balances.filter((balance) => balance.type === "FROZEN"), (balance) => balance.amount, (balance) => balance.currency);
  const activeAppeals = appeals.filter((appeal) => ["NEW", "OPEN"].includes(appeal.status)).length;
  const grossFees = sumMoneyTotals(payinFees, payoutFees);
  const payinTurnoverBase = convertBreakdownToBase(payinTurnover, fx);
  const payoutTurnoverBase = convertBreakdownToBase(payoutTurnover, fx);
  const grossFeesBase = convertBreakdownToBase(grossFees, fx);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Для инвестора и клиента"
        title="Коммерческая модель"
        description="Страница для разговора с инвестором или клиентом: как продукт зарабатывает, какие рычаги роста есть и какую ценность дает операционный контроль."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Оборот приема" value={formatMoneyBreakdown(payinTurnover)} hint={`Эквивалент: ${payinTurnoverBase === null ? "курс не задан" : formatMoney(payinTurnoverBase, "RUB")}.`} accent="moss" />
        <MetricCard label="Оборот выплат" value={formatMoneyBreakdown(payoutTurnover)} hint={`Эквивалент: ${payoutTurnoverBase === null ? "курс не задан" : formatMoney(payoutTurnoverBase, "RUB")}.`} accent="brass" />
        <MetricCard label="Комиссии в демо" value={formatMoneyBreakdown(grossFees)} hint={`Эквивалент: ${grossFeesBase === null ? "курс не задан" : formatMoney(grossFeesBase, "RUB")}.`} />
        <MetricCard label="Активные риски" value={formatNumber(activeAppeals)} hint={`Холды: ${formatMoneyBreakdown(frozen)}`} accent="red" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <div className="card rounded-[1.75rem] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Почему это можно продавать</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Продукт упаковывает платежный оборот в управляемую систему</h2>
          <div className="mt-5 grid gap-3">
            {[
              ["Оборот", "Чем больше операций приема и выплат проходит через платформу, тем выше комиссия."],
              ["Контроль", "Статусы, холды и журнал событий снижают хаос и помогают объяснить каждую финансовую операцию."],
              ["Риски", "Апелляции и заморозки защищают платформу от спорных выводов и ручных ошибок."],
              ["Дополнительная продажа", "API, индивидуальные лимиты, аналитика, SLA и интеграции могут продаваться как расширенные модули."]
            ].map((item, index) => (
              <div key={item[0]} className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                <div className="flex items-start gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${index % 2 ? "bg-brass" : "bg-jade"}`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{item[0]}</p>
                    <p className="mt-1 text-sm leading-6 text-graphite/65">{item[1]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card rounded-[1.75rem] bg-ink p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Простая формула</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Доход = оборот × комиссия + снижение потерь</h2>
          <div className="mt-5 grid gap-3 text-sm leading-6 text-white/76">
            <p><span className="font-semibold text-white">Прием платежей:</span> мерчант платит комиссию за прием платежей.</p>
            <p><span className="font-semibold text-white">Выплаты:</span> мерчант платит комиссию за вывод средств.</p>
            <p><span className="font-semibold text-white">Снижение потерь:</span> платформа меньше теряет на спорных операциях, ошибках и ручной обработке.</p>
            <p><span className="font-semibold text-white">Расширенные модули:</span> крупные клиенты могут платить за SLA, индивидуальные лимиты, интеграции и аналитику.</p>
          </div>
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Демо-контур</p>
            <p className="mt-2 text-sm leading-6 text-white/78">
              Сейчас в базе {merchants.length} мерчанта, {providers.length} провайдеров, {orders.length} ордеров и {payouts.length} выплат. Этого достаточно, чтобы показать механику продаж и операционный контроль.
            </p>
          </div>
        </div>
      </section>

      <CommercialCalculatorClient usdRubRate={fx.usdRubRate} />

      <section className="grid gap-4 xl:grid-cols-3">
        {[
          ["Пилот для клиента", "Настроить роли, комиссии, сценарии и демо-данные под конкретного мерчанта. Цель: быстро проверить, подходит ли продукт процессам клиента."],
          ["SaaS-подписка", "Продавать платформу как операционный кабинет для платежей, выплат, балансов и апелляций. Цель: регулярный доход поверх платежного оборота."],
          ["Партнерская модель", "Подключать провайдеров, интеграторов и платежные команды. Цель: масштабировать продажи через совместные внедрения."]
        ].map((item) => (
          <div key={item[0]} className="card rounded-[1.75rem] p-5">
            <h3 className="font-display text-xl font-semibold">{item[0]}</h3>
            <p className="mt-3 text-sm leading-6 text-graphite/68">{item[1]}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/scenarios" className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss">Показать сценарии</Link>
        <Link href="/balances" className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white">Открыть балансы</Link>
        <Link href="/admin" className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white">Добавить мерчанта</Link>
      </div>

      <EducationBlock
        items={[
          "Эта страница помогает объяснить продукт человеку, который впервые видит платежный операционный контур.",
          "Расчеты являются демонстрационной моделью, а не обещанием доходности.",
          "Главные рычаги экономики: оборот, комиссии, конверсия платежей, снижение спорных потерь и расширенные модули.",
          "Для реального запуска нужно уточнить юнит-экономику, стоимость провайдеров, налоги, риск-профиль и операционные расходы."
        ]}
      />
    </div>
  );
}
