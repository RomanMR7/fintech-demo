import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSafeQueryLimit } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const events = await prisma.eventLog.findMany({
    orderBy: { createdAt: "desc" },
    take: getSafeQueryLimit(request, { defaultLimit: 100, maxLimit: 300 })
  });
  return NextResponse.json(events);
}
