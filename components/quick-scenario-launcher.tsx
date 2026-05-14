"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const scenarios = [
  {
    key: "balance-after-success",
    title: "Successful order",
    description: "Проводит оплату до завершения и обновляет доступный баланс."
  },
  {
    key: "merchant-create-payout",
    title: "Payout created",
    description: "Создает выплату, резервирует сумму и отправляет ее в проверку."
  },
  {
    key: "freeze-disputed",
    title: "Risk hold",
    description: "Переводит спорную часть суммы из доступного баланса в hold."
  },
  {
    key: "create-appeal",
    title: "Dispute opened",
    description: "Создает апелляцию и задачу для support-команды."
  },
  {
    key: "support-review-appeal",
    title: "Webhook retry / review",
    description: "Имитирует ручную проверку и запись события в audit log."
  }
];

export function QuickScenarioLauncher() {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function runScenario(key: string, title: string) {
    setPendingKey(key);
    setMessage(null);

    try {
      const response = await fetch(`/api/scenarios/${key}/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Не удалось выполнить сценарий.");

      setMessage(`${title}: выполнен шаг ${payload.step} из ${payload.totalSteps}. KPI, audit log и связанные данные обновлены.`);
      startTransition(() => router.refresh());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить сценарий.");
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <section className="card rounded-[1.75rem] p-5">
      <div className="grid gap-3 xl:grid-cols-[0.75fr_1.25fr] xl:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Live demo</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Запустить рабочий сценарий</h2>
          <p className="mt-2 text-sm leading-6 text-graphite/68">
            Кнопки ниже реально меняют demo-данные: создают операции, двигают статусы, меняют балансы, добавляют уведомления и записи в audit log.
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((scenario) => {
            const pending = pendingKey === scenario.key || (isPending && pendingKey === scenario.key);
            return (
              <button
                type="button"
                key={scenario.key}
                onClick={() => runScenario(scenario.key, scenario.title)}
                disabled={pendingKey !== null}
                className="focus-ring group rounded-2xl border border-ink/10 bg-white/60 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-wait disabled:opacity-65"
              >
                <span className="text-sm font-semibold text-ink">{pending ? "Выполняю..." : scenario.title}</span>
                <span className="mt-1 block text-xs leading-5 text-graphite/60">{scenario.description}</span>
              </button>
            );
          })}
        </div>
      </div>
      {message ? <div className="mt-4 rounded-2xl border border-jade/20 bg-jade/10 px-4 py-3 text-sm font-semibold text-ink">{message}</div> : null}
    </section>
  );
}
