import { NextResponse } from "next/server";

import { getFxSnapshot, refreshCbrUsdRubRate } from "@/lib/fx";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const rate = await refreshCbrUsdRubRate();
    const snapshot = await getFxSnapshot();
    return NextResponse.json({ rate, snapshot });
  } catch (error) {
    const snapshot = await getFxSnapshot();
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Не удалось обновить курс.",
        snapshot
      },
      { status: snapshot.usdRubRate ? 200 : 502 }
    );
  }
}
