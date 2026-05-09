import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const notifications = await prisma.notification.findMany({
    include: { merchant: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(notifications);
}
