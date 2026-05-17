import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalQueryString, getSafeQueryLimit } from "@/lib/api-guards";
import { resolveRequestActor } from "@/lib/demo-session";
import { UserRole } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const actor = resolveRequestActor(request);
  const requestedMerchantId = getOptionalQueryString(request, "merchantId");
  const merchantId = actor.role === UserRole.MERCHANT ? actor.merchantId : requestedMerchantId;
  const notifications = await prisma.notification.findMany({
    where: {
      ...(merchantId ? { OR: [{ merchantId }, { merchantId: null }] } : {}),
      ...(actor.role === UserRole.VIEWER ? {} : { role: { in: [actor.role, UserRole.PLATFORM_ADMIN] } })
    },
    include: { merchant: true },
    orderBy: { createdAt: "desc" },
    take: getSafeQueryLimit(request, { defaultLimit: 100, maxLimit: 300 })
  });
  return NextResponse.json(notifications);
}
