import { NextResponse } from "next/server";
import { UserRole } from "@/lib/constants";
import { createAppealForOrder } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, getOptionalQueryString, getSafeQueryLimit, readJsonBody } from "@/lib/api-guards";
import { resolveRequestActor } from "@/lib/demo-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const actor = resolveRequestActor(request);
  const requestedMerchantId = getOptionalQueryString(request, "merchantId");
  const merchantId = actor.role === UserRole.MERCHANT ? actor.merchantId : requestedMerchantId;
  const status = getOptionalQueryString(request, "status");
  const appeals = await prisma.appeal.findMany({
    where: {
      ...(merchantId ? { merchantId } : {}),
      ...(status ? { status } : {})
    },
    include: {
      merchant: true,
      order: true,
      author: true,
      assignee: true,
      comments: { orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" },
    take: getSafeQueryLimit(request, { defaultLimit: 100, maxLimit: 300 })
  });
  return NextResponse.json(appeals);
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const appeal = await createAppealForOrder(String(body.orderId ?? ""));
    return NextResponse.json(appeal, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "Не удалось создать апелляцию.", 422);
  }
}
