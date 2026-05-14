import { OrderStatus, PayoutStatus, type OrderStatusValue, type PayoutStatusValue } from "./constants";

export const orderTransitions: Record<OrderStatusValue, OrderStatusValue[]> = {
  [OrderStatus.CREATED]: [OrderStatus.WAITING_PAYMENT, OrderStatus.CANCELED, OrderStatus.FAILED],
  [OrderStatus.WAITING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELED, OrderStatus.FAILED, OrderStatus.DISPUTED],
  [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.DISPUTED, OrderStatus.CANCELED],
  [OrderStatus.CONFIRMED]: [OrderStatus.COMPLETED, OrderStatus.DISPUTED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELED]: [],
  [OrderStatus.FAILED]: [],
  [OrderStatus.DISPUTED]: []
};

export const payoutTransitions: Record<PayoutStatusValue, PayoutStatusValue[]> = {
  [PayoutStatus.CREATED]: [PayoutStatus.PENDING_APPROVAL, PayoutStatus.HOLD, PayoutStatus.CANCELED],
  [PayoutStatus.PENDING_APPROVAL]: [PayoutStatus.HOLD, PayoutStatus.COMPLETED, PayoutStatus.CANCELED, PayoutStatus.DISPUTED],
  [PayoutStatus.HOLD]: [PayoutStatus.COMPLETED, PayoutStatus.CANCELED, PayoutStatus.DISPUTED],
  [PayoutStatus.COMPLETED]: [],
  [PayoutStatus.CANCELED]: [],
  [PayoutStatus.DISPUTED]: [PayoutStatus.COMPLETED, PayoutStatus.CANCELED]
};

export function canChangeOrderStatus(from: string, to: string) {
  if (from === to) return true;
  return (orderTransitions[from as OrderStatusValue] ?? []).includes(to as OrderStatusValue);
}

export function assertOrderTransition(from: string, to: string) {
  if (canChangeOrderStatus(from, to)) return;
  throw new Error(`Нельзя перевести ордер из ${from} в ${to}. Сначала выполните предыдущий шаг жизненного цикла.`);
}

export function canChangePayoutStatus(from: string, to: string) {
  if (from === to) return true;
  return (payoutTransitions[from as PayoutStatusValue] ?? []).includes(to as PayoutStatusValue);
}

export function assertPayoutTransition(from: string, to: string) {
  if (canChangePayoutStatus(from, to)) return;
  throw new Error(`Нельзя перевести выплату из ${from} в ${to}. Выплата должна идти по строгому жизненному циклу.`);
}
