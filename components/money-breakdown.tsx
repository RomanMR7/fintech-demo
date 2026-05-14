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
    <div className="grid gap-1.5 text-left">
      {visibleRows.map((currency) => (
        <div key={currency} className="flex items-baseline justify-between gap-3 rounded-2xl bg-ink/[0.04] px-3 py-2 shadow-insetSoft">
          <span className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-graphite/45">{currency}</span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">{formatMoney(totals[currency] ?? 0, currency)}</span>
        </div>
      ))}
    </div>
  );
}
