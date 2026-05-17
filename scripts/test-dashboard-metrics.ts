import assert from "node:assert/strict";

import { calculateOrderSuccessRate } from "../lib/dashboard-metrics";

const healthySeedStatuses = [
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "DISPUTED"
];

assert.equal(calculateOrderSuccessRate(healthySeedStatuses), 90);
assert.equal(calculateOrderSuccessRate([]), 0);
assert.equal(calculateOrderSuccessRate(["COMPLETED", "FAILED"]), 50);

const successRate = calculateOrderSuccessRate(healthySeedStatuses);
assert.ok(successRate >= 84 && successRate <= 93, `Стартовая успешность должна быть 84-93%, сейчас ${successRate}%`);

console.log("Dashboard metrics tests passed: стартовая успешность демо-профиля находится в реалистичном диапазоне 84-93%.");
