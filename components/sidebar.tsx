"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useRole } from "@/components/role-provider";
import { VisualModeSwitcher } from "@/components/visual-mode-switcher";
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

const allRoles: DemoRole[] = ["PLATFORM_ADMIN", "MERCHANT", "OPERATOR", "FINANCE_MANAGER", "SUPPORT", "VIEWER"];
const opsRoles: DemoRole[] = ["PLATFORM_ADMIN", "OPERATOR", "SUPPORT"];
const financeRoles: DemoRole[] = ["PLATFORM_ADMIN", "FINANCE_MANAGER"];
const merchantRoles: DemoRole[] = ["PLATFORM_ADMIN", "MERCHANT"];

export const navigationSections: NavSection[] = [
  {
    title: "Обзор",
    items: [
      { href: "/dashboard", label: "Главная панель", description: "Деньги, риски, API и последние события.", roles: allRoles },
      { href: "/commercial", label: "Экономика продукта", description: "Юнит-экономика, комиссии и потенциал выручки.", roles: financeRoles },
      { href: "/merchant", label: "Кабинет мерчанта", description: "Баланс, выплаты, API key и интеграция.", roles: merchantRoles },
      { href: "/admin", label: "Админ-панель", description: "Мерчанты, лимиты, комиссии и контроль платформы.", roles: ["PLATFORM_ADMIN"] },
      { href: "/operations", label: "Операционный кабинет", description: "Очередь задач, проверки, холды и споры.", roles: opsRoles }
    ]
  },
  {
    title: "Движение денег",
    items: [
      { href: "/orders", label: "Ордера", description: "Платежные ордера, статусы, провайдеры и risk score.", roles: allRoles },
      { href: "/payouts", label: "Выплаты", description: "Заявки на вывод, подтверждения и источники баланса.", roles: ["PLATFORM_ADMIN", "MERCHANT", "FINANCE_MANAGER", "OPERATOR"] },
      { href: "/requisites", label: "Реквизиты", description: "Платежные детали, лимиты и привязанные операции.", roles: ["PLATFORM_ADMIN", "MERCHANT", "OPERATOR"] },
      { href: "/balances", label: "Балансы", description: "Доступно, в холде, комиссии и история движений.", roles: ["PLATFORM_ADMIN", "MERCHANT", "FINANCE_MANAGER"] }
    ]
  },
  {
    title: "Риск и контроль",
    items: [
      { href: "/appeals", label: "Апелляции", description: "Споры, комментарии, решения и SLA.", roles: opsRoles },
      { href: "/commissions", label: "Комиссии", description: "Модель дохода платформы и удержания.", roles: financeRoles },
      { href: "/exchange-rates", label: "Курсы валют", description: "RUB/USD, источник и дата актуальности.", roles: financeRoles },
      { href: "/events", label: "Журнал аудита", description: "Журнал действий, статусов и финансовых событий.", roles: allRoles },
      { href: "/notifications", label: "Уведомления", description: "События для текущей роли и мерчанта.", roles: allRoles }
    ]
  },
  {
    title: "API и webhooks",
    items: [
      { href: "/api-demo", label: "API-демо", description: "Примеры создания ордера, webhook и ответа API.", roles: allRoles },
      { href: "/integrations", label: "Интеграции", description: "Провайдеры, доступность, комиссии и тестовый режим.", roles: ["PLATFORM_ADMIN", "OPERATOR", "MERCHANT"] },
      { href: "/scenarios", label: "Демо-сценарии", description: "Кликабельная симуляция операций и последствий.", roles: allRoles },
      { href: "/process-map", label: "Карта процессов", description: "Жизненные циклы ордера, выплаты, апелляции и баланса.", roles: allRoles }
    ]
  },
  {
    title: "Отчеты и обучение",
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

function getNavigationHref(item: NavItem, merchantId: string) {
  if (item.href === "/merchant") {
    return `/merchant?merchantId=${encodeURIComponent(merchantId)}`;
  }

  return item.href;
}

function MiniNavLink({ item, active, href, label, onClick }: { item: NavItem; active: boolean; href?: string; label?: string; onClick?: () => void }) {
  return (
    <Link
      href={href ?? item.href}
      onClick={onClick}
      title={item.description}
      className={`group grid min-h-10 grid-cols-[1rem_minmax(0,1fr)] items-center gap-2.5 rounded-[0.95rem] px-2.5 text-sm transition ${
        active ? "bg-ink text-white shadow-insetSoft" : "text-graphite/76 hover:bg-white/64 hover:text-ink"
      }`}
    >
      <span className={`mx-auto h-1.5 w-1.5 rounded-full ${active ? "bg-jade" : "bg-graphite/22 group-hover:bg-jade"}`} />
      <span className="truncate font-semibold">{label ?? item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { role, currentRoleLabel, merchantId, merchantName } = useRole();
  const sections = useMemo(() => getVisibleNavigationSections(role), [role]);
  const merchantMenuLabel = merchantName ? `Кабинет ${merchantName}` : "Кабинет мерчанта";

  return (
    <aside className="card sticky top-6 hidden h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] p-3 lg:flex">
      <div className="rounded-[1.2rem] bg-ink px-4 py-4 text-white shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/48">Платежная платформа</p>
            <h1 className="mt-1 text-lg font-semibold leading-tight tracking-[-0.03em]">Fintech OS Demo</h1>
          </div>
          <span className="status-dot bg-emerald-300" />
        </div>
        <div className="mt-3 rounded-[0.95rem] border border-white/10 bg-white/8 px-3 py-2">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white/42">Роль</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">{currentRoleLabel}</p>
        </div>
      </div>

      <nav className="no-scrollbar mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" aria-label="Основная навигация">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-2.5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-graphite/42">{section.title}</p>
            <div className="mt-1.5 space-y-1">
              {section.items.map((item) => (
                <MiniNavLink item={item} label={item.href === "/merchant" ? merchantMenuLabel : undefined} href={getNavigationHref(item, merchantId)} active={isActivePath(pathname, item.href)} key={item.href} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-3 border-t border-ink/10 pt-3">
        <p className="px-1 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-graphite/42">Визуальный режим</p>
        <div className="mt-2">
          <VisualModeSwitcher />
        </div>
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const { role, currentRoleLabel, merchantId, merchantName } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const sections = useMemo(() => getVisibleNavigationSections(role), [role]);
  const quickItems = useMemo(() => sections.flatMap((section) => section.items).slice(0, 6), [sections]);
  const merchantMenuLabel = merchantName ? `Кабинет ${merchantName}` : "Кабинет мерчанта";

  return (
    <div className="mb-3 grid gap-3 lg:hidden">
      <div className="card rounded-[var(--radius-lg)] px-4 py-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0 overflow-hidden">
            <p className="eyebrow">Мобильная навигация</p>
            <p className="mt-1 truncate text-sm font-semibold text-ink">Платежная платформа · {currentRoleLabel}</p>
          </div>
          <button type="button" onClick={() => setIsOpen(true)} className="btn btn-primary focus-ring min-h-10 px-4 text-sm" aria-expanded={isOpen} aria-controls="mobile-navigation-drawer">
            Все разделы
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-ink/45 px-3 py-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Мобильное меню разделов">
          <div id="mobile-navigation-drawer" className="card mx-auto flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-[var(--radius-xl)] bg-porcelain">
            <div className="flex items-start justify-between gap-3 border-b border-ink/10 p-4">
              <div>
                <p className="eyebrow">Все разделы demo</p>
                <p className="mt-1 text-sm font-semibold text-ink">Роль: {currentRoleLabel}</p>
                <p className="copy-sm mt-1">Компактная версия sidebar для Safari и мобильного экрана.</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="btn btn-primary focus-ring min-h-9 px-3 text-xs" aria-label="Закрыть мобильное меню">
                Закрыть
              </button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-label="Мобильная навигация">
              {sections.map((section) => (
                <div key={section.title} className="pt-4">
                  <p className="px-2 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-graphite/45">{section.title}</p>
                  <div className="mt-2 grid gap-1.5">
                    {section.items.map((item) => (
                      <MiniNavLink item={item} label={item.href === "/merchant" ? merchantMenuLabel : undefined} href={getNavigationHref(item, merchantId)} active={isActivePath(pathname, item.href)} key={item.href} onClick={() => setIsOpen(false)} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            <div className="border-t border-ink/10 p-4">
              <p className="px-1 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-graphite/45">Визуальный режим</p>
              <div className="mt-2">
                <VisualModeSwitcher />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
        {quickItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link href={getNavigationHref(item, merchantId)} key={item.href} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold shadow-insetSoft transition ${active ? "bg-ink text-white" : "border border-ink/10 bg-white/70 text-graphite hover:bg-white"}`}>
              {item.href === "/merchant" ? merchantMenuLabel : item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
