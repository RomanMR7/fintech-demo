"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { EmptyState } from "@/components/empty-state";
import { useRole } from "@/components/role-provider";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { disabledActionReason } from "@/lib/rbac";
import { UiAppeal } from "@/lib/ui-types";

export function AppealsClient({ appeals }: { appeals: UiAppeal[] }) {
  const router = useRouter();
  const { role, merchantId } = useRole();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const resolveDisabledReason = disabledActionReason(role, "appeal:resolve");

  const visibleAppeals = useMemo(
    () => appeals.filter((appeal) => (role === "MERCHANT" ? appeal.merchantId === merchantId : true)),
    [appeals, role, merchantId]
  );

  const mutate = (action: () => Promise<void>) => {
    startTransition(async () => {
      setMessage(null);
      try {
        await action();
        setMessage({ type: "success", text: "Апелляция обновлена, событие записано в журнал аудита." });
        router.refresh();
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось обновить апелляцию." });
      }
    });
  };

  async function ensureOk(response: Response, fallback: string) {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error ?? payload.message ?? fallback);
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <button
          disabled={isPending}
          onClick={() =>
            mutate(async () => {
              await fetch("/api/appeals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
            })
          }
          className="focus-ring rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-50"
        >
          Создать апелляцию
        </button>
      </div>
      {message ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-jade/25 bg-jade/10 text-moss" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      ) : null}
      {!visibleAppeals.length ? <EmptyState title="Апелляций пока нет" description="Когда появится спорная операция, здесь будет виден ордер, сумма hold, причина и действия support-команды." /> : null}
      {visibleAppeals.map((appeal) => (
        <article key={appeal.id} className="card rounded-[1.75rem] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-display text-2xl font-semibold">{appeal.id}</p>
                <StatusBadge status={appeal.status} type="appeal" />
              </div>
              <p className="mt-2 text-sm text-graphite/70">
                Ордер {appeal.orderExternalId} · {appeal.merchantName} · холд {formatMoney(appeal.frozenAmount, appeal.currency)}
              </p>
              <p className="mt-4 rounded-2xl bg-white/60 p-4 text-sm leading-6 text-graphite/78">{appeal.reason}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["NEW"].includes(appeal.status) ? (
                <button
                  disabled={isPending || Boolean(resolveDisabledReason)}
                  title={resolveDisabledReason ?? undefined}
                  onClick={() =>
                    mutate(async () => {
                      await ensureOk(
                        await fetch(`/api/appeals/${appeal.id}/open`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ actorRole: role })
                        }),
                        "Не удалось взять апелляцию в работу."
                      );
                    })
                  }
                  className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-800"
                >
                  Взять в работу
                </button>
              ) : null}
              {["NEW", "OPEN"].includes(appeal.status) ? (
                <>
                  <button
                    disabled={isPending || Boolean(resolveDisabledReason)}
                    title={resolveDisabledReason ?? undefined}
                    onClick={() =>
                      mutate(async () => {
                        await ensureOk(
                          await fetch(`/api/appeals/${appeal.id}/resolve`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ resolution: "merchant", actorRole: role })
                          }),
                          "Не удалось решить апелляцию."
                        );
                      })
                    }
                    className="rounded-full bg-jade px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    В пользу мерчанта
                  </button>
                  <button
                    disabled={isPending || Boolean(resolveDisabledReason)}
                    title={resolveDisabledReason ?? undefined}
                    onClick={() =>
                      mutate(async () => {
                        await ensureOk(
                          await fetch(`/api/appeals/${appeal.id}/resolve`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ resolution: "platform", actorRole: role })
                          }),
                          "Не удалось решить апелляцию."
                        );
                      })
                    }
                    className="rounded-full bg-brass/15 px-3 py-1.5 text-xs font-semibold text-brass"
                  >
                    В пользу платформы
                  </button>
                </>
              ) : null}
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {appeal.comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-ink/10 bg-white/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-graphite/45">
                  {comment.authorRole} · {formatDate(comment.createdAt)}
                </p>
                <p className="mt-2 text-sm leading-6 text-graphite/75">{comment.message}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
