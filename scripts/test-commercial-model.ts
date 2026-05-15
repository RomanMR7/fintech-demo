import assert from "node:assert/strict";

import { calculateCommercialModel, clampNumber, COMMERCIAL_LIMITS, parseNumericInput, safeNumber } from "../lib/commercial-model";
import { formatMoney, formatNumericInputValue, formatRate } from "../lib/format";

function assertFiniteModel(model: ReturnType<typeof calculateCommercialModel>) {
  Object.entries(model).forEach(([key, value]) => {
    if (typeof value === "number") {
      assert.equal(Number.isFinite(value), true, `${key} must be finite`);
    }
  });
}

const baseModel = calculateCommercialModel({
  acquiringVolume: 10_000_000,
  acquiringFeePercent: 2.5,
  payoutSharePercent: 40,
  payoutFeePercent: 1.5,
  lossReductionPercent: 0.4,
  providerFeePercent: 0.9,
  operationalCostPercent: 0.35,
  riskLossPercent: 0.15
});

assert.equal(baseModel.payoutVolume, 4_000_000);
assert.equal(baseModel.acquiringFeeRevenue, 250_000);
assert.equal(baseModel.payoutFeeRevenue, 60_000);
assert.equal(baseModel.lossReductionEffect, 40_000);
assert.equal(baseModel.grossRevenue, 350_000);
assert.equal(baseModel.providerCost, 90_000);
assert.equal(baseModel.operationalCost, 35_000);
assert.equal(baseModel.riskLoss, 15_000);
assert.equal(baseModel.totalCosts, 140_000);
assert.equal(baseModel.netMarginMonthly, 210_000);
assert.equal(baseModel.netMarginYearly, 2_520_000);
assert.equal(baseModel.grossRevenueYearly, 4_200_000);
assert.equal(baseModel.breakEvenStatus, true);
assert.equal(baseModel.takeRateAfterCosts, 2.1);
assert.equal(baseModel.grossTakeRate, 3.5);
assert.equal(baseModel.providerCostRate, 0.9);
assert.equal(baseModel.operationalCostRate, 0.35);
assert.equal(baseModel.riskLossRate, 0.15);
assert.equal(baseModel.netMarginRate, 2.1);
assertFiniteModel(baseModel);

const zeroModel = calculateCommercialModel({
  acquiringVolume: 0,
  acquiringFeePercent: 0,
  payoutSharePercent: 0,
  payoutFeePercent: 0,
  lossReductionPercent: 0,
  providerFeePercent: 0,
  operationalCostPercent: 0,
  riskLossPercent: 0
});

assert.equal(zeroModel.takeRateAfterCosts, 0);
assert.equal(zeroModel.grossTakeRate, 0);
assert.equal(zeroModel.breakEvenStatus, false);
assertFiniteModel(zeroModel);

const lossModel = calculateCommercialModel({
  acquiringVolume: 1_000_000,
  acquiringFeePercent: 0.5,
  payoutSharePercent: 0,
  payoutFeePercent: 0,
  lossReductionPercent: 0,
  providerFeePercent: 2,
  operationalCostPercent: 1,
  riskLossPercent: 1
});

assert.equal(lossModel.netMarginMonthly, -35_000);
assert.equal(lossModel.breakEvenStatus, false);
assert.equal(lossModel.warnings.some((warning) => warning.includes("отрицательная")), true);
assertFiniteModel(lossModel);

const clampedModel = calculateCommercialModel({
  acquiringVolume: -10,
  acquiringFeePercent: 120,
  payoutSharePercent: 120,
  payoutFeePercent: 12.5,
  lossReductionPercent: -5,
  providerFeePercent: Number.POSITIVE_INFINITY,
  operationalCostPercent: "2,5",
  riskLossPercent: "bad"
});

assert.equal(clampedModel.acquiringVolume, 0);
assert.equal(clampedModel.acquiringFeePercent, 100);
assert.equal(clampedModel.payoutSharePercent, 100);
assert.equal(clampedModel.payoutFeePercent, 12.5);
assert.equal(clampedModel.lossReductionPercent, 0);
assert.equal(clampedModel.providerFeePercent, 0);
assert.equal(clampedModel.operationalCostPercent, 2.5);
assert.equal(clampedModel.riskLossPercent, 0);
assert.equal(clampedModel.warnings.some((warning) => warning.includes("выше 10%")), true);
assertFiniteModel(clampedModel);

assert.equal(parseNumericInput("1 250 000,75 ₽"), 1250000.75);
assert.equal(parseNumericInput("$10,000"), 10000);
assert.equal(parseNumericInput("150 000 000,50"), 150000000.5);
assert.equal(parseNumericInput("2,5"), 2.5);
assert.equal(parseNumericInput(""), null);
assert.equal(safeNumber("bad", 7), 7);
assert.equal(clampNumber(2_000_000_000_000, COMMERCIAL_LIMITS.acquiringVolume.min, COMMERCIAL_LIMITS.acquiringVolume.max), COMMERCIAL_LIMITS.acquiringVolume.max);

const readable = (value: string) => value.replace(/\u00a0/g, " ");
assert.equal(readable(formatMoney(1_000_000, "RUB")), "1 000 000 ₽");
assert.equal(readable(formatMoney(10_000, "USD")), "$10,000.00");
assert.equal(readable(formatMoney(Number.NaN, "USD")), "$0.00");
assert.equal(readable(formatMoney(Number.POSITIVE_INFINITY, "RUB")), "0 ₽");
assert.equal(readable(formatNumericInputValue(1_000_000)), "1 000 000");
assert.equal(readable(formatNumericInputValue(25_000_000)), "25 000 000");
assert.equal(readable(formatNumericInputValue(150_000_000.5)), "150 000 000,50");
assert.equal(readable(formatNumericInputValue(Number.NaN)), "");
assert.equal(readable(formatRate(Number.NaN)), "0,00");

console.log("Unit-тесты commercial model пройдены: формулы, NaN/Infinity, валидация, форматирование RUB/USD и break-even работают ожидаемо.");
