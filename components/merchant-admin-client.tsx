"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useRole } from "@/components/role-provider";
import { can, disabledActionReason } from "@/lib/rbac";

type MerchantOption = {
  id: string;
  displayName: string;
  name: string;
};

export function MerchantAdminClient({ merchants }: { merchants: MerchantOption[] }) {
  const router = useRouter();
  const { role, setMerchantContext } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const createDisabledReason = disabledActionReason(role, "merchant:create");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const displayName = String(formData.get("displayName") ?? "").trim();
    const legalName = String(formData.get("legalName") ?? "").trim();
    const confirmed = window.confirm(
      `Подтвердите создание sandbox-мерчанта:\n\nПубличное название: ${displayName}\nЮридическое название: ${legalName || `ООО ${displayName}`}\nСтартовый баланс: ${formData.get("initialBalance")} ${formData.get("initialCurrency")}\nTrust limit: ${formData.get("trustLimit")} RUB\n\nДействие будет записано в audit log.`
    );

    if (!confirmed) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorRole: role,
          displayName: formData.get("displayName"),
          legalName: formData.get("legalName"),
          reason: formData.get("reason"),
          trustLimit: formData.get("trustLimit"),
          initialBalance: formData.get("initialBalance"),
          initialCurrency: formData.get("initialCurrency"),
          payinFeeRatePercent: formData.get("payinFeeRate"),
          payoutFeeRatePercent: formData.get("payoutFeeRate")
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Не удалось создать мерчанта.");

      form.reset();
      setMessage({ type: "success", text: `Мерчант “${payload.displayName}” создан. Балансы, demo-user, событие и уведомление добавлены.` });
      if (typeof payload.id === "string") {
        setMerchantContext({ id: payload.id, name: typeof payload.displayName === "string" ? payload.displayName : displayName });
      }
      window.dispatchEvent(
        new CustomEvent("demo-merchants-updated", {
          detail: {
            merchant: {
              id: typeof payload.id === "string" ? payload.id : undefined,
              displayName: typeof payload.displayName === "string" ? payload.displayName : displayName
            }
          }
        })
      );
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Не удалось создать мерчанта." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Merchant onboarding</p>
          <h2 className="section-title mt-2 text-ink">Добавить мерчанта</h2>
          <p className="copy mt-2">
            Например: “Орбита”, “Nova Games”, “Sigma Travel”. После создания появятся баланс, demo-user, событие и уведомление.
          </p>
        </div>
        <span className="rounded-full bg-ink/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-graphite/55">Сейчас: {merchants.length}</span>
      </div>

      {message ? (
        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-jade/25 bg-jade/10 text-moss" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Название в интерфейсе
          <input name="displayName" required placeholder="Орбита" className="field focus-ring font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Юридическое название
          <input name="legalName" placeholder="ООО Орбита Маркет" className="field focus-ring font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Причина создания
          <input name="reason" required placeholder="Подключение нового sandbox-мерчанта для демо-показа" className="field focus-ring font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Стартовый доступный баланс
          <input name="initialBalance" type="number" min="0" step="1000" defaultValue="250000" className="field focus-ring font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Валюта стартового баланса
          <select name="initialCurrency" defaultValue="RUB" className="field focus-ring font-normal">
            <option value="RUB">RUB — рубли</option>
            <option value="USD">USD — доллары</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Trust limit, базовая валюта RUB
          <input name="trustLimit" type="number" min="0" step="1000" defaultValue="1000000" className="field focus-ring font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Комиссия приема, %
          <input name="payinFeeRate" type="number" min="0" step="0.1" defaultValue="2.5" className="field focus-ring font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Комиссия выплат, %
          <input name="payoutFeeRate" type="number" min="0" step="0.1" defaultValue="1.5" className="field focus-ring font-normal" />
        </label>
        {!can(role, "merchant:create") ? (
          <div className="rounded-2xl border border-brass/25 bg-brass/10 px-4 py-3 text-sm font-semibold text-brass md:col-span-2 xl:col-span-3">
            {createDisabledReason}
          </div>
        ) : null}
        <button disabled={isSubmitting || Boolean(createDisabledReason)} title={createDisabledReason ?? undefined} className="btn btn-primary focus-ring disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2 xl:col-span-3">
          {isSubmitting ? "Создаю мерчанта..." : "Создать мерчанта"}
        </button>
      </form>
    </section>
  );
}
