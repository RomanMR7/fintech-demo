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
    description: "Опишите задачу, роли пользователей, какие операции нужно показать и какой результат хотите получить."
  },
  {
    title: "Нужна консультация",
    description: "Можно разобрать идею, MVP, архитектуру, демо-логику, упаковку продукта или презентацию для инвестора."
  },
  {
    title: "Нужно показать проект",
    description: "Скачайте презентацию и используйте ее как короткое объяснение возможностей платежной платформы."
  }
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
              Эта страница находится внутри текущего приложения. Основная ссылка на проект не меняется: после деплоя появится раздел с контактами, встроенным PDF-просмотром и файлом презентации для скачивания.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a href={projectContact.presentationPdfUrl} download className="btn btn-primary focus-ring">
                Скачать PDF
              </a>
              <a href={projectContact.presentationPdfUrl} target="_blank" rel="noreferrer" className="btn btn-secondary focus-ring">
                Открыть PDF
              </a>
              <a href={projectContact.presentationPptxUrl} download className="btn btn-secondary focus-ring">
                Скачать PPTX
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
            Этот проект можно использовать как основу для собственного fintech-продукта: от интерактивного демо до полноценного рабочего MVP с ролями, статусами, балансами, выплатами и API-логикой.
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
            <a href={projectContact.telegramUrl} target="_blank" rel="noreferrer" className="btn mt-5 border-white/10 bg-white text-ink hover:bg-emerald-50">
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
