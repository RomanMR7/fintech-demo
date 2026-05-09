import { NextResponse } from "next/server";
import { runScenarioStep } from "@/lib/domain";

export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const state = await runScenarioStep(key);
    return NextResponse.json(state);
  } catch (error) {
    console.error("Scenario step failed", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Не удалось выполнить шаг сценария."
      },
      { status: 500 }
    );
  }
}
