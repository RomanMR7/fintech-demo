export const UserRole = {
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  MERCHANT: "MERCHANT",
  OPERATOR: "OPERATOR",
  FINANCE_MANAGER: "FINANCE_MANAGER",
  SUPPORT: "SUPPORT",
  VIEWER: "VIEWER"
} as const;

export const OrderStatus = {
  CREATED: "CREATED",
  WAITING_PAYMENT: "WAITING_PAYMENT",
  PAID: "PAID",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
  FAILED: "FAILED",
  DISPUTED: "DISPUTED"
} as const;

export const PayoutStatus = {
  CREATED: "CREATED",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  HOLD: "HOLD",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
  DISPUTED: "DISPUTED"
} as const;

export const AppealStatus = {
  NEW: "NEW",
  OPEN: "OPEN",
  RESOLVED_MERCHANT: "RESOLVED_MERCHANT",
  RESOLVED_PLATFORM: "RESOLVED_PLATFORM",
  REJECTED: "REJECTED",
  CLOSED: "CLOSED"
} as const;

export const RequisiteStatus = {
  ACTIVE: "ACTIVE",
  LIMITED: "LIMITED",
  PAUSED: "PAUSED",
  BLOCKED: "BLOCKED"
} as const;

export const ProviderStatus = {
  ACTIVE: "ACTIVE",
  DEGRADED: "DEGRADED",
  MAINTENANCE: "MAINTENANCE",
  DISABLED: "DISABLED"
} as const;

export const BalanceType = {
  AVAILABLE: "AVAILABLE",
  FROZEN: "FROZEN",
  FEES: "FEES"
} as const;

export const BalanceDirection = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
  FREEZE: "FREEZE",
  UNFREEZE: "UNFREEZE"
} as const;

export const EventType = {
  ORDER_CREATED: "ORDER_CREATED",
  STATUS_CHANGED: "STATUS_CHANGED",
  PAYOUT_CREATED: "PAYOUT_CREATED",
  BALANCE_FROZEN: "BALANCE_FROZEN",
  BALANCE_CHANGED: "BALANCE_CHANGED",
  APPEAL_CREATED: "APPEAL_CREATED",
  APPEAL_RESOLVED: "APPEAL_RESOLVED",
  REQUISITE_CHANGED: "REQUISITE_CHANGED",
  NOTIFICATION_CREATED: "NOTIFICATION_CREATED",
  SCENARIO_STEP: "SCENARIO_STEP",
  MERCHANT_CREATED: "MERCHANT_CREATED",
  API_KEY_VIEWED: "API_KEY_VIEWED",
  API_KEY_COPIED: "API_KEY_COPIED",
  API_KEY_ROTATED: "API_KEY_ROTATED",
  WEBHOOK_TESTED: "WEBHOOK_TESTED",
  PAYOUT_CONFIRMED: "PAYOUT_CONFIRMED",
  PAYOUT_CANCELLED: "PAYOUT_CANCELLED",
  BALANCE_ADJUSTED: "BALANCE_ADJUSTED"
} as const;

export const NotificationType = {
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
  ACTION_REQUIRED: "ACTION_REQUIRED"
} as const;

export const CommissionType = {
  PAYIN: "PAYIN",
  PAYOUT: "PAYOUT",
  DISPUTE: "DISPUTE",
  PLATFORM: "PLATFORM"
} as const;

export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];
export type OrderStatusValue = (typeof OrderStatus)[keyof typeof OrderStatus];
export type PayoutStatusValue = (typeof PayoutStatus)[keyof typeof PayoutStatus];
export type AppealStatusValue = (typeof AppealStatus)[keyof typeof AppealStatus];
export type RequisiteStatusValue = (typeof RequisiteStatus)[keyof typeof RequisiteStatus];
export type ProviderStatusValue = (typeof ProviderStatus)[keyof typeof ProviderStatus];
export type BalanceTypeValue = (typeof BalanceType)[keyof typeof BalanceType];
export type BalanceDirectionValue = (typeof BalanceDirection)[keyof typeof BalanceDirection];
export type EventTypeValue = (typeof EventType)[keyof typeof EventType];
export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];
export type CommissionTypeValue = (typeof CommissionType)[keyof typeof CommissionType];
