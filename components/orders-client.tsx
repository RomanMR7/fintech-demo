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

export function OrdersClient({ orders }: { orders: UiOrder[] }) {
  const router = useRouter();
  const { role, merchantId } = useRole();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [isPending, startTransition] = useTransition();

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
      await action();
      router.refresh();
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
        </div>
        <button
          disabled={isPending}
          onClick={() =>
            mutate(async () => {
              await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ merchantId })
              });
            })
          }
          className="focus-ring rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-50"
        >
          Создать ордер
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
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
                            await fetch(`/api/orders/${order.id}/status`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: nextStatus[order.status], actorRole: role })
                            });
                          })
                        }
                        className="rounded-full bg-jade px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-moss disabled:opacity-50"
                      >
                        Следующий статус
                      </button>
                    ) : null}
                    {order.status !== "DISPUTED" && order.status !== "COMPLETED" ? (
                      <button
                        disabled={isPending}
                        onClick={() =>
                          mutate(async () => {
                            await fetch(`/api/orders/${order.id}/status`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "DISPUTED", actorRole: role })
                            });
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
