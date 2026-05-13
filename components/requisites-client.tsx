"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney } from "@/lib/format";

type Requisite = {
  id: string;
  type: string;
  bank: string;
  maskedNumber: string;
  holder: string;
  status: string;
  dailyLimit: number;
  dailyUsed: number;
  linkedOrders: number;
  merchantName: string;
};

export function RequisitesClient({ requisites }: { requisites: Requisite[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggle = (id: string, status: string) => {
    startTransition(async () => {
      await fetch(`/api/requisites/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      router.refresh();
    });
  };

  return (
    <div className="card rounded-[1.75rem] p-5">
      <div className="grid gap-3 lg:hidden">
        {requisites.map((requisite) => (
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
                <p className="mt-1 font-semibold">{formatMoney(requisite.dailyUsed)} / {formatMoney(requisite.dailyLimit)}</p>
              </div>
              <div className="rounded-2xl bg-ink/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-graphite/45">Операции</p>
                <p className="mt-1 font-semibold">{requisite.linkedOrders}</p>
              </div>
            </div>
            <button
              disabled={isPending}
              onClick={() => toggle(requisite.id, requisite.status === "ACTIVE" ? "PAUSED" : "ACTIVE")}
              className="mt-4 w-full rounded-2xl bg-ink px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-moss disabled:opacity-50"
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
            {requisites.map((requisite) => (
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
                <td className="px-4 py-3">{formatMoney(requisite.dailyUsed)} / {formatMoney(requisite.dailyLimit)}</td>
                <td className="px-4 py-3">{requisite.linkedOrders}</td>
                <td className="rounded-r-2xl px-4 py-3">
                  <button
                    disabled={isPending}
                    onClick={() => toggle(requisite.id, requisite.status === "ACTIVE" ? "PAUSED" : "ACTIVE")}
                    className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
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
