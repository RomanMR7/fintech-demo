import { PageHeader } from "@/components/page-header";
import { projectContact } from "@/lib/project-contact";

const deckHighlights = [
  { label: "Формат", value: "10 слайдов + PDF" },
  { label: "GMV потенциал", value: "60-200 млн ₽/мес" },
  { label: "Комиссия", value: "0,5-2%" },
  { label: "Модель", value: "B2B payment infrastructure" }
];

const revenueScenarios = [
  {
    title: "Стартовая сеть",
    formula: "3 оператора x 10 инструментов x 2 000 000 ₽",
    gmv: "60 000 000 ₽",
    rows: [
      ["0,5%", "300 000 ₽"],
      ["1%", "600 000 ₽"],
      ["1,5%", "900 000 ₽"],
      ["2%", "1 200 000 ₽"]
    ]
  },
  {
    title: "Расширенная сеть",
    formula: "5 операторов x 20 инструментов x 2 000 000 ₽",
    gmv: "200 000 000 ₽",
    rows: [
      ["0,5%", "1 000 000 ₽"],
      ["1%", "2 000 000 ₽"],
      ["1,5%", "3 000 000 ₽"],
      ["2%", "4 000 000 ₽"]
    ]
  }
];

const investorMetrics = [
  { label: "Traffic volume", value: "2 400-8 000 операций/мес", note: "при среднем чеке около 25 000 ₽" },
  { label: "Conversion rate", value: "8-12%", note: "доля заявок, дошедших до целевого действия" },
  { label: "CAC", value: "500-1 200 ₽", note: "стоимость привлечения FTD / активного клиента" },
  { label: "Revenue per FTD", value: "1 000-1 800 ₽", note: "комиссионная выручка на первое целевое действие" },
  { label: "ROAS", value: "1,8-2,8x", note: "выручка относительно расходов на трафик" },
  { label: "ROI", value: "80-180%", note: "окупаемость после расходов, комиссий и риска" },
  { label: "Retention", value: "60-75%", note: "ориентир удержания активных подключений на 2-й месяц" },
  { label: "LTV", value: "4 500-9 000 ₽", note: "ожидаемая маржа на активного клиента / FTD" },
  { label: "Payout margins", value: "0,35-0,90%", note: "маржа выплат после provider cost и risk loss" },
  { label: "Automation %", value: "65-85%", note: "доля операций без ручного вмешательства" },
  { label: "Scalability", value: "20-40 млн ₽/оператор", note: "месячная операционная мощность на одного оператора" },
  { label: "Source diversification", value: "4+ источника", note: "целевой лимит концентрации: один источник не выше 35%" }
];

const geoRows = [
  ["GEO A", "92%", "0,70%", "1,6%", "Приоритетный оборот"],
  ["GEO B", "86%", "0,55%", "2,4%", "Работает при лимитах"],
  ["GEO C", "78%", "0,35%", "3,8%", "Только после риск-фильтров"]
];

const riskControls = [
  {
    title: "Зависимость от одного источника",
    metric: "4+ источника, max share <35%",
    control: "Диверсификация трафика, контроль качества источников и сравнение approval / margin / dispute по каждому каналу."
  },
  {
    title: "Ограничения платежных инструментов",
    metric: "uptime 97%+, SLA замены <24 ч",
    control: "Лимиты, мониторинг доступности, пул резервных инструментов и журнал причин отключения."
  },
  {
    title: "Юридическая устойчивость",
    metric: "KYC/AML coverage 100%",
    control: "Работа через договорную базу, процедуры KYC/AML, лимиты, прозрачную отчетность и white infrastructure."
  },
  {
    title: "Ручное управление",
    metric: "automation 65-85%",
    control: "Статусы, очереди задач, роли, webhook-события, уведомления и audit log уменьшают зависимость от ручного контроля."
  },
  {
    title: "Непрозрачные цифры",
    metric: "GMV, CAC, ROI, ROAS, LTV в одной модели",
    control: "Показатели сведены в единую финансовую картину: оборот, выручка, маржа, удержание, источники и риски."
  },
  {
    title: "Cashflow instability",
    metric: "available / hold / reserved / frozen",
    control: "Разделение балансов показывает кассовые разрывы, спорные суммы, резервы и доступные средства."
  }
];

const contactScenarios = [
  {
    title: "Разработка продукта",
    description: "MVP, платежная логика, роли, кабинеты, API, статусы, балансы, выплаты и админ-процессы."
  },
  {
    title: "Упаковка для инвестора",
    description: "Презентация, экономика, unit metrics, визуализация рисков, roadmap и демонстрационный сценарий."
  },
  {
    title: "Консультация",
    description: "Разбор идеи, архитектуры, продукта, операционной модели, масштабирования и финансовой логики."
  }
];

export default function ContactPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Инвестиционная презентация"
        title="Fintech OS: платежная инфраструктура и экономика роста"
        description="Встроенная презентация, расчет оборотной мощности, комиссионной выручки и ключевых метрик для обсуждения с инвестором или B2B-партнером."
      >
        <a href={projectContact.telegramUrl} target="_blank" rel="noreferrer" className="btn btn-primary focus-ring whitespace-nowrap">
          Связаться в Telegram
        </a>
      </PageHeader>

      <section className="section-card">
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
          <div>
            <p className="eyebrow">Презентация</p>
            <h2 className="section-title mt-2 text-ink">Investor deck внутри продукта</h2>
            <p className="copy mt-3">
              Слайды доступны прямо на странице как изображения, поэтому презентация корректно отображается в браузере и на мобильных устройствах. PDF можно открыть отдельно или скачать.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {deckHighlights.map((item) => (
                <div key={item.label} className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/55 p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-jade">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-ink">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a href={projectContact.presentationPdfUrl} target="_blank" rel="noreferrer" className="btn btn-primary focus-ring">
                Открыть PDF
              </a>
              <a href={projectContact.presentationPdfUrl} download className="btn btn-secondary focus-ring">
                Скачать PDF
              </a>
            </div>
            <p className="mt-3 break-all text-xs font-semibold text-graphite/55">{projectContact.presentationFileName}</p>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-ink/10 bg-white/50 p-3 shadow-insetSoft">
            <img
              src={projectContact.presentationSlides[0]?.imageUrl}
              alt="Первый слайд презентации Fintech OS"
              className="aspect-video w-full rounded-[var(--radius-lg)] border border-ink/10 object-cover"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {projectContact.presentationSlides.map((slide) => (
            <a
              key={slide.number}
              href={slide.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[var(--radius-lg)] border border-ink/10 bg-white/55 p-2 transition hover:-translate-y-0.5 hover:bg-white"
            >
              <img
                src={slide.imageUrl}
                alt={`${slide.title} презентации Fintech OS`}
                loading="lazy"
                className="aspect-video w-full rounded-xl border border-ink/10 object-cover"
              />
              <div className="mt-2 flex items-center justify-between gap-2 px-1">
                <span className="text-xs font-semibold text-ink">{slide.title}</span>
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-jade">preview</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="section-card">
        <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr] xl:items-start">
          <div>
            <p className="eyebrow">Unit economics</p>
            <h2 className="section-title mt-2 text-ink">Расчет оборотной мощности и выручки</h2>
            <p className="copy mt-3">
              Платформа монетизируется через комиссию с обработанного оборота. Ниже показан базовый диапазон: от стартовой операционной сети до расширенной конфигурации.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {revenueScenarios.map((scenario) => (
              <article key={scenario.title} className="rounded-[var(--radius-xl)] border border-ink/10 bg-white/55 p-4">
                <p className="eyebrow">{scenario.title}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{scenario.gmv}</h3>
                <p className="copy-sm mt-1">{scenario.formula}</p>
                <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-ink/10">
                  {scenario.rows.map(([fee, revenue]) => (
                    <div key={fee} className="grid grid-cols-[0.7fr_1fr] border-b border-ink/10 bg-white/45 px-3 py-2 last:border-b-0">
                      <span className="text-xs font-bold text-jade">{fee}</span>
                      <span className="text-right text-sm font-semibold text-ink">{revenue}/мес</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Growth metrics</p>
            <h2 className="section-title mt-2 text-ink">Ключевые показатели для инвестора</h2>
          </div>
          <p className="copy-sm max-w-xl">
            Значения ниже являются модельными ориентирами для обсуждения экономики. Финальная модель зависит от GEO, источников, комиссий, лимитов, риска и договорной структуры.
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {investorMetrics.map((metric) => (
            <article key={metric.label} className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/55 p-4">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-jade">{metric.label}</p>
              <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">{metric.value}</p>
              <p className="copy-sm mt-1">{metric.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="section-card mesh-bg overflow-hidden">
          <p className="eyebrow">GEO performance</p>
          <h2 className="section-title mt-2 text-ink">Сравнение направлений по качеству оборота</h2>
          <p className="copy mt-3">
            GEO оцениваются не только по объему, но и по approval rate, марже и спорным операциям. Такой подход помогает направлять оборот в более устойчивые каналы.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-[0.68rem] font-bold uppercase tracking-[0.12em] text-graphite/60">
                <tr>
                  <th className="pb-2">GEO</th>
                  <th className="pb-2">Approval</th>
                  <th className="pb-2">Margin</th>
                  <th className="pb-2">Dispute</th>
                  <th className="pb-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                {geoRows.map(([geo, approval, margin, dispute, status]) => (
                  <tr key={geo} className="border-t border-ink/10">
                    <td className="py-3 font-semibold text-ink">{geo}</td>
                    <td className="py-3 font-semibold text-ink">{approval}</td>
                    <td className="py-3 font-semibold text-ink">{margin}</td>
                    <td className="py-3 font-semibold text-ink">{dispute}</td>
                    <td className="py-3 text-graphite/72">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="section-card">
          <p className="eyebrow">Risk controls</p>
          <h2 className="section-title mt-2 text-ink">Контроль рисков и масштабирования</h2>
          <div className="mt-5 grid gap-3">
            {riskControls.map((item) => (
              <div key={item.title} className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/55 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                  <span className="rounded-full border border-jade/20 bg-jade/10 px-3 py-1 text-xs font-bold text-jade">{item.metric}</span>
                </div>
                <p className="copy-sm mt-2">{item.control}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <article className="section-card">
          <p className="eyebrow">Контакт</p>
          <h2 className="section-title mt-2 text-ink">Связаться по проекту</h2>
          <p className="copy mt-3">
            Для обсуждения разработки, консультации, презентационной упаковки или адаптации платформы под конкретную бизнес-модель можно написать напрямую в Telegram.
          </p>
          <a href={projectContact.telegramUrl} target="_blank" rel="noreferrer" className="btn btn-primary focus-ring mt-5">
            Telegram: {projectContact.telegramLabel}
          </a>
        </article>

        <article className="dark-panel rounded-[var(--radius-xl)] p-5">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-emerald-100/70">Формат работы</p>
          <div className="mt-4 grid gap-3">
            {contactScenarios.map((item) => (
              <div key={item.title} className="rounded-[var(--radius-lg)] border border-white/10 bg-white/10 p-4">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
