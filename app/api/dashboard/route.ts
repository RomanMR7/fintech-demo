import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [orders, balances, appeals, events] = await Promise.all([
    prisma.paymentOrder.findMany(),
    prisma.balanceAccount.findMany(),
    prisma.appeal.findMany(),
    prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 })
  ]);

  return NextResponse.json({
    orders: orders.length,
    successfulOrders: orders.filter((order) => order.status === "COMPLETED").length,
    waitingOrders: orders.filter((order) => ["CREATED", "WAITING_PAYMENT", "PAID", "CONFIRMED"].includes(order.status)).length,
    disputedOrders: orders.filter((order) => order.status === "DISPUTED").length,
    turnover: orders.reduce((sum, order) => sum + Number(order.amount), 0),
    availableBalance: balances.filter((balance) => balance.type === "AVAILABLE").reduce((sum, balance) => sum + Number(balance.amount), 0),
    frozenBalance: balances.filter((balance) => balance.type === "FROZEN").reduce((sum, balance) => sum + Number(balance.amount), 0),
    appeals: appeals.length,
    events
  });
}
