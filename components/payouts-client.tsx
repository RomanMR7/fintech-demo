"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useRole } from "@/components/role-provider";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { type UiPayout } from "@/lib/ui-types";

async function ensureOk(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? payload.message ?? fallback);
}

export function PayoutsClient({ payouts }: { payouts: UiPayout[] }) {
  const router = useRouter();
  const { role, merchantId } = useRole();
  const [currency, setCurrency] = useState("RUB");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const visiblePayouts = useMemo(() => payouts.filter((payout) => (role === "MERCHANT" ? payout.merchantId === merchantId : true)), [payouts, role, merchantId]);

  const mutate = (action: () => Promise<void>) => {
    startTransition(async () => {
      setMessage(null);
      try {
        await action();
        setMessage({ type: "success", text: "Выплата обновлена. Баланс, уведомления и audit log пересчитаны." });
        router.refresh();
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось выполнить действие." });
      }
    });
  };

  const closeableStatuses = ["PENDING_APPROVAL", "HOLD", "DISPUTED"];

  return (
    <section className="section-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="eyebrow">Payout operations</p>
          <h2 className="section-title mt-2 text-ink">Выплаты</h2>
          <p className="copy mt-2 max-w-3xl">Создание выплаты резервирует сумму и комиссию на frozen balance, чтобы деньги нельзя было вывести дважды.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(10rem,auto)_auto]">
          <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="field focus-ring" aria-label="Валюта новой выплаты">
            <option value="RUB">Выплата в RUB</option>
            <option value="USD">Выплата в USD</option>
          </select>
          <button
            disabled={isPending}
            onClick={() =>
              mutate(async () => {
                await ensureOk(
                  await fetch("/api/payouts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ merchantId, currency })
                  }),
                  "Не удалось создать выплату."
                );
              })
            }
            className="btn btn-primary focus-ring disabled:opacity-50"
          >
            Создать выплату
          </button>
        </div>
      </div>

      {message ? (
        <div className={`mt-4 rounded-[var(--radius-lg)] border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-jade/25 bg-jade/10 text-moss" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 lg:hidden">
        {visiblePayouts.map((payout) => (
          <article key={payout.id} className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/70 p-4 shadow-insetSoft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-ink">{payout.id}</p>
                <p className="copy-sm mt-1">{payout.merchantName}</p>
              </div>
              <StatusBadge status={payout.status} type="payout" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="money-row block min-h-0">
                <p className="money-code">Сумма</p>
                <p className="amount-sm mt-1">{formatMoney(payout.amount, payout.currency)}</p>
              </div>
              <div className="money-row block min-h-0">
                <p className="money-code">Комиссия</p>
                <p className="amount-sm mt-1">{formatMoney(payout.commission, payout.currency)}</p>
              </div>
              <div className="col-span-2 rounded-[var(--radius-md)] bg-ink/[0.04] p-3">
                <p className="money-code">Получатель</p>
                <p className="mt-1 break-words font-mono text-sm font-semibold text-ink">{payout.recipient}</p>
              </div>
            </div>
            {closeableStatuses.includes(payout.status) ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  disabled={isPending}
                  onClick={() =>
                    mutate(async () => {
                      await ensureOk(
                        await fetch(`/api/payouts/${payout.id}/status`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "COMPLETED" })
                        }),
                        "Не удалось подтвердить выплату."
                      );
                    })
                  }
                  className="btn btn-primary focus-ring min-h-10 text-xs disabled:opacity-50"
                >
                  Подтвердить
                </button>
                <button
                  disabled={isPending}
                  onClick={() =>
                    mutate(async () => {
                      await ensureOk(
                        await fetch(`/api/payouts/${payout.id}/status`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "CANCELED" })
                        }),
                        "Не удалось отменить выплату."
                      );
                    })
                  }
                  className="btn btn-secondary focus-ring min-h-10 text-xs disabled:opacity-50"
                >
                  Отменить
                </button>
              </div>
            ) : (
              <p className="copy-sm mt-4 rounded-[var(--radius-md)] bg-ink/[0.04] px-3 py-2 font-semibold">Выплата закрыта</p>
            )}
          </article>
        ))}
      </div>

      <div className="mt-5 hidden overflow-x-auto lg:block">
        <table className="enterprise-table min-w-[980px] text-left">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Мерчант</th>
              <th className="px-4 py-2 text-right">Сумма</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2">Получатель</th>
              <th className="px-4 py-2 text-right">Комиссия</th>
              <th className="px-4 py-2">Дата</th>
              <th className="px-4 py-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {visiblePayouts.map((payout) => (
              <tr key={payout.id}>
                <td className="font-mono font-semibold text-ink">{payout.id}</td>
                <td className="font-semibold text-ink">{payout.merchantName}</td>
                <td className="text-right font-mono text-ink tabular-nums">{formatMoney(payout.amount, payout.currency)}</td>
                <td>
                  <StatusBadge status={payout.status} type="payout" />
                </td>
                <td className="max-w-[18rem] truncate font-mono text-xs text-graphite/72">{payout.recipient}</td>
                <td className="text-right font-mono text-ink tabular-nums">{formatMoney(payout.commission, payout.currency)}</td>
                <td>{formatDate(payout.createdAt)}</td>
                <td className="text-right">
                  {closeableStatuses.includes(payout.status) ? (
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={isPending}
                        onClick={() =>
                          mutate(async () => {
                            await ensureOk(
                              await fetch(`/api/payouts/${payout.id}/status`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "COMPLETED" })
                              }),
                              "Не удалось подтвердить выплату."
                            );
                          })
                        }
                        className="btn btn-primary btn-sm focus-ring disabled:opacity-50"
                      >
                        Подтвердить
                      </button>
                      <button
                        disabled={isPending}
                        onClick={() =>
                          mutate(async () => {
                            await ensureOk(
                              await fetch(`/api/payouts/${payout.id}/status`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "CANCELED" })
                              }),
                              "Не удалось отменить выплату."
                            );
                          })
                        }
                        className="btn btn-secondary btn-sm focus-ring disabled:opacity-50"
                      >
                        Отменить
                      </button>
                    </div>
                  ) : (
                    <span className="copy-sm font-semibold">Закрыта</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
