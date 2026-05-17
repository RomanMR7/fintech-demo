import { NextResponse } from "next/server";
import { createDemoOrder } from "@/lib/domain";
import { EventType, OrderStatus, UserRole } from "@/lib/constants";
import { parseCurrency } from "@/lib/currency";
import { assertPositiveMoney, calculateCommission } from "@/lib/finance-guards";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { resolveRequestActor } from "@/lib/demo-session";
import { apiErrorResponse, getOptionalQueryString, getSafeQueryLimit, readJsonBody } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const actor = resolveRequestActor(request);
  const requestedMerchantId = getOptionalQueryString(request, "merchantId");
  const merchantId = actor.role === UserRole.MERCHANT ? actor.merchantId : requestedMerchantId;
  const orders = await prisma.paymentOrder.findMany({
    where: merchantId ? { merchantId } : undefined,
    include: { merchant: true, provider: true, requisite: true },
    orderBy: { createdAt: "desc" },
    take: getSafeQueryLimit(request)
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return apiErrorResponse(error, "Некорректный запрос на создание ордера.");
  }

  let currency: "RUB" | "USD";
  const actor = resolveRequestActor(request, body, UserRole.MERCHANT);
  const actorRole = actor.role;
  const requestedMerchantId = body.merchantId ? String(body.merchantId) : actor.merchantId;
  const merchantId = actorRole === UserRole.MERCHANT ? actor.merchantId : requestedMerchantId;

  if (!can(actorRole, "order:create")) {
    return NextResponse.json({ error: "Недостаточно прав для создания ордера." }, { status: 403 });
  }

  try {
    currency = parseCurrency(body.currency ?? "RUB");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Некорректная валюта." }, { status: 422 });
  }

  if (!body.amount || !merchantId) {
    try {
      const order = await createDemoOrder(actorRole, {
        merchantId,
        currency
      });
      return NextResponse.json(order, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось создать демо-ордер." }, { status: 400 });
    }
  }

  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!merchant) return NextResponse.json({ message: "Мерчант не найден" }, { status: 404 });

  let amount;
  try {
    amount = assertPositiveMoney(body.amount, "amount");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Сумма ордера должна быть положительным числом." }, { status: 422 });
  }

  const commission = calculateCommission(amount, merchant.payinFeeRate);
  const order = await prisma.paymentOrder.create({
    data: {
      externalId: body.externalId ? String(body.externalId) : `API-${Date.now().toString().slice(-7)}`,
      merchantId: merchant.id,
      amount,
      currency,
      status: OrderStatus.CREATED,
      commission,
      platformFee: amount.mul("0.006").toDecimalPlaces(2),
      merchantNet: amount.minus(commission),
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
      description: `Создан API-ордер ${order.externalId} на ${amount.toString()} ${currency}.`
    }
  });

  return NextResponse.json(order, { status: 201 });
}
