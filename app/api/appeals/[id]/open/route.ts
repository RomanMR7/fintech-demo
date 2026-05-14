import { NextResponse } from "next/server";
import { openAppeal } from "@/lib/domain";
import { UserRole } from "@/lib/constants";
import { can } from "@/lib/rbac";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actorRole = String(body.actorRole ?? UserRole.VIEWER);

    if (!can(actorRole, "appeal:resolve")) {
      return NextResponse.json({ error: "Недостаточно прав для обработки апелляции." }, { status: 403 });
    }

    const appeal = await openAppeal(id);
    return NextResponse.json(appeal);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось взять апелляцию в работу." }, { status: 409 });
  }
}
