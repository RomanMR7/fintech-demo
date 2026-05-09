export const orderStatusMeta = {
  CREATED: { label: "Создан", tone: "slate", description: "Ордер зарегистрирован, реквизиты еще могут назначаться." },
  WAITING_PAYMENT: { label: "Ожидает оплаты", tone: "amber", description: "Плательщик получил реквизиты и должен провести оплату." },
  PAID: { label: "Оплачен", tone: "blue", description: "Поступил сигнал об оплате, нужна проверка." },
  CONFIRMED: { label: "Подтвержден", tone: "teal", description: "Операция сверена оператором или провайдером." },
  COMPLETED: { label: "Завершен", tone: "green", description: "Баланс мерчанта обновлен, операция закрыта." },
  CANCELED: { label: "Отменен", tone: "neutral", description: "Операция отменена без начисления." },
  FAILED: { label: "Ошибка", tone: "red", description: "Операция завершилась ошибкой." },
  DISPUTED: { label: "Спор", tone: "red", description: "Операция передана в апелляцию или ручную проверку." }
} as const;

export const payoutStatusMeta = {
  CREATED: { label: "Создана", tone: "slate" },
  PENDING_APPROVAL: { label: "Ждет подтверждения", tone: "amber" },
  HOLD: { label: "В холде", tone: "blue" },
  COMPLETED: { label: "Выплачена", tone: "green" },
  CANCELED: { label: "Отменена", tone: "neutral" },
  DISPUTED: { label: "Спор", tone: "red" }
} as const;

export const appealStatusMeta = {
  NEW: { label: "Новая", tone: "amber" },
  OPEN: { label: "В работе", tone: "blue" },
  RESOLVED_MERCHANT: { label: "В пользу мерчанта", tone: "green" },
  RESOLVED_PLATFORM: { label: "В пользу платформы", tone: "teal" },
  REJECTED: { label: "Отклонена", tone: "red" },
  CLOSED: { label: "Закрыта", tone: "neutral" }
} as const;

export const providerStatusMeta = {
  ACTIVE: { label: "Активен", tone: "green" },
  DEGRADED: { label: "Деградация", tone: "amber" },
  MAINTENANCE: { label: "Техработы", tone: "blue" },
  DISABLED: { label: "Отключен", tone: "neutral" }
} as const;

export const requisiteStatusMeta = {
  ACTIVE: { label: "Активен", tone: "green" },
  LIMITED: { label: "Лимит", tone: "amber" },
  PAUSED: { label: "Пауза", tone: "blue" },
  BLOCKED: { label: "Блок", tone: "red" }
} as const;

export function statusLabel<T extends string>(
  status: T,
  map: Record<string, { label: string }>
) {
  return map[status]?.label ?? status;
}
