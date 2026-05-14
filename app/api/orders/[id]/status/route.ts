import { NextResponse } from "next/server";
import { changeOrderStatus } from "@/lib/domain";
import { OrderStatus, UserRole, type OrderStatusValue } from "@/lib/constants";
import { can } from "@/lib/rbac";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const status = body.status as OrderStatusValue;
  const actorRole = (body.actorRole as string) ?? UserRole.VIEWER;

  if (!Object.values(OrderStatus).includes(status)) {
    return NextResponse.json({ message: "Некорректный статус ордера" }, { status: 400 });
  }

  try {
    const requiredAction = status === OrderStatus.DISPUTED ? "order:dispute" : "order:update";
    if (!can(actorRole, requiredAction)) {
      return NextResponse.json({ error: "Недостаточно прав для изменения статуса ордера." }, { status: 403 });
    }

    const updated = await changeOrderStatus(id, status, actorRole);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось изменить статус ордера." }, { status: 409 });
  }
}
