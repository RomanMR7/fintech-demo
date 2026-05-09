import { NextResponse } from "next/server";
import { runScenarioStep } from "@/lib/domain";

export async function POST(_: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const state = await runScenarioStep(key);
  return NextResponse.json(state);
}
