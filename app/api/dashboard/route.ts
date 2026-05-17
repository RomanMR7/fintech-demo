import { NextResponse } from "next/server";
import { convertBreakdownToBase, getFxSnapshot } from "@/lib/fx";
import { emptyMoneyTotals, toNumber, type MoneyTotals } from "@/lib/format";
import { UserRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getOptionalQueryString } from "@/lib/api-guards";
import { resolveRequestActor } from "@/lib/demo-session";

export const dynamic = "force-dynamic";

function addCurrencyTotal(totals: MoneyTotals, currencyInput: string, amountInput: unknown) {
  const currency = currencyInput === "USD" ? "USD" : "RUB";
  totals[currency] += toNumber(amountInput);
}

export async function GET(request: Request) {
  const actor = resolveRequestActor(request);
  const requestedMerchantId = getOptionalQueryString(request, "merchantId");
  const merchantId = actor.role === UserRole.MERCHANT ? actor.merchantId : requestedMerchantId;
  const scopedWhere = merchantId ? { merchantId } : undefined;

  const [orders, successfulOrders, waitingOrders, disputedOrders, turnoverRows, balanceRows, appeals, events, fx] = await Promise.all([
    prisma.paymentOrder.count({ where: scopedWhere }),
    prisma.paymentOrder.count({ where: { ...scopedWhere, status: "COMPLETED" } }),
    prisma.paymentOrder.count({ where: { ...scopedWhere, status: { in: ["CREATED", "WAITING_PAYMENT", "PAID", "CONFIRMED"] } } }),
    prisma.paymentOrder.count({ where: { ...scopedWhere, status: "DISPUTED" } }),
    prisma.paymentOrder.groupBy({
      by: ["currency"],
      where: scopedWhere,
      _sum: { amount: true }
    }),
    prisma.balanceAccount.groupBy({
      by: ["type", "currency"],
      where: scopedWhere,
      _sum: { amount: true }
    }),
    prisma.appeal.count({ where: scopedWhere }),
    prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    getFxSnapshot()
  ]);

  const turnover = emptyMoneyTotals();
  turnoverRows.forEach((row) => addCurrencyTotal(turnover, row.currency, row._sum.amount));

  const availableBalance = emptyMoneyTotals();
  const frozenBalance = emptyMoneyTotals();
  balanceRows.forEach((row) => {
    if (row.type === "AVAILABLE") addCurrencyTotal(availableBalance, row.currency, row._sum.amount);
    if (row.type === "FROZEN") addCurrencyTotal(frozenBalance, row.currency, row._sum.amount);
  });

  return NextResponse.json({
    orders,
    successfulOrders,
    waitingOrders,
    disputedOrders,
    turnover,
    turnoverBaseRub: convertBreakdownToBase(turnover, fx),
    availableBalance,
    availableBalanceBaseRub: convertBreakdownToBase(availableBalance, fx),
    frozenBalance,
    frozenBalanceBaseRub: convertBreakdownToBase(frozenBalance, fx),
    fx,
    appeals,
    events
  });
}
