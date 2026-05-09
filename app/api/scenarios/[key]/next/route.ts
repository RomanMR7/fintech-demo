import { NextResponse } from "next/server";
import { runScenarioStep } from "@/lib/domain";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const body = await request.json().catch(() => ({}));
    const targetStep = Number.isFinite(Number(body.targetStep)) ? Number(body.targetStep) : undefined;
    const state = await runScenarioStep(key, targetStep);
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
