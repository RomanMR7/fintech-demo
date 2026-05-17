import { NextResponse } from "next/server";
import { adjustMerchantBalance } from "@/lib/domain";
import { UserRole } from "@/lib/constants";
import { can } from "@/lib/rbac";
import { assertSandbox2fa, requireReason } from "@/lib/security";
import { resolveRequestActor } from "@/lib/demo-session";
import { apiErrorResponse, readJsonBody } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

const balanceOperations = ["credit_available", "debit_available", "freeze", "unfreeze", "credit_fees", "debit_fees"] as const;
type BalanceAdjustmentOperation = (typeof balanceOperations)[number];

function requiresLargeBalance2fa(amount: number, currency: string) {
  if (currency === "USD") return amount >= 1000;
  return amount >= 100000;
}

function parseBalanceOperation(value: unknown): BalanceAdjustmentOperation {
  if (typeof value === "string" && balanceOperations.includes(value as BalanceAdjustmentOperation)) {
    return value as BalanceAdjustmentOperation;
  }

  throw new Error("Некорректный тип корректировки баланса.");
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const actorRole = resolveRequestActor(request, body, UserRole.VIEWER).role;
    const amount = Number(body.amount ?? 0);
    const currency = body.currency ? String(body.currency) : "RUB";
    const operation = parseBalanceOperation(body.operation);
    const description = requireReason(body.description, "description");

    if (!can(actorRole, "balance:adjust")) {
      return NextResponse.json({ error: "Недостаточно прав для ручной корректировки баланса." }, { status: 403 });
    }

    if (requiresLargeBalance2fa(amount, currency)) {
      assertSandbox2fa(body.code);
    }

    const balances = await adjustMerchantBalance({
      merchantId: String(body.merchantId ?? ""),
      operation,
      amount,
      currency,
      description
    });

    return NextResponse.json(balances);
  } catch (error) {
    console.error("Balance adjustment failed", error);
    return apiErrorResponse(error, "Не удалось изменить баланс.");
  }
}
