import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currency";
import { formatMoney, toNumber } from "@/lib/format";

export function MoneyBreakdown({
  totals,
  showZero = false
}: {
  totals: Partial<Record<SupportedCurrency, number>>;
  showZero?: boolean;
}) {
  const rows = SUPPORTED_CURRENCIES.filter((currency) => showZero || toNumber(totals[currency] ?? 0) !== 0);
  const visibleRows = rows.length ? rows : ["RUB" as SupportedCurrency];

  return (
    <div className="money-stack text-left">
      {visibleRows.map((currency) => (
        <div key={currency} className="money-row">
          <span className="money-code">{currency}</span>
          <span className="amount-sm text-ink">{formatMoney(totals[currency] ?? 0, currency)}</span>
        </div>
      ))}
    </div>
  );
}
