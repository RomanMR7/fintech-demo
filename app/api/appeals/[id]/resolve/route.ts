import { NextResponse } from "next/server";
import { resolveAppeal } from "@/lib/domain";
import { UserRole } from "@/lib/constants";
import { can } from "@/lib/rbac";
import { resolveRequestActor } from "@/lib/demo-session";
import { apiErrorResponse, readJsonBody } from "@/lib/api-guards";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return apiErrorResponse(error, "Некорректный запрос на решение апелляции.");
  }

  try {
    const actorRole = resolveRequestActor(request, body, UserRole.VIEWER).role;
    if (!can(actorRole, "appeal:resolve")) {
      return NextResponse.json({ error: "Недостаточно прав для решения апелляции." }, { status: 403 });
    }

    const appeal = await resolveAppeal(id, body.resolution === "platform" ? "platform" : "merchant");
    return NextResponse.json(appeal);
  } catch (error) {
    return apiErrorResponse(error, "Не удалось обработать апелляцию.", 409);
  }
}
