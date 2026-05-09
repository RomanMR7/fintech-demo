import { NextResponse } from "next/server";
import { adjustMerchantBalance } from "@/lib/domain";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const balances = await adjustMerchantBalance({
      merchantId: String(body.merchantId ?? ""),
      operation: body.operation,
      amount: Number(body.amount ?? 0),
      description: body.description ? String(body.description) : undefined
    });

    return NextResponse.json(balances);
  } catch (error) {
    console.error("Balance adjustment failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось изменить баланс." },
      { status: 400 }
    );
  }
}
