"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Scenario = {
  key: string;
  title: string;
  description: string;
  step: number;
  totalSteps: number;
};

const scenarioSteps: Record<string, string[]> = {
  "merchant-create-order": ["Мерчант создал ордер", "Платформа назначила реквизиты", "Оператор отметил оплату"],
  "assign-requisite": ["Создан ордер для назначения", "Подобран активный реквизит", "Лимиты реквизита обновлены"],
  "order-status-flow": ["Ожидает оплаты", "Оплачен", "Подтвержден", "Завершен", "Финальный статус зафиксирован"],
  "balance-after-success": ["Оплата получена", "Операция подтверждена", "Баланс начислен с учетом комиссии"],
  "merchant-create-payout": ["Мерчант создал выплату", "Сумма взята в холд", "Выплата передана финансисту"],
  "finance-approve-payout": ["Выплата найдена", "Проверка выполнена", "Выплата подтверждена"],
  "freeze-disputed": ["Подготовлена спорная операция", "Сумма заморожена", "Спор передан support-команде"],
  "create-appeal": ["Операция переведена в спор", "Апелляция создана", "Апелляция готова к разбору"],
  "support-review-appeal": ["Support взял обращение", "Запрошена сверка", "Получен предварительный ответ"],
  "appeal-resolution-balance": ["Апелляция открыта", "Решение подготовлено", "Баланс обновлен после решения"]
};

function getSteps(scenario: Scenario) {
  return scenarioSteps[scenario.key] ?? Array.from({ length: scenario.totalSteps }, (_, index) => `Шаг ${index + 1}`);
}

function getScenarioStatus(scenario: Scenario) {
  if (scenario.step <= 0) return { label: "Не начат", className: "bg-ink/8 text-graphite/60" };
  if (scenario.step >= scenario.totalSteps) return { label: "Завершено", className: "bg-jade/12 text-moss" };
  return { label: "В процессе", className: "bg-brass/15 text-brass" };
}

export function ScenariosClient({ scenarios }: { scenarios: Scenario[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(scenarios);
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setItems(scenarios);
  }, [scenarios]);

  const run = async (scenario: Scenario) => {
    setRunningKey(scenario.key);
    setMessage(null);

    try {
      const response = await fetch(`/api/scenarios/${scenario.key}/next`, { method: "POST" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Сценарий не выполнился. Попробуйте еще раз.");
      }

      const updatedScenario = { ...scenario, ...payload } as Scenario;
      const steps = getSteps(updatedScenario);
      const completedStep = steps[Math.max(updatedScenario.step - 1, 0)] ?? `Шаг ${updatedScenario.step}`;
      const nextStep = steps[updatedScenario.step];

      setItems((current) => current.map((item) => (item.key === scenario.key ? updatedScenario : item)));
      setMessage({
        type: "success",
        text:
          updatedScenario.step >= updatedScenario.totalSteps
            ? `Сценарий «${scenario.title}» завершен. Последнее действие: ${completedStep}.`
            : `Выполнено: ${completedStep}. Следующее действие: ${nextStep}.`
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
        {items.map((scenario, index) => {
          const steps = getSteps(scenario);
          const safeStep = Math.min(Math.max(scenario.step, 0), scenario.totalSteps);
          const percent = Math.round((safeStep / scenario.totalSteps) * 100);
          const isCurrentRunning = runningKey === scenario.key;
          const status = getScenarioStatus(scenario);
          const completedText = safeStep > 0 ? steps[safeStep - 1] : "Пока нет выполненных действий";
          const nextText = safeStep >= scenario.totalSteps ? "Можно пройти сценарий заново" : steps[safeStep];

          return (
            <article key={scenario.key} className="card rounded-[1.75rem] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-lg font-semibold text-white">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-semibold">{scenario.title}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-graphite/68">{scenario.description}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-ink/8 bg-white/55 p-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-graphite/50">
                  <span>Выполнено {safeStep} из {scenario.totalSteps}</span>
                  <span>{percent}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-3 rounded-full bg-gradient-to-r from-jade via-moss to-brass transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>

                <div className="mt-4 grid gap-2">
                  {steps.map((step, stepIndex) => {
                    const isDone = stepIndex < safeStep;
                    const isNext = stepIndex === safeStep && safeStep < scenario.totalSteps;

                    return (
                      <div key={step} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${isDone ? "bg-jade/10 text-moss" : isNext ? "bg-brass/12 text-ink" : "bg-ink/[0.03] text-graphite/55"}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDone ? "bg-jade text-white" : isNext ? "bg-brass text-ink" : "bg-ink/10 text-graphite/50"}`}>
                          {isDone ? "✓" : stepIndex + 1}
                        </span>
                        <span className="font-medium">{step}</span>
                        {isNext ? <span className="ml-auto rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brass">следующий</span> : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 grid gap-2 rounded-2xl bg-ink/[0.04] p-4 text-sm">
                <p><span className="font-semibold">Последнее выполненное:</span> {completedText}</p>
                <p><span className="font-semibold">Следующее действие:</span> {nextText}</p>
              </div>

              <button
                disabled={isBusy}
                onClick={() => run(scenario)}
                className="focus-ring mt-5 w-full rounded-2xl bg-jade px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-50"
              >
                {isCurrentRunning ? "Выполняю шаг..." : scenario.step >= scenario.totalSteps ? "Пройти сценарий заново" : `Выполнить шаг ${safeStep + 1}`}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
