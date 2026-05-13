"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type MerchantOption = {
  id: string;
  displayName: string;
  name: string;
};

export function MerchantAdminClient({ merchants }: { merchants: MerchantOption[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.get("displayName"),
          legalName: formData.get("legalName"),
          trustLimit: formData.get("trustLimit"),
          initialBalance: formData.get("initialBalance"),
          initialCurrency: formData.get("initialCurrency"),
          payinFeeRate: Number(formData.get("payinFeeRate") || 2.5) / 100,
          payoutFeeRate: Number(formData.get("payoutFeeRate") || 1.5) / 100
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Не удалось создать мерчанта.");

      form.reset();
      setMessage({ type: "success", text: `Мерчант «${payload.displayName}» создан. Балансы, demo-user, событие и уведомление добавлены.` });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось создать мерчанта." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card rounded-[1.75rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Добавить мерчанта</h2>
          <p className="mt-1 text-sm text-graphite/60">Например: «Орбита», «Nova Games», «Sigma Travel». После создания появятся балансы и пользователь-мерчант.</p>
        </div>
        <span className="rounded-full bg-ink/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-graphite/55">
          Сейчас: {merchants.length}
        </span>
      </div>

      {message ? (
        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-jade/25 bg-jade/10 text-moss" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Название в интерфейсе
          <input name="displayName" required placeholder="Орбита" className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Юридическое название
          <input name="legalName" placeholder="ООО Орбита Маркет" className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Стартовый доступный баланс
          <input name="initialBalance" type="number" min="0" step="1000" defaultValue="250000" className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Валюта стартового баланса
          <select name="initialCurrency" defaultValue="RUB" className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade">
            <option value="RUB">RUB — рубли</option>
            <option value="USD">USD — доллары</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Trust limit, базовая валюта RUB
          <input name="trustLimit" type="number" min="0" step="1000" defaultValue="1000000" className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Комиссия приема, %
          <input name="payinFeeRate" type="number" min="0" step="0.1" defaultValue="2.5" className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Комиссия выплат, %
          <input name="payoutFeeRate" type="number" min="0" step="0.1" defaultValue="1.5" className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade" />
        </label>
        <button disabled={isSubmitting} className="focus-ring rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-50 md:col-span-2">
          {isSubmitting ? "Создаю мерчанта..." : "Создать мерчанта"}
        </button>
      </form>
    </div>
  );
}
