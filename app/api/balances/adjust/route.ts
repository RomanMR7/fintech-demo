import { NextResponse } from "next/server";
import { adjustMerchantBalance } from "@/lib/domain";
import { UserRole } from "@/lib/constants";
import { can } from "@/lib/rbac";
import { assertSandbox2fa, requireReason } from "@/lib/security";

export const dynamic = "force-dynamic";

function requiresLargeBalance2fa(amount: number, currency: string) {
  if (currency === "USD") return amount >= 1000;
  return amount >= 100000;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actorRole = String(body.actorRole ?? UserRole.VIEWER);
    const amount = Number(body.amount ?? 0);
    const currency = body.currency ? String(body.currency) : "RUB";
    const description = requireReason(body.description, "description");

    if (!can(actorRole, "balance:adjust")) {
      return NextResponse.json({ error: "Недостаточно прав для ручной корректировки баланса." }, { status: 403 });
    }

    if (requiresLargeBalance2fa(amount, currency)) {
      assertSandbox2fa(body.code);
    }

    const balances = await adjustMerchantBalance({
      merchantId: String(body.merchantId ?? ""),
      operation: body.operation,
      amount,
      currency,
      description
    });

    return NextResponse.json(balances);
  } catch (error) {
    console.error("Balance adjustment failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось изменить баланс." },
      { status: 400 }
    );
  }
}
