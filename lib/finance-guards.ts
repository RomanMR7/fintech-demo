import { Prisma } from "@prisma/client";
import { parseCurrency, type SupportedCurrency } from "@/lib/currency";

export function toDecimal(value: unknown, fieldName = "value") {
  let decimal: Prisma.Decimal;

  try {
    decimal = new Prisma.Decimal(value as Prisma.Decimal.Value);
  } catch {
    throw new Error(`Некорректная сумма в поле ${fieldName}.`);
  }

  if (!decimal.isFinite()) {
    throw new Error(`Некорректное число в поле ${fieldName}.`);
  }

  return decimal;
}

export function toMoneyDecimal(value: unknown, fieldName = "amount") {
  const decimal = toDecimal(value, fieldName);
  return decimal.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export function assertPositiveMoney(value: unknown, fieldName = "amount") {
  const amount = toMoneyDecimal(value, fieldName);
  if (amount.lessThanOrEqualTo(0)) {
    throw new Error(`Сумма в поле ${fieldName} должна быть больше нуля.`);
  }

  return amount;
}

export function assertNonNegativeMoney(value: unknown, fieldName = "amount") {
  const amount = toMoneyDecimal(value, fieldName);
  if (amount.lessThan(0)) {
    throw new Error(`Сумма в поле ${fieldName} не может быть отрицательной.`);
  }

  return amount;
}

export function assertDecimalRate(value: unknown, fieldName = "rate") {
  const rate = toDecimal(value, fieldName);
  if (rate.lessThan(0) || rate.greaterThan(1)) {
    throw new Error(`Ставка в поле ${fieldName} должна быть в диапазоне от 0 до 100%.`);
  }

  return rate;
}

export function assertPercentInput(value: unknown, fieldName = "percent") {
  const percent = toMoneyDecimal(value, fieldName);
  if (percent.lessThan(0) || percent.greaterThan(100)) {
    throw new Error(`Процент в поле ${fieldName} должен быть в диапазоне от 0 до 100.`);
  }

  return percent;
}

export function calculateCommission(amountInput: unknown, rateInput: unknown) {
  const amount = assertPositiveMoney(amountInput, "amount");
  const rate = assertDecimalRate(rateInput, "rate");

  return amount.mul(rate).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export function assertSufficientBalance(balanceInput: unknown, amountInput: unknown, accountLabel = "балансе") {
  const balance = assertNonNegativeMoney(balanceInput, "balance");
  const amount = assertPositiveMoney(amountInput, "amount");

  if (balance.lessThan(amount)) {
    throw new Error(`Недостаточно средств на ${accountLabel}. Доступно ${balance.toString()}, требуется ${amount.toString()}.`);
  }

  return { balance, amount };
}

export function assertSupportedCurrency(value: unknown, fieldName = "currency"): SupportedCurrency {
  return parseCurrency(value, fieldName);
}

export function assertSameCurrency(left: unknown, right: unknown) {
  const leftCurrency = assertSupportedCurrency(left, "leftCurrency");
  const rightCurrency = assertSupportedCurrency(right, "rightCurrency");
  if (leftCurrency !== rightCurrency) {
    throw new Error(`Нельзя смешивать валюты в одной финансовой операции: ${leftCurrency} и ${rightCurrency}.`);
  }

  return leftCurrency;
}

export function buildPayoutReservation(amountInput: unknown, payoutRateInput: unknown) {
  const amount = assertPositiveMoney(amountInput, "payoutAmount");
  const commission = calculateCommission(amount, payoutRateInput);

  return {
    amount,
    commission,
    total: amount.plus(commission).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
  };
}
