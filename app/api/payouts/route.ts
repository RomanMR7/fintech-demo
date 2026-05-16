import { NextResponse } from "next/server";
import { createPayoutForMerchant } from "@/lib/domain";
import { UserRole } from "@/lib/constants";
import { parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { resolveRequestActor } from "@/lib/demo-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const payouts = await prisma.payout.findMany({
    include: { merchant: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(payouts);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  try {
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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось создать выплату." }, { status: 422 });
  }
}
