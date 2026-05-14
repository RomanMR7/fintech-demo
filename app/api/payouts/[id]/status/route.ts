import { NextResponse } from "next/server";
import { resolvePayout } from "@/lib/domain";
import { PayoutStatus } from "@/lib/constants";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const status = body.status as string;

  if (status !== PayoutStatus.COMPLETED && status !== PayoutStatus.CANCELED) {
    return NextResponse.json({ message: "В демо выплату можно подтвердить или отменить" }, { status: 400 });
  }

  try {
    const payout = await resolvePayout(id, status as typeof PayoutStatus.COMPLETED | typeof PayoutStatus.CANCELED);
    return NextResponse.json(payout);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось изменить выплату." }, { status: 409 });
  }
}
