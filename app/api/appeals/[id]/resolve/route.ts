import { NextResponse } from "next/server";
import { resolveAppeal } from "@/lib/domain";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  try {
    const appeal = await resolveAppeal(id, body.resolution === "platform" ? "platform" : "merchant");
    return NextResponse.json(appeal);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось обработать апелляцию." }, { status: 409 });
  }
}
