import { NextResponse } from "next/server";
import { openAppeal } from "@/lib/domain";
import { UserRole } from "@/lib/constants";
import { can } from "@/lib/rbac";
import { resolveRequestActor } from "@/lib/demo-session";
import { apiErrorResponse, readJsonBody } from "@/lib/api-guards";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await readJsonBody(request);
    const actorRole = resolveRequestActor(request, body, UserRole.VIEWER).role;

    if (!can(actorRole, "appeal:resolve")) {
      return NextResponse.json({ error: "Недостаточно прав для обработки апелляции." }, { status: 403 });
    }

    const appeal = await openAppeal(id);
    return NextResponse.json(appeal);
  } catch (error) {
    return apiErrorResponse(error, "Не удалось взять апелляцию в работу.", 409);
  }
}
