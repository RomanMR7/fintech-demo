"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useRole } from "@/components/role-provider";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { UiOrder } from "@/lib/ui-types";

const nextStatus: Record<string, string> = {
  CREATED: "WAITING_PAYMENT",
  WAITING_PAYMENT: "PAID",
  PAID: "CONFIRMED",
  CONFIRMED: "COMPLETED"
};

async function ensureOk(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? payload.message ?? fallback);
}

export function OrdersClient({ orders }: { orders: UiOrder[] }) {
  const router = useRouter();
  const { role, merchantId } = useRole();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [currency, setCurrency] = useState("RUB");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const visibleOrders = useMemo(() => {
    return orders
      .filter((order) => (role === "MERCHANT" ? order.merchantId === merchantId : true))
      .filter((order) => (status === "ALL" ? true : order.status === status))
      .filter((order) => {
        const text = `${order.externalId} ${order.merchantName} ${order.providerName}`.toLowerCase();
        return text.includes(query.toLowerCase());
      });
  }, [orders, role, merchantId, status, query]);

  const mutate = (action: () => Promise<void>) => {
    startTransition(async () => {
      setMessage(null);
      try {
        await action();
        setMessage({ type: "success", text: "Действие выполнено. Статусы, баланс, уведомления и журнал обновлены." });
        router.refresh();
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось выполнить действие." });
      }
    });
  };

  return (
    <div className="card rounded-[1.75rem] p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по ID, мерчанту или провайдеру"
            className="focus-ring w-full rounded-2xl border border-ink/10 bg-white/75 px-4 py-3 text-sm lg:w-80"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="focus-ring rounded-2xl border border-ink/10 bg-white/75 px-4 py-3 text-sm"
          >
            <option value="ALL">Все статусы</option>
            <option value="CREATED">Создан</option>
            <option value="WAITING_PAYMENT">Ожидает оплаты</option>
            <option value="PAID">Оплачен</option>
            <option value="CONFIRMED">Подтвержден</option>
            <option value="COMPLETED">Завершен</option>
            <option value="DISPUTED">Спор</option>
          </select>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="focus-ring rounded-2xl border border-ink/10 bg-white/75 px-4 py-3 text-sm"
            aria-label="Валюта нового ордера"
          >
            <option value="RUB">Новый ордер: RUB</option>
            <option value="USD">Новый ордер: USD</option>
          </select>
        </div>
        <button
          disabled={isPending}
          onClick={() =>
            mutate(async () => {
              await ensureOk(
                await fetch("/api/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ merchantId, currency })
                }),
                "Не удалось создать ордер."
              );
            })
          }
          className="focus-ring rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-50"
        >
          Создать ордер
        </button>
      </div>

      {message ? (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
            message.type === "success" ? "border-jade/25 bg-jade/10 text-moss" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 lg:hidden">
        {visibleOrders.map((order) => (
          <article key={order.id} className="rounded-[1.25rem] border border-ink/10 bg-white/70 p-4 shadow-insetSoft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/orders/${order.id}`} className="font-display text-lg font-semibold text-jade hover:text-moss">
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
                <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Провайдер</p>
                <p className="mt-1 font-semibold">{order.providerName}</p>
              </div>
              <div className="rounded-2xl bg-ink/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Создан</p>
                <p className="mt-1 font-semibold">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {nextStatus[order.status] ? (
                <button
                  disabled={isPending}
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
                  disabled={isPending}
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
                  Перевести в спор
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-graphite/48">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Мерчант</th>
              <th className="px-4 py-2">Сумма</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2">Провайдер</th>
              <th className="px-4 py-2">Комиссия</th>
              <th className="px-4 py-2">Создан</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => (
              <tr key={order.id} className="rounded-2xl bg-white/60 shadow-insetSoft">
                <td className="rounded-l-2xl px-4 py-3 font-semibold">
                  <Link href={`/orders/${order.id}`} className="text-jade hover:text-moss">
                    {order.externalId}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.merchantName}</td>
                <td className="px-4 py-3">{formatMoney(order.amount, order.currency)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">{order.providerName}</td>
                <td className="px-4 py-3">{formatMoney(order.commission, order.currency)}</td>
                <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                <td className="rounded-r-2xl px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {nextStatus[order.status] ? (
                      <button
                        disabled={isPending}
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
                        Следующий статус
                      </button>
                    ) : null}
                    {["WAITING_PAYMENT", "PAID", "CONFIRMED"].includes(order.status) ? (
                      <button
                        disabled={isPending}
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
        </table>
      </div>
    </div>
  );
}
