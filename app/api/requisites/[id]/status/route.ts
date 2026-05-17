import { NextResponse } from "next/server";
import { EventType, RequisiteStatus, UserRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { resolveRequestActor } from "@/lib/demo-session";
import { apiErrorResponse, readJsonBody } from "@/lib/api-guards";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await readJsonBody(request);
    const actorRole = resolveRequestActor(request, body, UserRole.VIEWER).role;
    const status = body.status as string;

    if (!can(actorRole, "requisite:manage")) {
      return NextResponse.json({ error: "Недостаточно прав для управления реквизитами." }, { status: 403 });
    }

    if (!Object.values(RequisiteStatus).includes(status as (typeof RequisiteStatus)[keyof typeof RequisiteStatus])) {
      return NextResponse.json({ message: "Некорректный статус реквизита" }, { status: 400 });
    }

    const existing = await prisma.paymentRequisite.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Реквизит не найден." }, { status: 404 });

    const requisite = await prisma.paymentRequisite.update({
      where: { id },
      data: { status }
    });

    await prisma.eventLog.create({
      data: {
        actorRole,
        actorName: actorRole === UserRole.OPERATOR ? "Мария Лебедева" : "Demo user",
        type: EventType.REQUISITE_CHANGED,
        entityType: "PaymentRequisite",
        entityId: requisite.id,
        title: "Статус реквизита изменен",
        description: `Реквизит ${requisite.bank} ${requisite.maskedNumber} переведен в статус ${status}.`
      }
    });

    return NextResponse.json(requisite);
  } catch (error) {
    return apiErrorResponse(error, "Не удалось изменить реквизит.");
  }
}
