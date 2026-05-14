"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useRole } from "@/components/role-provider";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { UiPayout } from "@/lib/ui-types";

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

  const visiblePayouts = useMemo(
    () => payouts.filter((payout) => (role === "MERCHANT" ? payout.merchantId === merchantId : true)),
    [payouts, role, merchantId]
  );

  const mutate = (action: () => Promise<void>) => {
    startTransition(async () => {
      setMessage(null);
      try {
        await action();
        setMessage({ type: "success", text: "Выплата обновлена. Баланс, уведомления и журнал пересчитаны." });
        router.refresh();
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось выполнить действие." });
      }
    });
  };

  return (
    <div className="card rounded-[1.75rem] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-2xl font-semibold">Выплаты</p>
          <p className="mt-1 text-sm text-graphite/65">Создание выплаты резервирует сумму и комиссию на замороженном балансе.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[auto_auto]">
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="focus-ring rounded-2xl border border-ink/10 bg-white/75 px-4 py-3 text-sm font-semibold text-ink shadow-insetSoft"
            aria-label="Валюта новой выплаты"
          >
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
            className="focus-ring rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-50"
          >
            Создать выплату
          </button>
        </div>
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
        {visiblePayouts.map((payout) => (
          <article key={payout.id} className="rounded-[1.25rem] border border-ink/10 bg-white/70 p-4 shadow-insetSoft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold">{payout.id}</p>
                <p className="mt-1 text-sm text-graphite/60">{payout.merchantName}</p>
              </div>
              <StatusBadge status={payout.status} type="payout" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-ink/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Сумма</p>
                <p className="mt-1 font-semibold">{formatMoney(payout.amount, payout.currency)}</p>
              </div>
              <div className="rounded-2xl bg-ink/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Комиссия</p>
                <p className="mt-1 font-semibold">{formatMoney(payout.commission, payout.currency)}</p>
              </div>
              <div className="rounded-2xl bg-ink/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Получатель</p>
                <p className="mt-1 break-words font-semibold">{payout.recipient}</p>
              </div>
              <div className="rounded-2xl bg-ink/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Дата</p>
                <p className="mt-1 font-semibold">{formatDate(payout.createdAt)}</p>
              </div>
            </div>
            {["PENDING_APPROVAL", "HOLD", "DISPUTED"].includes(payout.status) ? (
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
                  className="rounded-2xl bg-jade px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-moss disabled:opacity-50"
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
                  className="rounded-2xl bg-stone-100 px-3 py-2.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-200 disabled:opacity-50"
                >
                  Отменить
                </button>
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-ink/[0.04] px-3 py-2 text-xs font-semibold text-graphite/55">Выплата закрыта</p>
            )}
          </article>
        ))}
      </div>

      <div className="mt-5 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-graphite/48">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Мерчант</th>
              <th className="px-4 py-2">Сумма</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2">Получатель</th>
              <th className="px-4 py-2">Комиссия</th>
              <th className="px-4 py-2">Дата</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {visiblePayouts.map((payout) => (
              <tr key={payout.id} className="bg-white/60">
                <td className="rounded-l-2xl px-4 py-3 font-semibold">{payout.id}</td>
                <td className="px-4 py-3">{payout.merchantName}</td>
                <td className="px-4 py-3">{formatMoney(payout.amount, payout.currency)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={payout.status} type="payout" />
                </td>
                <td className="px-4 py-3">{payout.recipient}</td>
                <td className="px-4 py-3">{formatMoney(payout.commission, payout.currency)}</td>
                <td className="px-4 py-3">{formatDate(payout.createdAt)}</td>
                <td className="rounded-r-2xl px-4 py-3">
                  {["PENDING_APPROVAL", "HOLD", "DISPUTED"].includes(payout.status) ? (
                    <div className="flex gap-2">
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
                        className="rounded-full bg-jade px-3 py-1.5 text-xs font-semibold text-white"
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
                        className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700"
                      >
                        Отменить
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-graphite/50">Закрыта</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
