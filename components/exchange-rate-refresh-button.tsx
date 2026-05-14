"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export function ExchangeRateRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [manualRate, setManualRate] = useState("");

  const refresh = () => {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/exchange-rates/refresh", { method: "POST" });
      const payload = await response.json().catch(() => ({}));

      if (payload.error) {
        setMessage(`Не удалось получить новый курс: ${payload.error}. Показываю последний сохраненный курс.`);
      } else if (!response.ok) {
        setMessage("Курс не обновился. Проверьте интернет или повторите позже.");
      } else {
        setMessage("Курс обновлен. Дашборд и экономика теперь считают рублевый эквивалент по свежей записи.");
      }

      router.refresh();
    });
  };

  const saveManual = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/exchange-rates/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rate: manualRate,
          note: "Ручной курс для презентационного демо."
        })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(payload.error ?? "Не удалось сохранить ручной курс.");
        return;
      }

      setManualRate("");
      setMessage("Ручной курс сохранен. Все рублевые эквиваленты пересчитаются после обновления страницы.");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={refresh}
        className="focus-ring rounded-2xl bg-jade px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-50"
      >
        {isPending ? "Обновляю курс..." : "Обновить курс ЦБ РФ"}
      </button>
      <form onSubmit={saveManual} className="grid gap-2 rounded-2xl border border-ink/10 bg-white/65 p-3">
        <label className="grid gap-1 text-sm font-semibold">
          Задать курс вручную, если внешний источник недоступен
          <input
            value={manualRate}
            onChange={(event) => setManualRate(event.target.value)}
            inputMode="decimal"
            placeholder="Например, 91.25"
            className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade"
          />
        </label>
        <button
          type="submit"
          disabled={isPending || !manualRate.trim()}
          className="focus-ring rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-50"
        >
          Сохранить ручной курс
        </button>
      </form>
      {message ? <p className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium text-graphite/75">{message}</p> : null}
    </div>
  );
}
