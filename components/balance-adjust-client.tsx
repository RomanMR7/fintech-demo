"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useRole } from "@/components/role-provider";
import { can, disabledActionReason } from "@/lib/rbac";
import { SANDBOX_2FA_CODE } from "@/lib/security";

type MerchantOption = {
  id: string;
  displayName: string;
};

const operations = [
  { value: "credit_available", label: "Пополнить доступный баланс" },
  { value: "debit_available", label: "Списать с доступного баланса" },
  { value: "freeze", label: "Заморозить из доступного" },
  { value: "unfreeze", label: "Разморозить в доступный" },
  { value: "credit_fees", label: "Начислить комиссии" },
  { value: "debit_fees", label: "Списать комиссии" }
];

export function BalanceAdjustClient({ merchants }: { merchants: MerchantOption[] }) {
  const router = useRouter();
  const { role } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const disabledReason = disabledActionReason(role, "balance:adjust");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const amount = Number(formData.get("amount") ?? 0);
    const currency = String(formData.get("currency") ?? "RUB");

    if (!can(role, "balance:adjust")) {
      setMessage({ type: "error", text: disabledReason ?? "Недостаточно прав для корректировки баланса." });
      setIsSubmitting(false);
      return;
    }

    const confirmed = window.confirm("Подтвердите sandbox-корректировку баланса. Действие создаст ledger entry и запись в audit log.");
    if (!confirmed) {
      setIsSubmitting(false);
      return;
    }

    const code = (currency === "USD" ? amount >= 1000 : amount >= 100000) ? window.prompt(`Крупная корректировка требует sandbox 2FA. Введите ${SANDBOX_2FA_CODE}.`) : "";

    try {
      const response = await fetch("/api/balances/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorRole: role,
          merchantId: formData.get("merchantId"),
          operation: formData.get("operation"),
          amount,
          currency,
          description: formData.get("description"),
          code
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Не удалось изменить баланс.");

      form.reset();
      setMessage({ type: "success", text: "Баланс обновлен. Изменение добавлено в историю, журнал событий и уведомления." });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось изменить баланс." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card rounded-[1.75rem] p-5">
      <h2 className="font-display text-2xl font-semibold">Ручная корректировка</h2>
      <p className="mt-1 text-sm text-graphite/60">Для демо можно вручную пополнять, списывать, замораживать и размораживать средства мерчанта.</p>

      {message ? (
        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-jade/25 bg-jade/10 text-moss" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Мерчант
          <select name="merchantId" required className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade">
            {merchants.map((merchant) => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Операция
          <select name="operation" required className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade">
            {operations.map((operation) => (
              <option key={operation.value} value={operation.value}>
                {operation.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Валюта
          <select name="currency" required className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade">
            <option value="RUB">RUB — рубли</option>
            <option value="USD">USD — доллары</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Сумма
          <input name="amount" type="number" min="1" step="100" required placeholder="100000" className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Причина
          <input name="description" required placeholder="Корректировка для демо-показа" className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade" />
        </label>
        {!can(role, "balance:adjust") ? <div className="rounded-2xl border border-brass/25 bg-brass/10 px-4 py-3 text-sm font-semibold text-brass md:col-span-2">{disabledReason}</div> : null}
        <button disabled={isSubmitting || merchants.length === 0 || Boolean(disabledReason)} title={disabledReason ?? undefined} className="focus-ring rounded-2xl bg-jade px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2">
          {isSubmitting ? "Обновляю баланс..." : "Применить корректировку"}
        </button>
      </form>
    </div>
  );
}
