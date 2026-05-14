"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRole } from "@/components/role-provider";
import { getVisibleNavigationSections } from "@/components/sidebar";

type SearchItem = {
  href: string;
  label: string;
  description: string;
  section: string;
};

export function GlobalSearch() {
  const { role } = useRole();
  const [query, setQuery] = useState("");

  const items = useMemo<SearchItem[]>(
    () =>
      getVisibleNavigationSections(role).flatMap((section) =>
        section.items.map((item) => ({
          href: item.href,
          label: item.label,
          description: item.description,
          section: section.title
        }))
      ),
    [role]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery
    ? items
        .filter((item) => `${item.label} ${item.description} ${item.section}`.toLowerCase().includes(normalizedQuery))
        .slice(0, 6)
    : items.filter((item) => ["/orders", "/payouts", "/balances", "/api-demo", "/events"].includes(item.href)).slice(0, 5);

  return (
    <div className="relative min-w-0 flex-1">
      <label className="sr-only" htmlFor="global-command-search">
        Глобальный поиск
      </label>
      <div className="control grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl px-3 py-2.5">
        <span className="text-sm text-graphite/45" aria-hidden="true">
          /
        </span>
        <input
          id="global-command-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск: ордера, выплаты, API, риски..."
          className="min-w-0 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-graphite/45"
          autoComplete="off"
        />
        <span className="hidden rounded-lg border border-ink/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-graphite/45 sm:inline-flex">
          Search
        </span>
      </div>

      {query.trim() ? (
        <div className="card absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl p-2">
          {results.length ? (
            results.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setQuery("")}
                className="grid gap-1 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/65"
              >
                <span className="font-semibold text-ink">{item.label}</span>
                <span className="truncate text-xs text-graphite/55">{item.description}</span>
              </Link>
            ))
          ) : (
            <div className="rounded-xl px-3 py-3 text-sm text-graphite/60">Ничего не найдено. Попробуйте “ордера”, “баланс” или “API”.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
