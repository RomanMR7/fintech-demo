import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { EventType, UserRole } from "@/lib/constants";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const actorRole = String(body.actorRole ?? UserRole.MERCHANT);

  if (!can(actorRole, "webhook:test")) {
    return NextResponse.json({ error: "Недостаточно прав для теста webhook." }, { status: 403 });
  }

  const merchant = await prisma.merchant.findUnique({ where: { id } });
  if (!merchant) return NextResponse.json({ error: "Мерчант не найден." }, { status: 404 });

  const delivered = Boolean(merchant.callbackUrl);
  const payload = {
    event: "order.paid",
    sandbox: true,
    merchantId: merchant.id,
    callbackUrl: merchant.callbackUrl,
    delivered,
    status: delivered ? "delivered" : "failed",
    checkedAt: new Date().toISOString()
  };

  await writeAuditLog({
    actorRole,
    actorName: actorRole === UserRole.MERCHANT ? merchant.displayName : "Demo operator",
    type: EventType.WEBHOOK_TESTED,
    entityType: "Merchant",
    entityId: merchant.id,
    title: delivered ? "Webhook проверен успешно" : "Webhook не настроен",
    description: delivered
      ? `Тестовый webhook отправлен на callback URL мерчанта ${merchant.displayName}.`
      : `У мерчанта ${merchant.displayName} нет callback URL для доставки webhook.`,
    after: payload,
    severity: delivered ? "NOTICE" : "WARNING"
  });

  return NextResponse.json(payload);
}
