import assert from "node:assert/strict";

import { OrderStatus, PayoutStatus } from "../lib/constants";
import { convertBreakdownToBase, parseCbrUsdRubRate } from "../lib/fx";
import { formatMoney, formatMoneyBreakdown } from "../lib/format";
import { assertOrderTransition, assertPayoutTransition, canChangeOrderStatus, canChangePayoutStatus } from "../lib/state-machines";

const sampleCbrXml = `<?xml version="1.0" encoding="windows-1251"?>
<ValCurs Date="14.05.2026" name="Foreign Currency Market">
  <Valute ID="R01235">
    <NumCode>840</NumCode>
    <CharCode>USD</CharCode>
    <Nominal>1</Nominal>
    <Name>Доллар США</Name>
    <Value>91,2500</Value>
  </Valute>
</ValCurs>`;

const readable = (value: string) => value.replace(/\u00a0/g, " ");

const parsedRate = parseCbrUsdRubRate(sampleCbrXml);
assert.equal(parsedRate.quoteCurrency, "USD");
assert.equal(parsedRate.baseCurrency, "RUB");
assert.equal(parsedRate.rate, 91.25);

assert.equal(convertBreakdownToBase({ RUB: 1000, USD: 10 }, { usdRubRate: 91.25 }), 1912.5);
assert.equal(convertBreakdownToBase({ RUB: 1000, USD: 0 }, { usdRubRate: null }), 1000);
assert.equal(convertBreakdownToBase({ RUB: 1000, USD: 10 }, { usdRubRate: null }), null);
assert.equal(readable(formatMoney(1221.6, "USD")), "1 221,60 USD");
assert.equal(readable(formatMoney(1221.6, "RUB")), "1 222 RUB");
assert.equal(readable(formatMoneyBreakdown({ RUB: 1000, USD: 12.5 })), "RUB: 1 000 RUB · USD: 12,50 USD");

assert.equal(canChangeOrderStatus(OrderStatus.CREATED, OrderStatus.WAITING_PAYMENT), true);
assert.equal(canChangeOrderStatus(OrderStatus.CREATED, OrderStatus.COMPLETED), false);
assert.throws(() => assertOrderTransition(OrderStatus.CREATED, OrderStatus.COMPLETED), /Нельзя перевести ордер/);

assert.equal(canChangePayoutStatus(PayoutStatus.PENDING_APPROVAL, PayoutStatus.COMPLETED), true);
assert.equal(canChangePayoutStatus(PayoutStatus.COMPLETED, PayoutStatus.CANCELED), false);
assert.throws(() => assertPayoutTransition(PayoutStatus.COMPLETED, PayoutStatus.CANCELED), /Нельзя перевести выплату/);

console.log("Бизнес-логика проверена: курсы, пересчет, статусы ордеров и выплат работают ожидаемо.");
