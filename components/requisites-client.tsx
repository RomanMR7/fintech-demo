"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EmptyState } from "@/components/empty-state";
import { useRole } from "@/components/role-provider";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney } from "@/lib/format";
import { disabledActionReason } from "@/lib/rbac";

type Requisite = {
  id: string;
  merchantId: string | null;
  type: string;
  bank: string;
  maskedNumber: string;
  holder: string;
  status: string;
  dailyLimit: number;
  dailyUsed: number;
  currency: string;
  linkedOrders: number;
  merchantName: string;
};

export function RequisitesClient({ requisites }: { requisites: Requisite[] }) {
  const router = useRouter();
  const { role, merchantId } = useRole();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const manageDisabledReason = disabledActionReason(role, "requisite:manage");
  const visibleRequisites = requisites.filter((requisite) => requisite.merchantId === merchantId);

  const toggle = (id: string, status: string) => {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch(`/api/requisites/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, actorRole: role })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage({ type: "error", text: payload.error ?? payload.message ?? "Не удалось изменить реквизит." });
        return;
      }

      setMessage({ type: "success", text: "Статус реквизита обновлен, действие записано в журнал аудита." });
      router.refresh();
    });
  };

  return (
    <div className="card rounded-[1.75rem] p-5">
      {message ? (
        <div className={`alert mb-4 ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          {message.text}
        </div>
      ) : null}

      {!visibleRequisites.length ? <EmptyState title="Реквизитов пока нет" description="Когда платформа или мерчант добавит платежные детали, здесь появятся лимиты, статусы и связанные операции." /> : null}

      <div className="grid gap-3 lg:hidden">
        {visibleRequisites.map((requisite) => (
          <article key={requisite.id} className="rounded-[1.25rem] border border-ink/10 bg-white/70 p-4 shadow-insetSoft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold">{requisite.bank}</p>
                <p className="mt-1 text-sm text-graphite/60">{requisite.maskedNumber} · {requisite.holder}</p>
              </div>
              <StatusBadge status={requisite.status} type="requisite" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-ink/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Тип</p>
                <p className="mt-1 font-semibold">{requisite.type}</p>
              </div>
              <div className="rounded-2xl bg-ink/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Мерчант</p>
                <p className="mt-1 font-semibold">{requisite.merchantName}</p>
              </div>
              <div className="rounded-2xl bg-ink/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Лимит</p>
                <p className="mt-1 font-semibold">{formatMoney(requisite.dailyUsed, requisite.currency)} / {formatMoney(requisite.dailyLimit, requisite.currency)}</p>
              </div>
              <div className="rounded-2xl bg-ink/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Операции</p>
                <p className="mt-1 font-semibold">{requisite.linkedOrders}</p>
              </div>
            </div>
            <button
              disabled={isPending || Boolean(manageDisabledReason)}
              title={manageDisabledReason ?? undefined}
              onClick={() => toggle(requisite.id, requisite.status === "ACTIVE" ? "PAUSED" : "ACTIVE")}
              className="btn btn-primary focus-ring mt-4 w-full text-xs disabled:opacity-50"
            >
              {requisite.status === "ACTIVE" ? "Поставить на паузу" : "Активировать"}
            </button>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-graphite/48">
            <tr>
              <th className="px-4 py-2">Тип</th>
              <th className="px-4 py-2">Банк / реквизит</th>
              <th className="px-4 py-2">Мерчант</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2">Лимиты</th>
              <th className="px-4 py-2">Операции</th>
              <th className="px-4 py-2">Действие</th>
            </tr>
          </thead>
          <tbody>
            {visibleRequisites.map((requisite) => (
              <tr key={requisite.id} className="bg-white/60">
                <td className="rounded-l-2xl px-4 py-3 font-semibold">{requisite.type}</td>
                <td className="px-4 py-3">
                  <p>{requisite.bank}</p>
                  <p className="text-xs text-graphite/55">{requisite.maskedNumber} · {requisite.holder}</p>
                </td>
                <td className="px-4 py-3">{requisite.merchantName}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={requisite.status} type="requisite" />
                </td>
                <td className="px-4 py-3">{formatMoney(requisite.dailyUsed, requisite.currency)} / {formatMoney(requisite.dailyLimit, requisite.currency)}</td>
                <td className="px-4 py-3">{requisite.linkedOrders}</td>
                <td className="rounded-r-2xl px-4 py-3">
                  <button
                    disabled={isPending || Boolean(manageDisabledReason)}
                    title={manageDisabledReason ?? undefined}
                    onClick={() => toggle(requisite.id, requisite.status === "ACTIVE" ? "PAUSED" : "ACTIVE")}
                    className="btn btn-primary btn-sm focus-ring disabled:opacity-50"
                  >
                    {requisite.status === "ACTIVE" ? "Пауза" : "Активировать"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
