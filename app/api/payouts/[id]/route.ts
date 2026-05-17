import { NextResponse } from "next/server";
import { apiForbidden, apiNotFound } from "@/lib/api-guards";
import { canAccessMerchant, resolveRequestActor } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = resolveRequestActor(request);
  const payout = await prisma.payout.findUnique({
    where: { id },
    include: {
      merchant: true,
      transactions: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!payout) return apiNotFound("Выплата не найдена.");
  if (!canAccessMerchant(actor, payout.merchantId)) {
    return apiForbidden("Мерчант может смотреть только свои выплаты.");
  }

  return NextResponse.json(payout);
}

