import { normalizeCurrency, SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currency";

export type MoneyTotals = Record<SupportedCurrency, number>;

export function formatMoney(value: number | string, currency: string = "RUB") {
  const amount = typeof value === "string" ? Number(value) : value;
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const normalizedCurrency = normalizeCurrency(currency);
  const fractionDigits = normalizedCurrency === "USD" ? 2 : 0;
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(safeAmount);

  return normalizedCurrency === "USD" ? `${formatted} USD` : `${formatted} ₽`;
}

export function formatNumber(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatRate(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "не задано";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toString" in value) {
    return Number(value.toString());
  }
  return 0;
}

export function emptyMoneyTotals(): MoneyTotals {
  return { RUB: 0, USD: 0 };
}

export function totalByCurrency<T>(
  items: T[],
  amountGetter: (item: T) => unknown,
  currencyGetter: (item: T) => unknown
): MoneyTotals {
  return items.reduce<MoneyTotals>((totals, item) => {
    const currency = normalizeCurrency(currencyGetter(item));
    totals[currency] += toNumber(amountGetter(item));
    return totals;
  }, emptyMoneyTotals());
}

export function sumMoneyTotals(...items: MoneyTotals[]): MoneyTotals {
  return items.reduce<MoneyTotals>((totals, item) => {
    SUPPORTED_CURRENCIES.forEach((currency) => {
      totals[currency] += item[currency];
    });
    return totals;
  }, emptyMoneyTotals());
}

export function formatMoneyBreakdown(totals: Partial<Record<SupportedCurrency, number>>) {
  const parts = SUPPORTED_CURRENCIES
    .filter((currency) => toNumber(totals[currency] ?? 0) !== 0)
    .map((currency) => `${currency}: ${formatMoney(totals[currency] ?? 0, currency)}`);

  return parts.length ? parts.join(" · ") : `RUB: ${formatMoney(0, "RUB")}`;
}
