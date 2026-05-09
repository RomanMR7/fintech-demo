import { NextResponse } from "next/server";
import { resolveAppeal } from "@/lib/domain";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const appeal = await resolveAppeal(id, body.resolution === "platform" ? "platform" : "merchant");
  return NextResponse.json(appeal);
}
