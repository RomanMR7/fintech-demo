"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useRole } from "@/components/role-provider";
import type { DemoRole } from "@/lib/roles";

type NavItem = {
  href: string;
  label: string;
  description: string;
  roles?: DemoRole[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const allRoles: DemoRole[] = ["PLATFORM_ADMIN", "MERCHANT", "OPERATOR", "FINANCE_MANAGER", "SUPPORT"];
const opsRoles: DemoRole[] = ["PLATFORM_ADMIN", "OPERATOR", "SUPPORT"];
const financeRoles: DemoRole[] = ["PLATFORM_ADMIN", "FINANCE_MANAGER"];
const merchantRoles: DemoRole[] = ["PLATFORM_ADMIN", "MERCHANT"];

export const navigationSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Главный dashboard", description: "Деньги, риски, API и последние события.", roles: allRoles },
      { href: "/commercial", label: "Экономика продукта", description: "Юнит-экономика, комиссии и потенциал выручки.", roles: financeRoles },
      { href: "/merchant", label: "Кабинет мерчанта", description: "Баланс, выплаты, API key и интеграция.", roles: merchantRoles },
      { href: "/admin", label: "Админ-панель", description: "Мерчанты, лимиты, комиссии и контроль платформы.", roles: ["PLATFORM_ADMIN"] },
      { href: "/operations", label: "Операционный кабинет", description: "Очередь задач, проверки, холды и споры.", roles: opsRoles }
    ]
  },
  {
    title: "Money movement",
    items: [
      { href: "/orders", label: "Ордера", description: "Платежные ордера, статусы, провайдеры и risk score.", roles: allRoles },
      { href: "/payouts", label: "Выплаты", description: "Заявки на вывод, подтверждения и источники баланса.", roles: ["PLATFORM_ADMIN", "MERCHANT", "FINANCE_MANAGER", "OPERATOR"] },
      { href: "/requisites", label: "Реквизиты", description: "Платежные детали, лимиты и привязанные операции.", roles: ["PLATFORM_ADMIN", "MERCHANT", "OPERATOR"] },
      { href: "/balances", label: "Балансы", description: "Доступно, в холде, комиссии и история движений.", roles: ["PLATFORM_ADMIN", "MERCHANT", "FINANCE_MANAGER"] }
    ]
  },
  {
    title: "Risk & compliance",
    items: [
      { href: "/appeals", label: "Апелляции / disputes", description: "Споры, комментарии, решения и SLA.", roles: opsRoles },
      { href: "/commissions", label: "Комиссии", description: "Модель дохода платформы и удержания.", roles: financeRoles },
      { href: "/exchange-rates", label: "Курсы валют", description: "RUB/USD, источник и дата актуальности.", roles: financeRoles },
      { href: "/events", label: "Audit log", description: "Журнал действий, статусов и финансовых событий.", roles: allRoles },
      { href: "/notifications", label: "Уведомления", description: "События для текущей роли и мерчанта.", roles: allRoles }
    ]
  },
  {
    title: "API & webhooks",
    items: [
      { href: "/api-demo", label: "API demo", description: "Примеры создания ордера, webhook и ответа API.", roles: allRoles },
      { href: "/integrations", label: "Интеграции", description: "Провайдеры, доступность, комиссии и тестовый режим.", roles: ["PLATFORM_ADMIN", "OPERATOR", "MERCHANT"] },
      { href: "/scenarios", label: "Live-сценарии", description: "Кликабельная симуляция операций и последствий.", roles: allRoles },
      { href: "/process-map", label: "Карта процессов", description: "Жизненные циклы ордера, выплаты, апелляции и баланса.", roles: allRoles }
    ]
  },
  {
    title: "Reports & learning",
    items: [
      { href: "/education/how-it-works", label: "Как работает система", description: "Простое объяснение логики продукта.", roles: allRoles },
      { href: "/education/roles", label: "Роли и ответственность", description: "Кто что видит и за что отвечает.", roles: allRoles },
      { href: "/education/order-lifecycle", label: "Жизненный цикл ордера", description: "От создания до завершения и баланса.", roles: allRoles },
      { href: "/education/payout-lifecycle", label: "Жизненный цикл выплаты", description: "Как проходит заявка на вывод денег.", roles: allRoles },
      { href: "/education/appeal-lifecycle", label: "Жизненный цикл апелляции", description: "Как спор влияет на статус и холд.", roles: allRoles },
      { href: "/education/balances", label: "Как работают балансы", description: "Доступно, заморожено, комиссии и движение средств.", roles: allRoles },
      { href: "/education/notifications-events", label: "Уведомления и audit log", description: "Как система фиксирует события.", roles: allRoles },
      { href: "/education/api-mode", label: "API в demo mode", description: "Как читать примеры интеграции.", roles: allRoles }
    ]
  }
];

export function getVisibleNavigationSections(role: DemoRole) {
  return navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || item.roles.includes(role))
    }))
    .filter((section) => section.items.length > 0);
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MiniNavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
        active ? "bg-jade text-white shadow-soft" : "text-graphite/78 hover:bg-white/70 hover:text-ink"
      }`}
    >
      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-graphite/25 group-hover:bg-jade"}`} />
      <span className="min-w-0">
        <span className="block truncate font-semibold">{item.label}</span>
        <span className={`mt-0.5 hidden truncate text-xs sm:block ${active ? "text-white/66" : "text-graphite/48"}`}>{item.description}</span>
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { role, currentRoleLabel } = useRole();
  const sections = useMemo(() => getVisibleNavigationSections(role), [role]);

  return (
    <aside className="card sticky top-4 hidden h-[calc(100vh-2rem)] overflow-y-auto rounded-[1.8rem] p-4 lg:block">
      <div className="rounded-[1.35rem] bg-ink p-5 text-white shadow-soft">
        <div className="flex items-center gap-2">
          <span className="status-dot bg-emerald-300" />
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Sandbox live</p>
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold leading-tight">Payment Platform</h1>
        <p className="mt-3 text-sm leading-6 text-white/66">Оркестрация платежей, выплат, холдов, апелляций и API-интеграций в одном demo-контуре.</p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/8 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Текущая роль</p>
          <p className="mt-1 text-sm font-semibold text-white">{currentRoleLabel}</p>
        </div>
      </div>

      <nav className="mt-5 space-y-4" aria-label="Основная навигация">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-graphite/45">{section.title}</p>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => (
                <MiniNavLink item={item} active={isActivePath(pathname, item.href)} key={item.href} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const { role, currentRoleLabel } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const sections = useMemo(() => getVisibleNavigationSections(role), [role]);
  const quickItems = useMemo(() => sections.flatMap((section) => section.items).slice(0, 6), [sections]);

  return (
    <div className="mb-3 grid gap-3 lg:hidden">
      <div className="card rounded-[1.35rem] px-4 py-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0 overflow-hidden">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-jade">Мобильная навигация</p>
            <p className="mt-1 truncate text-sm font-semibold text-ink">Платежная платформа · {currentRoleLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="focus-ring relative z-10 shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation-drawer"
          >
            Все разделы
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-ink/45 px-3 py-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Мобильное меню разделов">
          <div id="mobile-navigation-drawer" className="card mx-auto flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-[1.5rem] bg-porcelain">
            <div className="flex items-start justify-between gap-3 border-b border-ink/10 p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-jade">Все разделы demo</p>
                <p className="mt-1 text-sm font-semibold text-ink">Роль: {currentRoleLabel}</p>
                <p className="mt-1 text-xs leading-5 text-graphite/60">Это тот же sidebar, но адаптированный под Safari и мобильный экран.</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="focus-ring rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white" aria-label="Закрыть мобильное меню">
                Закрыть
              </button>
            </div>
            <nav className="overflow-y-auto px-3 pb-4" aria-label="Мобильная навигация">
              {sections.map((section) => (
                <div key={section.title} className="pt-4">
                  <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-graphite/45">{section.title}</p>
                  <div className="mt-2 grid gap-1.5">
                    {section.items.map((item) => (
                      <MiniNavLink item={item} active={isActivePath(pathname, item.href)} key={item.href} onClick={() => setIsOpen(false)} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      ) : null}

      <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
        {quickItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              href={item.href}
              key={item.href}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold shadow-insetSoft transition ${
                active ? "bg-ink text-white" : "border border-ink/10 bg-white/70 text-graphite hover:bg-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
