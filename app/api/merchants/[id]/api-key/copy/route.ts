import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { EventType, UserRole } from "@/lib/constants";
import { maskSecret } from "@/lib/security";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { canAccessMerchant, resolveRequestActor } from "@/lib/demo-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const actor = resolveRequestActor(request, body, UserRole.MERCHANT);
  const actorRole = actor.role;

  if (!can(actorRole, "apiKey:copy")) {
    return NextResponse.json({ error: "Недостаточно прав для копирования API key." }, { status: 403 });
  }

  if (!canAccessMerchant(actor, id)) {
    return NextResponse.json({ error: "API key доступен только выбранному мерчанту." }, { status: 403 });
  }

  if (body.confirmed !== true) {
    return NextResponse.json({ error: "Подтвердите копирование API key в sandbox." }, { status: 422 });
  }

  const merchant = await prisma.merchant.findUnique({ where: { id } });
  if (!merchant) return NextResponse.json({ error: "Мерчант не найден." }, { status: 404 });

  await writeAuditLog({
    actorRole,
    actorName: actorRole === UserRole.MERCHANT ? merchant.displayName : "Demo operator",
    type: EventType.API_KEY_COPIED,
    entityType: "Merchant",
    entityId: merchant.id,
    title: "API key скопирован",
    description: `В sandbox был скопирован API key мерчанта ${merchant.displayName}.`,
    reason: "Подтвержденное копирование ключа в demo-интерфейсе",
    after: { maskedApiKey: maskSecret(merchant.apiKey) },
    severity: "WARNING"
  });

  return NextResponse.json({ apiKey: merchant.apiKey, maskedApiKey: maskSecret(merchant.apiKey) });
}
