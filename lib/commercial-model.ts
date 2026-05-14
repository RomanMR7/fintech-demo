export const COMMERCIAL_LIMITS = {
  acquiringVolume: { min: 0, max: 1_000_000_000_000 },
  percent: { min: 0, max: 100 },
  feeWarningPercent: 10
} as const;

export type CommercialModelInput = {
  acquiringVolume: unknown;
  acquiringFeePercent: unknown;
  payoutSharePercent: unknown;
  payoutFeePercent: unknown;
  lossReductionPercent: unknown;
  providerFeePercent: unknown;
  operationalCostPercent: unknown;
  riskLossPercent: unknown;
};

export type CommercialModel = {
  acquiringVolume: number;
  acquiringFeePercent: number;
  payoutSharePercent: number;
  payoutFeePercent: number;
  lossReductionPercent: number;
  providerFeePercent: number;
  operationalCostPercent: number;
  riskLossPercent: number;
  payoutVolume: number;
  acquiringFeeRevenue: number;
  payoutFeeRevenue: number;
  lossReductionEffect: number;
  grossRevenue: number;
  providerCost: number;
  operationalCost: number;
  riskLoss: number;
  totalCosts: number;
  netMarginMonthly: number;
  netMarginYearly: number;
  grossRevenueYearly: number;
  takeRateAfterCosts: number;
  grossTakeRate: number;
  providerCostRate: number;
  operationalCostRate: number;
  riskLossRate: number;
  netMarginRate: number;
  breakEvenStatus: boolean;
  warnings: string[];
};

export function safeNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = parseNumericInput(value);
    return parsed === null ? fallback : parsed;
  }
  if (value && typeof value === "object" && "toString" in value) {
    const parsed = parseNumericInput(value.toString());
    return parsed === null ? fallback : parsed;
  }
  return fallback;
}

export function clampNumber(value: unknown, min: number, max: number) {
  const parsed = safeNumber(value, min);
  return Math.min(Math.max(parsed, min), max);
}

export function parseNumericInput(rawValue: string) {
  let normalized = rawValue
    .trim()
    .replace(/\s+/g, "")
    .replace(/[%₽$]/g, "")
    .replace(/RUB|USD/gi, "");

  if (!normalized) return null;

  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    const lastComma = normalized.lastIndexOf(",");
    const lastDot = normalized.lastIndexOf(".");
    normalized = lastComma > lastDot ? normalized.replace(/\./g, "").replace(",", ".") : normalized.replace(/,/g, "");
  } else if (hasComma) {
    const commaParts = normalized.split(",");
    const decimalPart = commaParts.at(-1) ?? "";
    normalized = commaParts.length > 2 || decimalPart.length === 3 ? normalized.replace(/,/g, "") : normalized.replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampPercent(value: unknown) {
  return clampNumber(value, COMMERCIAL_LIMITS.percent.min, COMMERCIAL_LIMITS.percent.max);
}

function safeRate(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return 0;
  return roundNumber((numerator / denominator) * 100, 6);
}

function roundNumber(value: number, fractionDigits = 2) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** fractionDigits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function cleanMoney(value: number) {
  return roundNumber(value, 2);
}

export function calculateCommercialModel(input: CommercialModelInput): CommercialModel {
  const acquiringVolume = clampNumber(input.acquiringVolume, COMMERCIAL_LIMITS.acquiringVolume.min, COMMERCIAL_LIMITS.acquiringVolume.max);
  const acquiringFeePercent = clampPercent(input.acquiringFeePercent);
  const payoutSharePercent = clampPercent(input.payoutSharePercent);
  const payoutFeePercent = clampPercent(input.payoutFeePercent);
  const lossReductionPercent = clampPercent(input.lossReductionPercent);
  const providerFeePercent = clampPercent(input.providerFeePercent);
  const operationalCostPercent = clampPercent(input.operationalCostPercent);
  const riskLossPercent = clampPercent(input.riskLossPercent);

  const payoutVolume = cleanMoney(acquiringVolume * (payoutSharePercent / 100));
  const acquiringFeeRevenue = cleanMoney(acquiringVolume * (acquiringFeePercent / 100));
  const payoutFeeRevenue = cleanMoney(payoutVolume * (payoutFeePercent / 100));
  const lossReductionEffect = cleanMoney(acquiringVolume * (lossReductionPercent / 100));
  const grossRevenue = cleanMoney(acquiringFeeRevenue + payoutFeeRevenue + lossReductionEffect);
  const providerCost = cleanMoney(acquiringVolume * (providerFeePercent / 100));
  const operationalCost = cleanMoney(acquiringVolume * (operationalCostPercent / 100));
  const riskLoss = cleanMoney(acquiringVolume * (riskLossPercent / 100));
  const totalCosts = cleanMoney(providerCost + operationalCost + riskLoss);
  const netMarginMonthly = cleanMoney(grossRevenue - totalCosts);
  const netMarginYearly = cleanMoney(netMarginMonthly * 12);
  const grossRevenueYearly = cleanMoney(grossRevenue * 12);

  const warnings = [
    acquiringFeePercent > COMMERCIAL_LIMITS.feeWarningPercent ? "Комиссия приема выше 10%. Проверьте реалистичность тарифа." : null,
    payoutFeePercent > COMMERCIAL_LIMITS.feeWarningPercent ? "Комиссия выплат выше 10%. Проверьте реалистичность тарифа." : null,
    netMarginMonthly < 0 ? "Чистая маржа отрицательная: расходы и risk-loss выше валовой выручки." : null
  ].filter(Boolean) as string[];

  return {
    acquiringVolume,
    acquiringFeePercent,
    payoutSharePercent,
    payoutFeePercent,
    lossReductionPercent,
    providerFeePercent,
    operationalCostPercent,
    riskLossPercent,
    payoutVolume,
    acquiringFeeRevenue,
    payoutFeeRevenue,
    lossReductionEffect,
    grossRevenue,
    providerCost,
    operationalCost,
    riskLoss,
    totalCosts,
    netMarginMonthly,
    netMarginYearly,
    grossRevenueYearly,
    takeRateAfterCosts: safeRate(netMarginMonthly, acquiringVolume),
    grossTakeRate: safeRate(grossRevenue, acquiringVolume),
    providerCostRate: safeRate(providerCost, acquiringVolume),
    operationalCostRate: safeRate(operationalCost, acquiringVolume),
    riskLossRate: safeRate(riskLoss, acquiringVolume),
    netMarginRate: safeRate(netMarginMonthly, acquiringVolume),
    breakEvenStatus: netMarginMonthly > 0,
    warnings
  };
}
