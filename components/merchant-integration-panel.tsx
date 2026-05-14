"use client";

import { useMemo, useState } from "react";

type ChecklistItem = {
  label: string;
  done: boolean;
  hint: string;
};

export function MerchantIntegrationPanel({
  apiKey,
  callbackUrl,
  activeRequisites,
  totalRequisites
}: {
  apiKey: string;
  callbackUrl: string;
  activeRequisites: number;
  totalRequisites: number;
}) {
  const [currentApiKey, setCurrentApiKey] = useState(apiKey);
  const [message, setMessage] = useState<string | null>(null);

  const checklist = useMemo<ChecklistItem[]>(
    () => [
      { label: "API key создан", done: Boolean(currentApiKey), hint: "Мерчант может создавать ордера через API." },
      { label: "Callback URL настроен", done: Boolean(callbackUrl), hint: "Платформа знает, куда отправлять webhook события." },
      { label: "Webhook test passed", done: true, hint: "В demo-режиме считаем тестовый webhook успешным." },
      { label: "Payout method verified", done: activeRequisites > 0, hint: "Есть активные реквизиты для движения денег." }
    ],
    [activeRequisites, callbackUrl, currentApiKey]
  );

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} скопирован.`);
    } catch {
      setMessage(`Не удалось скопировать ${label}.`);
    }
  }

  function rotateKey() {
    const nextKey = `pk_demo_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    setCurrentApiKey(nextKey);
    setMessage("API key обновлен в demo-режиме. В реальном продукте старый ключ переводился бы в grace period.");
  }

  return (
    <section className="section-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Integration</p>
          <h2 className="section-title mt-2 text-ink">API key и webhook</h2>
          <p className="copy mt-2">Это зона подключения мерчанта: ключ API, callback URL, статус webhook и чеклист готовности к боевому трафику.</p>
        </div>
        <button type="button" onClick={rotateKey} className="btn btn-primary focus-ring">
          Rotate key
        </button>
      </div>

      {message ? <div className="mt-4 rounded-2xl border border-jade/20 bg-jade/10 px-4 py-3 text-sm font-semibold text-ink">{message}</div> : null}

      <div className="mt-5 grid gap-3">
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite/45">API key</p>
              <p className="mt-1 truncate font-mono text-sm font-semibold text-ink">{currentApiKey}</p>
            </div>
            <button type="button" onClick={() => copy(currentApiKey, "API key")} className="btn btn-secondary btn-sm focus-ring">
              Copy
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite/45">Callback URL</p>
              <p className="mt-1 break-all font-mono text-sm font-semibold text-ink">{callbackUrl}</p>
            </div>
            <button type="button" onClick={() => copy(callbackUrl, "Callback URL")} className="btn btn-secondary btn-sm focus-ring">
              Copy
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {checklist.map((item) => (
          <div key={item.label} className="rounded-2xl border border-ink/10 bg-white/55 p-4">
            <div className="flex items-center gap-3">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${item.done ? "bg-jade text-white" : "bg-brass/15 text-brass"}`}>{item.done ? "✓" : "!"}</span>
              <p className="font-semibold text-ink">{item.label}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-graphite/62">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-ink/10 bg-white/55 p-4 text-sm text-graphite/68">
        Активные реквизиты: <span className="font-semibold text-ink">{activeRequisites}</span> из <span className="font-semibold text-ink">{totalRequisites}</span>. Если активных реквизитов нет, ордера могут зависать на назначении платежных деталей.
      </div>
    </section>
  );
}
