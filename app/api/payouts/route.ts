import { NextResponse } from "next/server";
import { createPayoutForMerchant } from "@/lib/domain";
import { parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/prisma";

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
    const currency = parseCurrency(body.currency ?? "RUB");
    const payout = await createPayoutForMerchant(body.merchantId ?? "merchant-orbita", currency);
    return NextResponse.json(payout, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось создать выплату." }, { status: 422 });
  }
}
