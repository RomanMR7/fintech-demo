import { NextResponse } from "next/server";
import { createDemoOrder } from "@/lib/domain";
import { EventType, OrderStatus, UserRole } from "@/lib/constants";
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

  if (!body.amount || !body.merchantId) {
    const order = await createDemoOrder(UserRole.MERCHANT);
    return NextResponse.json(order, { status: 201 });
  }

  const merchant = await prisma.merchant.findUnique({ where: { id: String(body.merchantId) } });
  if (!merchant) return NextResponse.json({ message: "Мерчант не найден" }, { status: 404 });

  const amount = Number(body.amount);
  const commission = amount * Number(merchant.payinFeeRate);
  const order = await prisma.paymentOrder.create({
    data: {
      externalId: body.externalId ?? `API-${Date.now().toString().slice(-7)}`,
      merchantId: merchant.id,
      amount,
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
      description: `Создан API-ордер ${order.externalId} на ${amount} RUB.`
    }
  });

  return NextResponse.json(order, { status: 201 });
}
