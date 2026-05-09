"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

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

  const run = (key: string) => {
    startTransition(async () => {
      await fetch(`/api/scenarios/${key}/next`, { method: "POST" });
      router.refresh();
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {scenarios.map((scenario, index) => {
        const percent = Math.round((scenario.step / scenario.totalSteps) * 100);
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
              disabled={isPending}
              onClick={() => run(scenario.key)}
              className="focus-ring mt-5 w-full rounded-2xl bg-jade px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-50"
            >
              {scenario.step >= scenario.totalSteps ? "Пройти заново" : "Следующий шаг"}
            </button>
          </article>
        );
      })}
    </div>
  );
}
