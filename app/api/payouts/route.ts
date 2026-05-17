import { NextResponse } from "next/server";
import { createPayoutForMerchant } from "@/lib/domain";
import { UserRole } from "@/lib/constants";
import { parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { resolveRequestActor } from "@/lib/demo-session";
import { apiErrorResponse, getOptionalQueryString, getSafeQueryLimit, readJsonBody } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const actor = resolveRequestActor(request);
  const requestedMerchantId = getOptionalQueryString(request, "merchantId");
  const merchantId = actor.role === UserRole.MERCHANT ? actor.merchantId : requestedMerchantId;
  const payouts = await prisma.payout.findMany({
    where: merchantId ? { merchantId } : undefined,
    include: { merchant: true },
    orderBy: { createdAt: "desc" },
    take: getSafeQueryLimit(request)
  });
  return NextResponse.json(payouts);
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const actor = resolveRequestActor(request, body, UserRole.MERCHANT);
    const actorRole = actor.role;
    if (!can(actorRole, "payout:create")) {
      return NextResponse.json({ error: "Недостаточно прав для создания выплаты." }, { status: 403 });
    }

    const currency = parseCurrency(body.currency ?? "RUB");
    const requestedMerchantId = body.merchantId ? String(body.merchantId) : actor.merchantId;
    const merchantId = actorRole === UserRole.MERCHANT ? actor.merchantId : requestedMerchantId;
    const payout = await createPayoutForMerchant(merchantId, currency);
    return NextResponse.json(payout, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "Не удалось создать выплату.", 422);
  }
}
