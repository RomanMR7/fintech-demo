import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { EventType, UserRole } from "@/lib/constants";
import { maskSecret } from "@/lib/security";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const actorRole = String(body.actorRole ?? UserRole.MERCHANT);

  if (!can(actorRole, "apiKey:view")) {
    return NextResponse.json({ error: "Недостаточно прав для просмотра API key." }, { status: 403 });
  }

  if (body.confirmed !== true) {
    return NextResponse.json({ error: "Подтвердите просмотр API key в sandbox." }, { status: 422 });
  }

  const merchant = await prisma.merchant.findUnique({ where: { id } });
  if (!merchant) return NextResponse.json({ error: "Мерчант не найден." }, { status: 404 });

  await writeAuditLog({
    actorRole,
    actorName: actorRole === UserRole.MERCHANT ? merchant.displayName : "Demo operator",
    type: EventType.API_KEY_VIEWED,
    entityType: "Merchant",
    entityId: merchant.id,
    title: "API key просмотрен",
    description: `В sandbox был раскрыт API key мерчанта ${merchant.displayName}.`,
    reason: "Подтвержденный просмотр ключа в demo-интерфейсе",
    after: { maskedApiKey: maskSecret(merchant.apiKey) },
    severity: "WARNING"
  });

  return NextResponse.json({ apiKey: merchant.apiKey, maskedApiKey: maskSecret(merchant.apiKey) });
}
