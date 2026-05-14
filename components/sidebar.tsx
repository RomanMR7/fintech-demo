"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRole } from "@/components/role-provider";

export const navigationSections = [
  {
    title: "Обзор",
    items: [
      { href: "/dashboard", label: "Главный дашборд" },
      { href: "/commercial", label: "Коммерческая модель" },
      { href: "/merchant", label: "Кабинет мерчанта" },
      { href: "/admin", label: "Админ-панель" },
      { href: "/operations", label: "Операционный кабинет" }
    ]
  },
  {
    title: "Операции",
    items: [
      { href: "/orders", label: "Заказы / ордера" },
      { href: "/payouts", label: "Выплаты" },
      { href: "/requisites", label: "Реквизиты" },
      { href: "/appeals", label: "Апелляции" }
    ]
  },
  {
    title: "Финансы и контроль",
    items: [
      { href: "/balances", label: "Балансы" },
      { href: "/commissions", label: "Комиссии" },
      { href: "/exchange-rates", label: "Курсы валют" },
      { href: "/notifications", label: "Уведомления" },
      { href: "/events", label: "Журнал событий" },
      { href: "/integrations", label: "Интеграции" }
    ]
  },
  {
    title: "Демо и обучение",
    items: [
      { href: "/scenarios", label: "Сценарии" },
      { href: "/api-demo", label: "API-демо" },
      { href: "/process-map", label: "Карта процессов" },
      { href: "/education/how-it-works", label: "Как работает система" },
      { href: "/education/roles", label: "Роли и ответственность" },
      { href: "/education/order-lifecycle", label: "Жизненный цикл ордера" },
      { href: "/education/payout-lifecycle", label: "Жизненный цикл выплаты" },
      { href: "/education/appeal-lifecycle", label: "Жизненный цикл апелляции" },
      { href: "/education/balances", label: "Как работают балансы" },
      { href: "/education/notifications-events", label: "Уведомления и события" },
      { href: "/education/api-mode", label: "API в демо-режиме" }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentRoleLabel } = useRole();

  return (
    <aside className="card sticky top-4 hidden h-[calc(100vh-2rem)] overflow-y-auto rounded-[2rem] p-5 lg:block">
      <div className="rounded-[1.5rem] bg-ink p-5 text-white shadow-soft">
        <p className="text-xs uppercase tracking-[0.28em] text-white/55">Локальный прототип</p>
        <h1 className="mt-3 font-display text-2xl font-semibold leading-tight">Платежная платформа</h1>
        <p className="mt-3 text-sm text-white/70">Роль: {currentRoleLabel}</p>
      </div>

      <nav className="mt-5 space-y-5">
        {navigationSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-graphite/50">{section.title}</p>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={`block rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                      active ? "bg-jade text-white shadow-soft" : "text-graphite/78 hover:bg-white/70 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const { currentRoleLabel } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const quickItems = [
    navigationSections[0].items[0],
    navigationSections[0].items[1],
    navigationSections[3].items[0],
    navigationSections[1].items[0],
    navigationSections[2].items[0]
  ];

  return (
    <div className="mb-3 grid gap-3 lg:hidden">
      <div className="card rounded-[1.5rem] px-4 py-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0 overflow-hidden">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-jade">Мобильное меню</p>
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
          <div
            id="mobile-navigation-drawer"
            className="card mx-auto flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] bg-porcelain"
          >
            <div className="flex items-start justify-between gap-3 border-b border-ink/10 p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-jade">Все разделы демо</p>
                <p className="mt-1 text-sm font-semibold text-ink">Роль: {currentRoleLabel}</p>
                <p className="mt-1 text-xs leading-5 text-graphite/60">Здесь весь боковой список, который на компьютере находится слева.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="focus-ring rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white"
                aria-label="Закрыть мобильное меню"
              >
                Закрыть
              </button>
            </div>
            <nav className="overflow-y-auto px-3 pb-4">
              {navigationSections.map((section) => (
                <div key={section.title} className="pt-4">
                  <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-graphite/45">{section.title}</p>
                  <div className="mt-2 grid gap-1.5">
                    {section.items.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          href={item.href}
                          key={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                            active ? "bg-jade text-white shadow-soft" : "bg-white/65 text-graphite hover:bg-white hover:text-ink"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      ) : null}

      <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
        {quickItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
