"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { EmptyState } from "@/components/empty-state";
import { useRole } from "@/components/role-provider";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { disabledActionReason } from "@/lib/rbac";
import { SANDBOX_2FA_CODE } from "@/lib/security";
import { type UiPayout } from "@/lib/ui-types";

async function ensureOk(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? payload.message ?? fallback);
}

export function PayoutsClient({ payouts }: { payouts: UiPayout[] }) {
  const router = useRouter();
  const { role, merchantId } = useRole();
  const [currency, setCurrency] = useState("RUB");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("created-desc");
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<null | { payoutId: string; status: "COMPLETED" | "CANCELED"; title: string }>(null);
  const [reason, setReason] = useState("Плановая обработка выплаты в sandbox");
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const visiblePayouts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = payouts
      .filter((payout) => (role === "MERCHANT" ? payout.merchantId === merchantId : true))
      .filter((payout) => (statusFilter === "ALL" ? true : payout.status === statusFilter))
      .filter((payout) => (currencyFilter === "ALL" ? true : payout.currency === currencyFilter))
      .filter((payout) => `${payout.id} ${payout.merchantName} ${payout.recipient}`.toLowerCase().includes(normalizedQuery));

    return filtered.sort((left, right) => {
      if (sortBy === "amount-desc") return right.amount - left.amount;
      if (sortBy === "amount-asc") return left.amount - right.amount;
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [payouts, role, merchantId, query, statusFilter, currencyFilter, sortBy]);

  const pageSize = 8;
  const totalPages = Math.max(Math.ceil(visiblePayouts.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pagedPayouts = visiblePayouts.slice((safePage - 1) * pageSize, safePage * pageSize);

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
  const createDisabledReason = disabledActionReason(role, "payout:create");

  function updateFilter(action: () => void) {
    action();
    setPage(1);
  }

  function openPayoutAction(payoutId: string, status: "COMPLETED" | "CANCELED") {
    const action = status === "COMPLETED" ? "payout:approve" : "payout:cancel";
    const disabledReason = disabledActionReason(role, action);
    if (disabledReason) {
      setMessage({ type: "error", text: disabledReason });
      return;
    }

    setPendingAction({ payoutId, status, title: status === "COMPLETED" ? "Подтвердить выплату" : "Отменить выплату" });
  }

  function submitPayoutAction() {
    if (!pendingAction) return;
    mutate(async () => {
      await ensureOk(
        await fetch(`/api/payouts/${pendingAction.payoutId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: pendingAction.status, actorRole: role, reason, code })
        }),
        pendingAction.status === "COMPLETED" ? "Не удалось подтвердить выплату." : "Не удалось отменить выплату."
      );
      setPendingAction(null);
      setCode("");
    });
  }

  return (
    <section className="section-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="eyebrow">Операции выплат</p>
          <h2 className="section-title mt-2 text-ink">Выплаты</h2>
          <p className="copy mt-2 max-w-3xl">Создание выплаты резервирует сумму и комиссию на frozen balance, чтобы деньги нельзя было вывести дважды.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(10rem,auto)_auto]">
          <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="field focus-ring" aria-label="Валюта новой выплаты">
            <option value="RUB">Выплата в RUB</option>
            <option value="USD">Выплата в USD</option>
          </select>
          <button
            disabled={isPending || Boolean(createDisabledReason)}
            title={createDisabledReason ?? undefined}
            onClick={() =>
              mutate(async () => {
                await ensureOk(
                  await fetch("/api/payouts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ merchantId, currency, actorRole: role })
                  }),
                  "Не удалось создать выплату."
                );
              })
            }
            className="btn btn-primary focus-ring disabled:cursor-not-allowed disabled:opacity-50"
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

      <div className="filter-grid mt-5 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(10rem,auto))]">
        <input value={query} onChange={(event) => updateFilter(() => setQuery(event.target.value))} placeholder="Поиск по ID, мерчанту или получателю" className="field focus-ring w-full" />
        <select value={statusFilter} onChange={(event) => updateFilter(() => setStatusFilter(event.target.value))} className="field focus-ring" aria-label="Фильтр статуса выплаты">
          <option value="ALL">Все статусы</option>
          <option value="PENDING_APPROVAL">Ждет подтверждения</option>
          <option value="HOLD">В hold</option>
          <option value="COMPLETED">Выплачена</option>
          <option value="CANCELED">Отменена</option>
          <option value="DISPUTED">Спор</option>
        </select>
        <select value={currencyFilter} onChange={(event) => updateFilter(() => setCurrencyFilter(event.target.value))} className="field focus-ring" aria-label="Фильтр валюты выплаты">
          <option value="ALL">Все валюты</option>
          <option value="RUB">Только RUB</option>
          <option value="USD">Только USD</option>
        </select>
        <select value={sortBy} onChange={(event) => updateFilter(() => setSortBy(event.target.value))} className="field focus-ring" aria-label="Сортировка выплат">
          <option value="created-desc">Сначала новые</option>
          <option value="amount-desc">Сумма по убыванию</option>
          <option value="amount-asc">Сумма по возрастанию</option>
        </select>
      </div>

      <div className="mt-5 grid gap-3 lg:hidden">
        {!pagedPayouts.length ? <EmptyState title="Выплаты не найдены" description="Измените фильтры или создайте новую sandbox-выплату для выбранного мерчанта." /> : null}
        {pagedPayouts.map((payout) => (
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
                  onClick={() => openPayoutAction(payout.id, "COMPLETED")}
                  className="btn btn-primary focus-ring min-h-10 text-xs disabled:opacity-50"
                >
                  Подтвердить
                </button>
                <button
                  disabled={isPending}
                  onClick={() => openPayoutAction(payout.id, "CANCELED")}
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
        {pagedPayouts.length ? <table className="enterprise-table min-w-[980px] text-left">
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
            {pagedPayouts.map((payout) => (
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
                        onClick={() => openPayoutAction(payout.id, "COMPLETED")}
                        className="btn btn-primary btn-sm focus-ring disabled:opacity-50"
                      >
                        Подтвердить
                      </button>
                      <button
                        disabled={isPending}
                        onClick={() => openPayoutAction(payout.id, "CANCELED")}
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
        </table> : <EmptyState title="Выплаты не найдены" description="Измените фильтры или создайте новую sandbox-выплату для выбранного мерчанта." />}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/55 px-4 py-3 text-sm text-graphite/65 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Показано {pagedPayouts.length} из {visiblePayouts.length}. Страница {safePage} из {totalPages}.
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

      {pendingAction ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={pendingAction.title}>
          <div className="card w-full max-w-lg rounded-[var(--radius-xl)] p-5">
            <p className="eyebrow">Критическое финансовое действие</p>
            <h3 className="section-title mt-2 text-ink">{pendingAction.title}</h3>
            <p className="copy mt-2">
              {pendingAction.status === "COMPLETED"
                ? `Подтверждение выплаты окончательно спишет hold. Введите sandbox 2FA-код ${SANDBOX_2FA_CODE}.`
                : "Отмена выплаты вернет сумму и комиссию из hold в доступный баланс."}
            </p>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm font-semibold text-ink">
                Основание решения
                <input value={reason} onChange={(event) => setReason(event.target.value)} className="field focus-ring font-normal" />
              </label>
              {pendingAction.status === "COMPLETED" ? (
                <label className="grid gap-1 text-sm font-semibold text-ink">
                  Sandbox 2FA
                  <input value={code} onChange={(event) => setCode(event.target.value)} placeholder={SANDBOX_2FA_CODE} className="field focus-ring font-mono font-normal" />
                </label>
              ) : null}
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setPendingAction(null)} className="btn btn-secondary focus-ring">
                Отмена
              </button>
              <button type="button" onClick={submitPayoutAction} className="btn btn-primary focus-ring">
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
