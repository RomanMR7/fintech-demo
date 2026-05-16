import { NextResponse } from "next/server";
import { resolvePayout } from "@/lib/domain";
import { PayoutStatus, UserRole } from "@/lib/constants";
import { can } from "@/lib/rbac";
import { assertSandbox2fa, requireReason } from "@/lib/security";
import { resolveRequestActor } from "@/lib/demo-session";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = body.status as string;
  const actorRole = resolveRequestActor(request, body, UserRole.VIEWER).role;

  if (status !== PayoutStatus.COMPLETED && status !== PayoutStatus.CANCELED) {
    return NextResponse.json({ message: "В демо выплату можно подтвердить или отменить" }, { status: 400 });
  }

  try {
    if (status === PayoutStatus.COMPLETED) {
      if (!can(actorRole, "payout:approve")) return NextResponse.json({ error: "Недостаточно прав для подтверждения выплаты." }, { status: 403 });
      assertSandbox2fa(body.code);
    }

    if (status === PayoutStatus.CANCELED && !can(actorRole, "payout:cancel")) {
      return NextResponse.json({ error: "Недостаточно прав для отмены выплаты." }, { status: 403 });
    }

    const reason = requireReason(body.reason, "reason");
    const payout = await resolvePayout(id, status as typeof PayoutStatus.COMPLETED | typeof PayoutStatus.CANCELED, { actorRole, reason });
    return NextResponse.json(payout);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось изменить выплату." }, { status: 409 });
  }
}
