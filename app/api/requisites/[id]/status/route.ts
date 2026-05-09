import { NextResponse } from "next/server";
import { EventType, RequisiteStatus, UserRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const status = body.status as string;

  if (!Object.values(RequisiteStatus).includes(status as (typeof RequisiteStatus)[keyof typeof RequisiteStatus])) {
    return NextResponse.json({ message: "Некорректный статус реквизита" }, { status: 400 });
  }

  const requisite = await prisma.paymentRequisite.update({
    where: { id },
    data: { status }
  });

  await prisma.eventLog.create({
    data: {
      actorRole: UserRole.OPERATOR,
      actorName: "Мария Лебедева",
      type: EventType.REQUISITE_CHANGED,
      entityType: "PaymentRequisite",
      entityId: requisite.id,
      title: "Статус реквизита изменен",
      description: `Реквизит ${requisite.bank} ${requisite.maskedNumber} переведен в статус ${status}.`
    }
  });

  return NextResponse.json(requisite);
}
