import { NextResponse } from "next/server";
import { createDemoOrder } from "@/lib/domain";
import { EventType, OrderStatus, UserRole } from "@/lib/constants";
import { parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const orders = await prisma.paymentOrder.findMany({
    include: { merchant: true, provider: true, requisite: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  let currency: "RUB" | "USD";

  try {
    currency = parseCurrency(body.currency ?? "RUB");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Некорректная валюта." }, { status: 422 });
  }

  if (!body.amount || !body.merchantId) {
    try {
      const order = await createDemoOrder(UserRole.MERCHANT, {
        merchantId: body.merchantId ? String(body.merchantId) : undefined,
        currency
      });
      return NextResponse.json(order, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось создать демо-ордер." }, { status: 400 });
    }
  }

  const merchant = await prisma.merchant.findUnique({ where: { id: String(body.merchantId) } });
  if (!merchant) return NextResponse.json({ message: "Мерчант не найден" }, { status: 404 });

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Сумма ордера должна быть положительным числом." }, { status: 422 });
  }

  const commission = amount * Number(merchant.payinFeeRate);
  const order = await prisma.paymentOrder.create({
    data: {
      externalId: body.externalId ?? `API-${Date.now().toString().slice(-7)}`,
      merchantId: merchant.id,
      amount,
      currency,
      status: OrderStatus.CREATED,
      commission,
      platformFee: amount * 0.006,
      merchantNet: amount - commission,
      providerName: "Провайдер будет назначен",
      paymentUrl: `https://pay.local/api/${Date.now()}`,
      metadata: JSON.stringify({ source: "api-demo" })
    }
  });

  await prisma.eventLog.create({
    data: {
      actorRole: UserRole.MERCHANT,
      actorName: "API мерчанта",
      type: EventType.ORDER_CREATED,
      entityType: "PaymentOrder",
      entityId: order.id,
      title: "Ордер создан через API",
      description: `Создан API-ордер ${order.externalId} на ${amount} ${currency}.`
    }
  });

  return NextResponse.json(order, { status: 201 });
}
