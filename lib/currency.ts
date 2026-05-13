export const SUPPORTED_CURRENCIES = ["RUB", "USD"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const currencyLabels: Record<SupportedCurrency, string> = {
  RUB: "Рубли",
  USD: "Доллары"
};

export const currencyShortLabels: Record<SupportedCurrency, string> = {
  RUB: "RUB",
  USD: "USD"
};

export function normalizeCurrency(value: unknown): SupportedCurrency {
  return String(value ?? "RUB").toUpperCase() === "USD" ? "USD" : "RUB";
}

export function demoAmountForCurrency(currency: SupportedCurrency) {
  if (currency === "USD") return 900 + Math.floor(Math.random() * 2200);
  return 70000 + Math.floor(Math.random() * 90000);
}
