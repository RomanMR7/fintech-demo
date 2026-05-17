import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { EventType, UserRole } from "@/lib/constants";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { assertSandbox2fa, maskSecret, requireReason } from "@/lib/security";
import { canAccessMerchant, resolveRequestActor } from "@/lib/demo-session";
import { apiErrorResponse, readJsonBody } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

function generateDemoApiKey(merchantId: string) {
  return `pk_demo_${merchantId.replace(/^merchant-/, "").slice(0, 18)}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return apiErrorResponse(error, "Некорректный запрос на перевыпуск API key.");
  }

  const actor = resolveRequestActor(request, body, UserRole.MERCHANT);
  const actorRole = actor.role;

  try {
    if (!can(actorRole, "apiKey:rotate")) {
      return NextResponse.json({ error: "Недостаточно прав для перевыпуска API key." }, { status: 403 });
    }

    if (!canAccessMerchant(actor, id)) {
      return NextResponse.json({ error: "API key доступен только выбранному мерчанту." }, { status: 403 });
    }

    const reason = requireReason(body.reason, "reason");
    assertSandbox2fa(body.code);

    const merchant = await prisma.merchant.findUnique({ where: { id } });
    if (!merchant) return NextResponse.json({ error: "Мерчант не найден." }, { status: 404 });

    const nextApiKey = generateDemoApiKey(merchant.id);
    const updated = await prisma.merchant.update({
      where: { id: merchant.id },
      data: { apiKey: nextApiKey }
    });

    await writeAuditLog({
      actorRole,
      actorName: actorRole === UserRole.MERCHANT ? merchant.displayName : "Demo operator",
      type: EventType.API_KEY_ROTATED,
      entityType: "Merchant",
      entityId: merchant.id,
      title: "API key перевыпущен",
      description: `Sandbox API key мерчанта ${merchant.displayName} перевыпущен. Старый ключ считается недействительным в demo-модели.`,
      reason,
      before: { maskedApiKey: maskSecret(merchant.apiKey) },
      after: { maskedApiKey: maskSecret(updated.apiKey) },
      severity: "CRITICAL"
    });

    return NextResponse.json({ maskedApiKey: maskSecret(updated.apiKey) });
  } catch (error) {
    return apiErrorResponse(error, "Не удалось перевыпустить API key.", 422);
  }
}
