import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { projectContact } from "@/lib/project-contact";

const offerItems = [
  "Разработка fintech / SaaS MVP под ваш бизнес-процесс.",
  "Кабинет мерчанта, админ-панель, роли, ордера, выплаты и балансы.",
  "Демо-прототип для инвестора, партнера или внутренней команды.",
  "Доработка платежной логики, API, webhooks, сценариев и презентационных материалов."
];

const contactScenarios = [
  {
    title: "Нужна разработка",
    description: "Опишите задачу, роли пользователей, операции и результат, который нужно показать в продукте."
  },
  {
    title: "Нужна консультация",
    description: "Можно разобрать идею, MVP, архитектуру, демо-логику, экономику продукта или презентацию для инвестора."
  },
  {
    title: "Нужно показать проект",
    description: "Используйте встроенную PDF-презентацию как короткое объяснение возможностей платежной платформы."
  }
];

const investorMetricGroups = [
  {
    title: "Трафик и привлечение",
    caption: "Показывает, откуда приходит оборот и насколько он управляем.",
    items: [
      { label: "Traffic volume", value: "объем заявок / GMV / processing volume" },
      { label: "Conversion rate", value: "доля заявок, дошедших до целевого действия" },
      { label: "CAC", value: "стоимость привлечения активного клиента или FTD" },
      { label: "Revenue per FTD", value: "выручка платформы на первое целевое действие" }
    ]
  },
  {
    title: "Доходность",
    caption: "Отвечает на вопрос, где платформа зарабатывает и сколько остается после затрат.",
    items: [
      { label: "ROI", value: "окупаемость вложений после комиссий, затрат и рисков" },
      { label: "ROAS", value: "выручка с трафика относительно рекламных расходов" },
      { label: "LTV", value: "ожидаемая маржа за срок жизни клиента / мерчанта" },
      { label: "Payout margins", value: "маржа выплат после provider cost и risk loss" }
    ]
  },
  {
    title: "Масштабирование",
    caption: "Показывает, можно ли расти без ручного хаоса и зависимости от одного источника.",
    items: [
      { label: "Retention", value: "удержание активных мерчантов, операторов и источников" },
      { label: "GEO performance", value: "эффективность по странам, валютам, методам и провайдерам" },
      { label: "Scalability", value: "рост оборота без пропорционального роста ручной команды" },
      { label: "Automation %", value: "доля операций, обработанных без ручного вмешательства" }
    ]
  }
];

const riskCoverage = [
  {
    risk: "Зависимость от одного источника трафика",
    answer: "Платформа должна показывать source diversification: долю каждого источника, качество трафика и риск концентрации."
  },
  {
    risk: "Блокировки и ограничения аккаунтов",
    answer: "Нужны лимиты, мониторинг доступности, контроль провайдеров, SLA, журнал действий и план замены проблемных инструментов."
  },
  {
    risk: "Юридические риски",
    answer: "Модель должна строиться через договорную базу, KYC/AML, лимиты, прозрачную отчетность и white infrastructure."
  },
  {
    risk: "Ручное управление",
    answer: "Операционные очереди, статусы, роли, audit log, сценарии и automation % показывают, что процесс можно контролировать системно."
  },
  {
    risk: "Непрозрачные цифры",
    answer: "CAC, ROI, ROAS, LTV, retention, margin и GMV должны быть видны в одной модели, а не храниться в разрозненных таблицах."
  },
  {
    risk: "Невозможность масштабирования",
    answer: "Scalability доказывается через рост оборота, диверсификацию источников, автоматизацию и стабильность payout margins."
  },
  {
    risk: "Cashflow instability",
    answer: "Разделение available, hold, reserved, frozen и fee balance помогает заранее видеть кассовые разрывы и спорные суммы."
  },
  {
    risk: "«Арбитражник без системы»",
    answer: "Продуктовая упаковка, роли, логи, метрики, white infrastructure и управляемые процессы превращают ручную схему в операционную платформу."
  }
];

const operatingSignals = [
  "Source diversification: ни один источник не должен быть единственной точкой отказа.",
  "Anti-ban stability: устойчивость к ограничениям через правила, лимиты, мониторинг и compliance-процедуры, а не обход контроля.",
  "GEO performance: сравнение стран, валют, методов оплаты, approval rate, margin и dispute rate.",
  "Automation %: доля автоматизированных статусов, webhook-событий, проверок и уведомлений.",
  "Retention: повторное использование платформы мерчантами, операторами и партнерами.",
  "Payout margins: доходность выплат после комиссий провайдера, операционных расходов и спорных потерь."
];

export default function ContactPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Контакты"
        title="Разработка и консультация"
        description="Если нужно адаптировать эту платформу под ваш продукт, собрать MVP, подготовить демо для инвестора или спроектировать fintech/SaaS-кабинет, можно связаться напрямую в Telegram."
      >
        <a href={projectContact.telegramUrl} target="_blank" rel="noreferrer" className="btn btn-primary focus-ring whitespace-nowrap">
          Написать в Telegram
        </a>
      </PageHeader>

      <section className="section-card">
        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
          <div>
            <p className="eyebrow">Презентация внутри проекта</p>
            <h2 className="section-title mt-2 text-ink">Investor deck можно смотреть прямо здесь</h2>
            <p className="copy mt-3">
              Страница встроена в текущую версию приложения. Основная ссылка на проект не меняется: после деплоя раздел с контактами, PDF-просмотром и investor-checklist будет доступен внутри той же платформы.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a href={projectContact.presentationPdfUrl} download className="btn btn-primary focus-ring">
                Скачать PDF
              </a>
              <a href={projectContact.presentationPdfUrl} target="_blank" rel="noreferrer" className="btn btn-secondary focus-ring">
                Открыть PDF
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

        <div className="mt-5 overflow-hidden rounded-[var(--radius-xl)] border border-ink/10 bg-white/55">
          <div className="flex flex-col gap-2 border-b border-ink/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">PDF-просмотр презентации</p>
              <p className="text-xs text-graphite/55">Файл открывается внутри проекта без перехода на другой сайт.</p>
            </div>
            <a href={projectContact.presentationPdfUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-jade hover:text-ink">
              Открыть в новой вкладке
            </a>
          </div>
          <iframe
            src={projectContact.presentationPdfUrl}
            title="PDF-презентация Fintech OS"
            className="h-[520px] w-full bg-white"
          />
        </div>

        <div className="mt-5 rounded-[var(--radius-xl)] border border-ink/10 bg-white/50 p-4">
          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
            <div>
              <p className="eyebrow">Чек-лист инвестора</p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">Что важно показать кроме самой презентации</h3>
              <p className="copy mt-3">
                Инвестор смотрит не только на интерфейс. Ему важно понять, откуда берется оборот, сколько стоит рост, насколько стабильны выплаты, как контролируются риски и можно ли масштабировать систему без ручного хаоса.
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {investorMetricGroups.map((group) => (
                <article key={group.title} className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/55 p-4">
                  <h4 className="text-sm font-semibold tracking-[-0.01em] text-ink">{group.title}</h4>
                  <p className="copy-sm mt-1">{group.caption}</p>
                  <div className="mt-3 grid gap-2">
                    {group.items.map((item) => (
                      <div key={item.label} className="rounded-xl border border-ink/10 bg-white/45 px-3 py-2">
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-jade">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-graphite/72">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <details className="mt-5 rounded-[var(--radius-xl)] border border-ink/10 bg-white/50 p-4" open>
          <summary className="cursor-pointer list-none">
            <span className="eyebrow">Риск-мемо</span>
            <span className="mt-2 block text-xl font-semibold tracking-[-0.03em] text-ink">Какие страхи нужно закрыть заранее</span>
            <span className="copy mt-2 block">
              Блок помогает быстро объяснить, что платформа не является набором ручных действий, а строится как управляемая платежная инфраструктура с метриками, контролем, ролями и прозрачной операционной моделью.
            </span>
          </summary>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {riskCoverage.map((item) => (
              <article key={item.risk} className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/55 p-4">
                <h4 className="text-sm font-semibold text-ink">{item.risk}</h4>
                <p className="copy-sm mt-2">{item.answer}</p>
              </article>
            ))}
          </div>
        </details>

        <div className="mt-5 rounded-[var(--radius-xl)] border border-ink/10 bg-white/50 p-4">
          <p className="eyebrow">Операционные показатели</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {operatingSignals.map((signal) => (
              <div key={signal} className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/55 p-4">
                <div className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-jade" />
                  <p className="text-sm font-semibold leading-6 text-ink">{signal}</p>
                </div>
              </div>
            ))}
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

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="section-card mesh-bg overflow-hidden">
          <p className="eyebrow">Что можно заказать</p>
          <h2 className="section-title mt-2 text-ink">Платежная платформа под ваш процесс</h2>
          <p className="copy mt-3 max-w-3xl">
            Этот проект можно использовать как основу для собственного fintech-продукта: от интерактивного демо до рабочего MVP с ролями, статусами, балансами, выплатами, API-логикой и презентационной упаковкой.
          </p>
          <div className="mt-5 grid gap-3">
            {offerItems.map((item) => (
              <div key={item} className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/55 p-4">
                <div className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-jade" />
                  <p className="text-sm font-semibold leading-6 text-ink">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="grid gap-5">
          <article className="dark-panel rounded-[var(--radius-xl)] p-5">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-emerald-100/70">Прямая связь</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Telegram: {projectContact.telegramLabel}</h2>
            <p className="mt-3 text-sm leading-6 text-white/72">
              Напишите, если хотите обсудить разработку, консультацию, демонстрацию проекта, упаковку под инвестора или доработку под вашу бизнес-модель.
            </p>
            <a href={projectContact.telegramUrl} target="_blank" rel="noreferrer" className="btn btn-on-light focus-ring mt-5">
              Открыть Telegram
            </a>
          </article>

          <article className="section-card">
            <p className="eyebrow">Презентация</p>
            <h2 className="section-title mt-2 text-ink">PDF-презентация включена в проект</h2>
            <p className="copy mt-3">
              Последняя презентация лежит в публичной папке проекта и доступна как PDF для просмотра и скачивания локально или после деплоя на Vercel.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a href={projectContact.presentationPdfUrl} download className="btn btn-primary focus-ring">
                Скачать PDF
              </a>
              <Link href="/commercial" className="btn btn-secondary focus-ring">
                Открыть экономику
              </Link>
            </div>
            <p className="mt-3 break-all text-xs font-semibold text-graphite/55">{projectContact.presentationFileName}</p>
          </article>
        </aside>
      </section>

      <section className="section-card">
        <p className="eyebrow">Как лучше обращаться</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {contactScenarios.map((item) => (
            <div key={item.title} className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/55 p-4">
              <h3 className="text-base font-semibold tracking-[-0.02em] text-ink">{item.title}</h3>
              <p className="copy-sm mt-2">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
