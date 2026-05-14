"use client";

import { useMemo, useState } from "react";
import { useRole } from "@/components/role-provider";
import { can, disabledActionReason, type PermissionAction } from "@/lib/rbac";
import { SANDBOX_2FA_CODE } from "@/lib/security";

type ChecklistItem = {
  label: string;
  done: boolean;
  hint: string;
};

export function MerchantIntegrationPanel({
  merchantId,
  maskedApiKey,
  callbackUrl,
  activeRequisites,
  totalRequisites
}: {
  merchantId: string;
  maskedApiKey: string;
  callbackUrl: string;
  activeRequisites: number;
  totalRequisites: number;
}) {
  const { role } = useRole();
  const [currentMaskedApiKey, setCurrentMaskedApiKey] = useState(maskedApiKey);
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "show" | "copy" | "rotate">(null);
  const [reason, setReason] = useState("Плановая операция в sandbox demo");
  const [code, setCode] = useState("");
  const [webhookStatus, setWebhookStatus] = useState<"configured" | "success" | "error">(callbackUrl ? "configured" : "error");
  const [message, setMessage] = useState<string | null>(null);

  const checklist = useMemo<ChecklistItem[]>(
    () => [
      { label: "API key создан", done: Boolean(currentMaskedApiKey), hint: "Ключ скрыт по умолчанию. Просмотр, копирование и перевыпуск пишутся в журнал аудита." },
      { label: "Callback URL настроен", done: Boolean(callbackUrl), hint: "Платформа знает, куда отправлять webhook события." },
      { label: "Webhook проверен", done: webhookStatus === "success", hint: "Кнопка проверки создает sandbox webhook event и запись в audit log." },
      { label: "Метод выплат проверен", done: activeRequisites > 0, hint: "Есть активные реквизиты для движения денег." }
    ],
    [activeRequisites, callbackUrl, currentMaskedApiKey, webhookStatus]
  );

  async function postJson<T>(url: string, method: "POST" | "PATCH", body: Record<string, unknown>) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Не удалось выполнить demo-действие.");
    return payload;
  }

  async function copyToClipboard(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} скопирован. Действие записано в журнал аудита.`);
    } catch {
      setMessage(`Не удалось скопировать ${label}.`);
    }
  }

  async function runConfirmedAction() {
    try {
      if (dialog === "show") {
        const payload = await postJson<{ apiKey: string; maskedApiKey: string }>(`/api/merchants/${merchantId}/api-key/view`, "POST", { actorRole: role, confirmed: true });
        setRevealedApiKey(payload.apiKey);
        setCurrentMaskedApiKey(payload.maskedApiKey);
        setMessage("API key раскрыт только в текущем браузере. Просмотр записан в журнал аудита.");
      }

      if (dialog === "copy") {
        const payload = await postJson<{ apiKey: string; maskedApiKey: string }>(`/api/merchants/${merchantId}/api-key/copy`, "POST", { actorRole: role, confirmed: true });
        setCurrentMaskedApiKey(payload.maskedApiKey);
        await copyToClipboard(payload.apiKey, "API key");
      }

      if (dialog === "rotate") {
        const payload = await postJson<{ maskedApiKey: string }>(`/api/merchants/${merchantId}/api-key/rotate`, "PATCH", { actorRole: role, reason, code });
        setCurrentMaskedApiKey(payload.maskedApiKey);
        setRevealedApiKey(null);
        setCode("");
        setMessage("API key перевыпущен. Старый ключ считается недействительным в sandbox demo, событие записано в audit log.");
      }

      setDialog(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить demo-действие.");
    }
  }

  async function testWebhook() {
    try {
      const payload = await postJson<{ delivered: boolean; status: string }>(`/api/merchants/${merchantId}/webhook/test`, "POST", { actorRole: role });
      setWebhookStatus(payload.delivered ? "success" : "error");
      setMessage(payload.delivered ? "Webhook доставлен в sandbox. Событие записано в audit log." : "Webhook не доставлен: callback URL не настроен.");
    } catch (error) {
      setWebhookStatus("error");
      setMessage(error instanceof Error ? error.message : "Не удалось проверить webhook.");
    }
  }

  function actionTitle(action: "show" | "copy" | "rotate") {
    if (action === "show") return "Показать API key";
    if (action === "copy") return "Скопировать API key";
    return "Перевыпустить API key";
  }

  function actionDescription(action: "show" | "copy" | "rotate") {
    if (action === "rotate") return `Введите sandbox 2FA-код ${SANDBOX_2FA_CODE} и причину. Старый ключ перестанет работать в demo-модели.`;
    return "Подтвердите действие. Оно будет записано в журнал аудита как доступ к чувствительному demo-ключу.";
  }

  function guardedButton(action: "show" | "copy" | "rotate", permission: PermissionAction, label: string, primary = false) {
    const disabledReason = disabledActionReason(role, permission);

    return (
      <button
        type="button"
        disabled={Boolean(disabledReason)}
        title={disabledReason ?? undefined}
        onClick={() => setDialog(action)}
        className={`${primary ? "btn btn-primary" : "btn btn-secondary"} btn-sm focus-ring disabled:cursor-not-allowed disabled:opacity-45`}
      >
        {label}
      </button>
    );
  }

  return (
    <section className="section-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Интеграция</p>
          <h2 className="section-title mt-2 text-ink">API key и webhook</h2>
          <p className="copy mt-2">Это sandbox-зона подключения мерчанта: API key скрыт по умолчанию, webhook можно проверить тестовым событием, а чувствительные действия пишутся в audit log.</p>
        </div>
        {guardedButton("rotate", "apiKey:rotate", "Перевыпустить ключ", true)}
      </div>

      {message ? <div className="mt-4 rounded-2xl border border-jade/20 bg-jade/10 px-4 py-3 text-sm font-semibold text-ink">{message}</div> : null}

      <div className="mt-5 grid gap-3">
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite/45">API key</p>
              <p className="mt-1 truncate font-mono text-sm font-semibold text-ink">{revealedApiKey ?? currentMaskedApiKey}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {guardedButton("show", "apiKey:view", revealedApiKey ? "Скрыть / показать повторно" : "Показать")}
              {guardedButton("copy", "apiKey:copy", "Скопировать")}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite/45">Callback URL</p>
              <p className="mt-1 break-all font-mono text-sm font-semibold text-ink">{callbackUrl}</p>
            </div>
            <button type="button" onClick={() => copyToClipboard(callbackUrl, "Callback URL")} className="btn btn-secondary btn-sm focus-ring">
              Скопировать
            </button>
            <button type="button" disabled={!can(role, "webhook:test")} onClick={testWebhook} className="btn btn-primary btn-sm focus-ring disabled:cursor-not-allowed disabled:opacity-45">
              Проверить webhook
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

      {dialog ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={actionTitle(dialog)}>
          <div className="card w-full max-w-lg rounded-[var(--radius-xl)] p-5">
            <p className="eyebrow">Sandbox confirmation</p>
            <h3 className="section-title mt-2 text-ink">{actionTitle(dialog)}</h3>
            <p className="copy mt-2">{actionDescription(dialog)}</p>

            {dialog === "rotate" ? (
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm font-semibold text-ink">
                  Причина перевыпуска
                  <input value={reason} onChange={(event) => setReason(event.target.value)} className="field focus-ring font-normal" />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-ink">
                  Sandbox 2FA
                  <input value={code} onChange={(event) => setCode(event.target.value)} placeholder={SANDBOX_2FA_CODE} className="field focus-ring font-mono font-normal" />
                </label>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDialog(null)} className="btn btn-secondary focus-ring">
                Отмена
              </button>
              <button type="button" onClick={runConfirmedAction} className="btn btn-primary focus-ring">
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
