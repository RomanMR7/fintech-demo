"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/components/role-provider";

const sections = [
  {
    title: "Обзор",
    items: [
      { href: "/dashboard", label: "Главный дашборд" },
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
        {sections.map((section) => (
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
