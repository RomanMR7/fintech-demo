import { NextResponse } from "next/server";
import { convertBreakdownToBase, getFxSnapshot } from "@/lib/fx";
import { totalByCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [orders, balances, appeals, events, fx] = await Promise.all([
    prisma.paymentOrder.findMany(),
    prisma.balanceAccount.findMany(),
    prisma.appeal.findMany(),
    prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    getFxSnapshot()
  ]);

  const turnover = totalByCurrency(orders, (order) => order.amount, (order) => order.currency);
  const availableBalance = totalByCurrency(balances.filter((balance) => balance.type === "AVAILABLE"), (balance) => balance.amount, (balance) => balance.currency);
  const frozenBalance = totalByCurrency(balances.filter((balance) => balance.type === "FROZEN"), (balance) => balance.amount, (balance) => balance.currency);

  return NextResponse.json({
    orders: orders.length,
    successfulOrders: orders.filter((order) => order.status === "COMPLETED").length,
    waitingOrders: orders.filter((order) => ["CREATED", "WAITING_PAYMENT", "PAID", "CONFIRMED"].includes(order.status)).length,
    disputedOrders: orders.filter((order) => order.status === "DISPUTED").length,
    turnover,
    turnoverBaseRub: convertBreakdownToBase(turnover, fx),
    availableBalance,
    availableBalanceBaseRub: convertBreakdownToBase(availableBalance, fx),
    frozenBalance,
    frozenBalanceBaseRub: convertBreakdownToBase(frozenBalance, fx),
    fx,
    appeals: appeals.length,
    events
  });
}
