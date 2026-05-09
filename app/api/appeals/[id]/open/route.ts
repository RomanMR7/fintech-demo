import { NextResponse } from "next/server";
import { openAppeal } from "@/lib/domain";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appeal = await openAppeal(id);
  return NextResponse.json(appeal);
}
