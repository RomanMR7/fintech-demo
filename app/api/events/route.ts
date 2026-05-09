import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await prisma.eventLog.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(events);
}
