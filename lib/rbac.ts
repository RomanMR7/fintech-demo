import { UserRole, type UserRoleValue } from "@/lib/constants";

export type PermissionAction =
  | "dashboard:view"
  | "merchant:create"
  | "merchant:manage"
  | "commission:change"
  | "trustLimit:change"
  | "balance:adjust"
  | "payout:create"
  | "payout:approve"
  | "payout:cancel"
  | "order:create"
  | "order:update"
  | "order:dispute"
  | "apiKey:view"
  | "apiKey:copy"
  | "apiKey:rotate"
  | "webhook:test"
  | "appeal:resolve"
  | "requisite:manage"
  | "data:export"
  | "audit:view";

type RoleLike = UserRoleValue | "VIEWER" | string;

const permissions: Record<string, PermissionAction[]> = {
  [UserRole.PLATFORM_ADMIN]: [
    "dashboard:view",
    "merchant:create",
    "merchant:manage",
    "commission:change",
    "trustLimit:change",
    "balance:adjust",
    "payout:create",
    "payout:approve",
    "payout:cancel",
    "order:create",
    "order:update",
    "order:dispute",
    "apiKey:view",
    "apiKey:copy",
    "apiKey:rotate",
    "webhook:test",
    "appeal:resolve",
    "requisite:manage",
    "data:export",
    "audit:view"
  ],
  [UserRole.FINANCE_MANAGER]: ["dashboard:view", "balance:adjust", "payout:approve", "payout:cancel", "data:export", "audit:view"],
  [UserRole.OPERATOR]: ["dashboard:view", "order:update", "order:dispute", "requisite:manage", "audit:view"],
  [UserRole.SUPPORT]: ["dashboard:view", "appeal:resolve", "order:dispute", "audit:view"],
  [UserRole.MERCHANT]: ["dashboard:view", "payout:create", "order:create", "apiKey:view", "apiKey:copy", "apiKey:rotate", "webhook:test", "data:export"],
  VIEWER: ["dashboard:view"]
};

export const permissionLabels: Record<PermissionAction, string> = {
  "dashboard:view": "Просмотр главной панели",
  "merchant:create": "Создание мерчантов",
  "merchant:manage": "Управление мерчантами",
  "commission:change": "Изменение комиссий",
  "trustLimit:change": "Изменение trust limit",
  "balance:adjust": "Ручная корректировка баланса",
  "payout:create": "Создание выплат",
  "payout:approve": "Подтверждение выплат",
  "payout:cancel": "Отмена выплат",
  "order:create": "Создание ордеров",
  "order:update": "Изменение статусов ордеров",
  "order:dispute": "Перевод операции в спор",
  "apiKey:view": "Просмотр API key",
  "apiKey:copy": "Копирование API key",
  "apiKey:rotate": "Перевыпуск API key",
  "webhook:test": "Тест webhook",
  "appeal:resolve": "Решение апелляций",
  "requisite:manage": "Управление реквизитами",
  "data:export": "Экспорт данных",
  "audit:view": "Просмотр журнала аудита"
};

export function can(role: RoleLike, action: PermissionAction) {
  return permissions[String(role)]?.includes(action) ?? false;
}

export function requirePermission(role: RoleLike, action: PermissionAction) {
  if (can(role, action)) return;
  throw new Error(`Недостаточно прав: ${permissionLabels[action]}.`);
}

export function disabledActionReason(role: RoleLike, action: PermissionAction) {
  return can(role, action) ? null : `Недостаточно прав для действия: ${permissionLabels[action]}.`;
}

export function getPermissionMatrix() {
  return Object.entries(permissions).map(([role, actions]) => ({ role, actions }));
}
