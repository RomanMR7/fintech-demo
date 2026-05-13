import { NextResponse } from "next/server";
import { createPayoutForMerchant } from "@/lib/domain";
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
  const payout = await createPayoutForMerchant(body.merchantId ?? "merchant-orbita", body.currency);
  return NextResponse.json(payout, { status: 201 });
}
