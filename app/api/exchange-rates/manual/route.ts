import { NextResponse } from "next/server";

import { getFxSnapshot, saveManualUsdRubRate } from "@/lib/fx";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rateValue = Number(String(body.rate ?? "").replace(",", "."));
    const rate = await saveManualUsdRubRate(rateValue, body.note ? String(body.note) : undefined);
    const snapshot = await getFxSnapshot();
    return NextResponse.json({ rate, snapshot });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось сохранить курс." }, { status: 422 });
  }
}
