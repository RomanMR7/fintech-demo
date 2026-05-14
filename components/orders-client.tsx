"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { EmptyState } from "@/components/empty-state";
import { useRole } from "@/components/role-provider";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { disabledActionReason } from "@/lib/rbac";
import { type UiOrder } from "@/lib/ui-types";

const nextStatus: Record<string, string> = {
  CREATED: "WAITING_PAYMENT",
  WAITING_PAYMENT: "PAID",
  PAID: "CONFIRMED",
  CONFIRMED: "COMPLETED"
};

const statusOptions = [
  { value: "ALL", label: "Все статусы" },
  { value: "CREATED", label: "Создан" },
  { value: "WAITING_PAYMENT", label: "Ожидает оплаты" },
  { value: "PAID", label: "Оплачен" },
  { value: "CONFIRMED", label: "Подтвержден" },
  { value: "COMPLETED", label: "Завершен" },
  { value: "DISPUTED", label: "Спор" },
  { value: "FAILED", label: "Ошибка" }
];

function riskScore(order: UiOrder) {
  if (["DISPUTED", "FAILED"].includes(order.status)) return 90;
  if (order.currency === "USD" && order.amount >= 2500) return 68;
  if (order.currency === "RUB" && order.amount >= 180000) return 62;
  if (["PAID", "CONFIRMED"].includes(order.status)) return 42;
  if (order.status === "WAITING_PAYMENT") return 28;
  return 12;
}

function RiskBadge({ score }: { score: number }) {
  const meta =
    score >= 80
      ? { label: "Высокий", className: "border-red-500/20 bg-red-500/10 text-red-700" }
      : score >= 50
        ? { label: "Проверка", className: "border-brass/25 bg-brass/10 text-brass" }
        : { label: "Низкий", className: "border-jade/20 bg-jade/10 text-jade" };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`} title={`Risk score: ${score}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

async function ensureOk(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? payload.message ?? fallback);
}

export function OrdersClient({ orders }: { orders: UiOrder[] }) {
  const router = useRouter();
  const { role, merchantId } = useRole();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [newOrderCurrency, setNewOrderCurrency] = useState("RUB");
  const [sortBy, setSortBy] = useState("created-desc");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const createDisabledReason = disabledActionReason(role, "order:create");
  const updateDisabledReason = disabledActionReason(role, "order:update");
  const disputeDisabledReason = disabledActionReason(role, "order:dispute");

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = orders
      .filter((order) => (role === "MERCHANT" ? order.merchantId === merchantId : true))
      .filter((order) => (status === "ALL" ? true : order.status === status))
      .filter((order) => (currencyFilter === "ALL" ? true : order.currency === currencyFilter))
      .filter((order) => {
        const text = `${order.externalId} ${order.merchantName} ${order.providerName} ${order.method ?? ""}`.toLowerCase();
        return text.includes(normalizedQuery);
      });

    return filtered.sort((left, right) => {
      if (sortBy === "amount-desc") return right.amount - left.amount;
      if (sortBy === "risk-desc") return riskScore(right) - riskScore(left);
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [orders, role, merchantId, status, currencyFilter, query, sortBy]);

  const pageSize = 8;
  const totalPages = Math.max(Math.ceil(visibleOrders.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pagedOrders = visibleOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

  function updateFilter(action: () => void) {
    action();
    setPage(1);
  }

  const mutate = (action: () => Promise<void>) => {
    startTransition(async () => {
      setMessage(null);
      try {
        await action();
        setMessage({ type: "success", text: "Действие выполнено. Статусы, баланс, уведомления и audit log обновлены." });
        router.refresh();
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось выполнить действие." });
      }
    });
  };

  return (
    <div className="section-card">
      <div className="grid gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="eyebrow">Таблица платежей</p>
            <h2 className="section-title mt-2 text-ink">Ордера и маршрутизация</h2>
            <p className="copy mt-2 max-w-3xl">
              Суммы показываются в валюте самой операции. Фильтр валюты не пересчитывает деньги, а просто показывает RUB или USD ордера отдельно.
            </p>
          </div>
          <button
            disabled={isPending || Boolean(createDisabledReason)}
            title={createDisabledReason ?? undefined}
            onClick={() =>
              mutate(async () => {
                await ensureOk(
                  await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ merchantId, currency: newOrderCurrency, actorRole: role })
                  }),
                  "Не удалось создать ордер."
                );
              })
            }
            className="btn btn-primary focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            Создать ордер
          </button>
        </div>

        <div className="filter-grid lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(10rem,auto))]">
          <input
            value={query}
            onChange={(event) => updateFilter(() => setQuery(event.target.value))}
            placeholder="Поиск по ID, мерчанту, методу или провайдеру"
            className="field focus-ring w-full"
          />
          <select value={status} onChange={(event) => updateFilter(() => setStatus(event.target.value))} className="field focus-ring">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={currencyFilter}
            onChange={(event) => updateFilter(() => setCurrencyFilter(event.target.value))}
            className="field focus-ring"
            aria-label="Фильтр по валюте"
          >
            <option value="ALL">Все валюты</option>
            <option value="RUB">Только RUB</option>
            <option value="USD">Только USD</option>
          </select>
          <select value={sortBy} onChange={(event) => updateFilter(() => setSortBy(event.target.value))} className="field focus-ring" aria-label="Сортировка">
            <option value="created-desc">Сначала новые</option>
            <option value="amount-desc">Сначала крупные</option>
            <option value="risk-desc">Сначала риск</option>
          </select>
          <select
            value={newOrderCurrency}
            onChange={(event) => setNewOrderCurrency(event.target.value)}
            className="field focus-ring"
            aria-label="Валюта нового ордера"
          >
            <option value="RUB">Новый ордер: RUB</option>
            <option value="USD">Новый ордер: USD</option>
          </select>
        </div>
      </div>

      {message ? (
        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-jade/25 bg-jade/10 text-moss" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 lg:hidden">
        {!pagedOrders.length ? <EmptyState title="Ордеры не найдены" description="Измените поиск, фильтры или создайте новый sandbox-ордер для выбранного мерчанта." /> : null}
        {pagedOrders.map((order) => {
          const score = riskScore(order);
          return (
            <article key={order.id} className="rounded-[1.25rem] border border-ink/10 bg-white/70 p-4 shadow-insetSoft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/orders/${order.id}`} className="font-mono text-sm font-semibold text-jade hover:text-moss">
                    {order.externalId}
                  </Link>
                  <p className="mt-1 text-sm text-graphite/60">{order.merchantName}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-ink/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Сумма</p>
                  <p className="mt-1 font-semibold">{formatMoney(order.amount, order.currency)}</p>
                </div>
                <div className="rounded-2xl bg-ink/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Комиссия</p>
                  <p className="mt-1 font-semibold">{formatMoney(order.commission, order.currency)}</p>
                </div>
                <div className="rounded-2xl bg-ink/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Метод</p>
                  <p className="mt-1 font-semibold">{order.method ?? "API"}</p>
                </div>
                <div className="rounded-2xl bg-ink/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Risk</p>
                  <p className="mt-1">
                    <RiskBadge score={score} />
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Link href={`/orders/${order.id}`} className="rounded-2xl border border-ink/10 bg-white/70 px-3 py-2.5 text-center text-xs font-semibold text-ink transition hover:bg-white">
                  Детали
                </Link>
                {nextStatus[order.status] ? (
                  <button
                    disabled={isPending || Boolean(updateDisabledReason)}
                    title={updateDisabledReason ?? undefined}
                    onClick={() =>
                      mutate(async () => {
                        await ensureOk(
                          await fetch(`/api/orders/${order.id}/status`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: nextStatus[order.status], actorRole: role })
                          }),
                          "Не удалось изменить статус."
                        );
                      })
                    }
                    className="rounded-2xl bg-jade px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-moss disabled:opacity-50"
                  >
                    Следующий статус
                  </button>
                ) : null}
                {["WAITING_PAYMENT", "PAID", "CONFIRMED"].includes(order.status) ? (
                  <button
                    disabled={isPending || Boolean(disputeDisabledReason)}
                    title={disputeDisabledReason ?? undefined}
                    onClick={() =>
                      mutate(async () => {
                        await ensureOk(
                          await fetch(`/api/orders/${order.id}/status`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: "DISPUTED", actorRole: role })
                          }),
                          "Не удалось перевести ордер в спор."
                        );
                      })
                    }
                    className="rounded-2xl bg-rose-100 px-3 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 disabled:opacity-50"
                  >
                    В спор
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 hidden overflow-x-auto lg:block">
        {pagedOrders.length ? <table className="enterprise-table min-w-[1120px] text-left text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2">ID ордера</th>
              <th className="px-4 py-2">Мерчант</th>
              <th className="px-4 py-2 text-right">Сумма</th>
              <th className="px-4 py-2 text-right">Валюта</th>
              <th className="px-4 py-2">Метод</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2">Риск</th>
              <th className="px-4 py-2">Создан</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {pagedOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-mono font-semibold">
                  <Link href={`/orders/${order.id}`} className="text-jade hover:text-moss">
                    {order.externalId}
                  </Link>
                </td>
                <td className="px-4 py-3 font-semibold text-ink">{order.merchantName}</td>
                <td className="px-4 py-3 text-right font-mono text-ink tabular-nums">{formatMoney(order.amount, order.currency)}</td>
                <td className="px-4 py-3 text-right font-mono text-ink">{order.currency}</td>
                <td className="px-4 py-3">{order.method ?? "API"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">
                  <RiskBadge score={riskScore(order)} />
                </td>
                <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/orders/${order.id}`} className="rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-white">
                      Детали
                    </Link>
                    {nextStatus[order.status] ? (
                      <button
                        disabled={isPending || Boolean(updateDisabledReason)}
                        title={updateDisabledReason ?? undefined}
                        onClick={() =>
                          mutate(async () => {
                            await ensureOk(
                              await fetch(`/api/orders/${order.id}/status`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: nextStatus[order.status], actorRole: role })
                              }),
                              "Не удалось изменить статус."
                            );
                          })
                        }
                        className="rounded-full bg-jade px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-moss disabled:opacity-50"
                      >
                        Следующий
                      </button>
                    ) : null}
                    {["WAITING_PAYMENT", "PAID", "CONFIRMED"].includes(order.status) ? (
                      <button
                        disabled={isPending || Boolean(disputeDisabledReason)}
                        title={disputeDisabledReason ?? undefined}
                        onClick={() =>
                          mutate(async () => {
                            await ensureOk(
                              await fetch(`/api/orders/${order.id}/status`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "DISPUTED", actorRole: role })
                              }),
                              "Не удалось перевести ордер в спор."
                            );
                          })
                        }
                        className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 disabled:opacity-50"
                      >
                        В спор
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table> : <EmptyState title="Ордеры не найдены" description="Измените поиск, фильтры или создайте новый sandbox-ордер для выбранного мерчанта." />}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/55 px-4 py-3 text-sm text-graphite/65 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Показано {pagedOrders.length} из {visibleOrders.length}. Страница {safePage} из {totalPages}.
        </span>
        <div className="flex gap-2">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))} className="focus-ring rounded-full border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold text-ink disabled:opacity-40">
            Назад
          </button>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((value) => Math.min(value + 1, totalPages))} className="focus-ring rounded-full border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold text-ink disabled:opacity-40">
            Далее
          </button>
        </div>
      </div>
    </div>
  );
}
