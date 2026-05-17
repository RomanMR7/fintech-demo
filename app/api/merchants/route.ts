import { NextResponse } from "next/server";
import { createMerchantProfile } from "@/lib/domain";
import { UserRole } from "@/lib/constants";
import { assertPercentInput } from "@/lib/finance-guards";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { requireReason } from "@/lib/security";
import { resolveRequestActor } from "@/lib/demo-session";
import { apiErrorResponse, readJsonBody } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

export async function GET() {
  const merchants = await prisma.merchant.findMany({
    include: { balances: true },
    orderBy: { displayName: "asc" }
  });

  return NextResponse.json(merchants);
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const actorRole = resolveRequestActor(request, body, UserRole.VIEWER).role;
    if (!can(actorRole, "merchant:create")) {
      return NextResponse.json({ error: "Недостаточно прав для создания мерчанта." }, { status: 403 });
    }

    requireReason(body.reason, "reason");
    const payinRaw = body.payinFeeRatePercent ?? (body.payinFeeRate !== undefined && Number(body.payinFeeRate) <= 1 ? Number(body.payinFeeRate) * 100 : body.payinFeeRate) ?? 2.5;
    const payoutRaw = body.payoutFeeRatePercent ?? (body.payoutFeeRate !== undefined && Number(body.payoutFeeRate) <= 1 ? Number(body.payoutFeeRate) * 100 : body.payoutFeeRate) ?? 1.5;
    const payinPercent = assertPercentInput(payinRaw, "payinFeeRatePercent");
    const payoutPercent = assertPercentInput(payoutRaw, "payoutFeeRatePercent");

    const merchant = await createMerchantProfile({
      displayName: String(body.displayName ?? ""),
      legalName: body.legalName ? String(body.legalName) : undefined,
      trustLimit: Number(body.trustLimit ?? 0),
      initialBalance: Number(body.initialBalance ?? 0),
      initialCurrency: body.initialCurrency ? String(body.initialCurrency) : undefined,
      payinFeeRate: payinPercent.div(100).toNumber(),
      payoutFeeRate: payoutPercent.div(100).toNumber()
    });

    return NextResponse.json(merchant, { status: 201 });
  } catch (error) {
    console.error("Merchant creation failed", error);
    return apiErrorResponse(error, "Не удалось создать мерчанта.");
  }
}
