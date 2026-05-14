import { NextResponse } from "next/server";
import { changeOrderStatus } from "@/lib/domain";
import { OrderStatus, UserRole, type OrderStatusValue } from "@/lib/constants";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const status = body.status as OrderStatusValue;

  if (!Object.values(OrderStatus).includes(status)) {
    return NextResponse.json({ message: "Некорректный статус ордера" }, { status: 400 });
  }

  try {
    const updated = await changeOrderStatus(id, status, (body.actorRole as string) ?? UserRole.OPERATOR);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось изменить статус ордера." }, { status: 409 });
  }
}
