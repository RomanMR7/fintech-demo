import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.paymentOrder.findUnique({
    where: { id },
    include: {
      merchant: true,
      provider: true,
      requisite: true,
      appeals: { include: { comments: true } },
      transactions: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!order) return NextResponse.json({ message: "Ордер не найден" }, { status: 404 });
  return NextResponse.json(order);
}
