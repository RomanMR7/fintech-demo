import assert from "node:assert/strict";

import {
  assertDecimalRate,
  assertPercentInput,
  assertPositiveMoney,
  assertSameCurrency,
  assertSufficientBalance,
  buildPayoutReservation,
  calculateCommission,
  toMoneyDecimal
} from "../lib/finance-guards";
import { assertSandbox2fa, maskSecret, requireReason } from "../lib/security";

assert.equal(toMoneyDecimal("100.125").toString(), "100.13");
assert.equal(assertPositiveMoney("1", "amount").toString(), "1");
assert.throws(() => assertPositiveMoney("0", "amount"), /больше нуля/);
assert.throws(() => assertPositiveMoney("-1", "amount"), /больше нуля/);

assert.equal(assertDecimalRate("0.025", "payinFeeRate").toString(), "0.025");
assert.throws(() => assertDecimalRate("-0.01", "payinFeeRate"), /диапазоне/);
assert.throws(() => assertDecimalRate("1.01", "payinFeeRate"), /диапазоне/);
assert.equal(assertPercentInput("100", "commissionPercent").toString(), "100");
assert.throws(() => assertPercentInput("100.1", "commissionPercent"), /диапазоне/);

assert.equal(calculateCommission("1000", "0.025").toString(), "25");
assert.equal(calculateCommission("999.99", "0.015").toString(), "15");

const reservation = buildPayoutReservation("1000", "0.015");
assert.equal(reservation.amount.toString(), "1000");
assert.equal(reservation.commission.toString(), "15");
assert.equal(reservation.total.toString(), "1015");

assert.deepEqual(
  Object.fromEntries(Object.entries(assertSufficientBalance("1015", "1015", "available")).map(([key, value]) => [key, value.toString()])),
  { balance: "1015", amount: "1015" }
);
assert.throws(() => assertSufficientBalance("1000", "1015", "available"), /Недостаточно средств/);

assert.equal(assertSameCurrency("RUB", "rub"), "RUB");
assert.throws(() => assertSameCurrency("RUB", "USD"), /Нельзя смешивать валюты/);

assert.equal(maskSecret("demo_orbita_123456_9f8a"), "demo_orbit****9f8a");
assert.equal(requireReason("Плановая корректировка"), "Плановая корректировка");
assert.throws(() => requireReason(""), /Укажите причину/);
assert.doesNotThrow(() => assertSandbox2fa("000000"));
assert.throws(() => assertSandbox2fa("123456"), /Неверный sandbox 2FA/);

console.log("Финансовые guard-проверки пройдены: суммы, комиссии, валюты, баланс, API secret masking и sandbox 2FA работают ожидаемо.");
