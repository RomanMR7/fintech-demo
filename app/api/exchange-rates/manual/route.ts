import { NextResponse } from "next/server";

import { apiErrorResponse, readJsonBody } from "@/lib/api-guards";
import { getFxSnapshot, saveManualUsdRubRate } from "@/lib/fx";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const rateValue = Number(String(body.rate ?? "").replace(",", "."));
    const rate = await saveManualUsdRubRate(rateValue, body.note ? String(body.note) : undefined);
    const snapshot = await getFxSnapshot();
    return NextResponse.json({ rate, snapshot });
  } catch (error) {
    return apiErrorResponse(error, "Не удалось сохранить курс.", 422);
  }
}
