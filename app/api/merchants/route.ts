import { NextResponse } from "next/server";
import { createMerchantProfile } from "@/lib/domain";
import { prisma } from "@/lib/prisma";

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
    const body = await request.json().catch(() => ({}));
    const merchant = await createMerchantProfile({
      displayName: String(body.displayName ?? ""),
      legalName: body.legalName ? String(body.legalName) : undefined,
      trustLimit: Number(body.trustLimit ?? 0),
      initialBalance: Number(body.initialBalance ?? 0),
      initialCurrency: body.initialCurrency ? String(body.initialCurrency) : undefined,
      payinFeeRate: Number(body.payinFeeRate ?? 0.025),
      payoutFeeRate: Number(body.payoutFeeRate ?? 0.015)
    });

    return NextResponse.json(merchant, { status: 201 });
  } catch (error) {
    console.error("Merchant creation failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось создать мерчанта." },
      { status: 400 }
    );
  }
}
