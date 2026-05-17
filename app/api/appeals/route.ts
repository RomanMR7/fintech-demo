import { NextResponse } from "next/server";
import { createAppealForOrder } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, readJsonBody } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

export async function GET() {
  const appeals = await prisma.appeal.findMany({
    include: {
      merchant: true,
      order: true,
      author: true,
      assignee: true,
      comments: { orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(appeals);
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const appeal = await createAppealForOrder(String(body.orderId ?? ""));
    return NextResponse.json(appeal, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "Не удалось создать апелляцию.", 422);
  }
}
