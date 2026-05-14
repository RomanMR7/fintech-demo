export const SANDBOX_2FA_CODE = "000000";

export function maskSecret(value: string | null | undefined, visibleStart = 10, visibleEnd = 4) {
  const secret = String(value ?? "");
  if (!secret) return "ключ не задан";
  if (secret.length <= visibleStart + visibleEnd) return `${secret.slice(0, 3)}****`;

  return `${secret.slice(0, visibleStart)}****${secret.slice(-visibleEnd)}`;
}

export function assertSandbox2fa(code: unknown) {
  if (String(code ?? "").trim() !== SANDBOX_2FA_CODE) {
    throw new Error("Неверный sandbox 2FA-код. Для demo используйте 000000.");
  }
}

export function requireReason(value: unknown, fieldName = "reason") {
  const reason = String(value ?? "").trim();
  if (reason.length < 3) {
    throw new Error(`Укажите причину в поле ${fieldName}. Это нужно для журнала аудита.`);
  }

  return reason.slice(0, 500);
}
