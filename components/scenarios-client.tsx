"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Scenario = {
  key: string;
  title: string;
  description: string;
  step: number;
  totalSteps: number;
};

export function ScenariosClient({ scenarios }: { scenarios: Scenario[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const run = async (scenario: Scenario) => {
    setRunningKey(scenario.key);
    setMessage(null);

    try {
      const response = await fetch(`/api/scenarios/${scenario.key}/next`, { method: "POST" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Сценарий не выполнился. Попробуйте еще раз.");
      }

      setMessage({
        type: "success",
        text: `Шаг сценария «${scenario.title}» выполнен. Данные, журнал событий и уведомления обновлены.`
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Не удалось выполнить сценарий."
      });
    } finally {
      setRunningKey(null);
    }
  };

  const isBusy = Boolean(runningKey) || isPending;

  return (
    <div className="grid gap-4">
      {message ? (
        <div
          className={`rounded-[1.25rem] border px-4 py-3 text-sm font-medium ${
            message.type === "success" ? "border-jade/25 bg-jade/10 text-moss" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {scenarios.map((scenario, index) => {
          const percent = Math.round((scenario.step / scenario.totalSteps) * 100);
          const isCurrentRunning = runningKey === scenario.key;

          return (
            <article key={scenario.key} className="card rounded-[1.75rem] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-lg font-semibold text-white">
                  {index + 1}
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">{scenario.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-graphite/68">{scenario.description}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-graphite/45">
                  <span>Шаг {scenario.step} из {scenario.totalSteps}</span>
                  <span>{percent}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-ink/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-jade to-brass transition-all" style={{ width: `${percent}%` }} />
                </div>
              </div>

              <button
                disabled={isBusy}
                onClick={() => run(scenario)}
                className="focus-ring mt-5 w-full rounded-2xl bg-jade px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-50"
              >
                {isCurrentRunning ? "Выполняю шаг..." : scenario.step >= scenario.totalSteps ? "Пройти заново" : "Следующий шаг"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
