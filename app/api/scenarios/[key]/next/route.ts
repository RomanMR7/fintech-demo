import { NextResponse } from "next/server";
import { runScenarioStep } from "@/lib/domain";
import { apiErrorResponse, readJsonBody } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const body = await readJsonBody(request);
    const targetStep = Number.isFinite(Number(body.targetStep)) ? Number(body.targetStep) : undefined;
    const state = await runScenarioStep(key, targetStep);
    return NextResponse.json(state);
  } catch (error) {
    console.error("Scenario step failed", error);
    return apiErrorResponse(error, "Не удалось выполнить шаг сценария.", 500);
  }
}
