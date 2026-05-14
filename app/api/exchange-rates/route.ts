import { NextResponse } from "next/server";

import { getFxSnapshot } from "@/lib/fx";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFxSnapshot();
  return NextResponse.json(snapshot);
}
