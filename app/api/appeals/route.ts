import { NextResponse } from "next/server";
import { createAppealForOrder } from "@/lib/domain";
import { prisma } from "@/lib/prisma";

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
  const body = await request.json().catch(() => ({}));
  const appeal = await createAppealForOrder(body.orderId);
  return NextResponse.json(appeal, { status: 201 });
}
