import { NextResponse } from "next/server";
import {
  DEMO_MERCHANT_COOKIE,
  DEMO_ROLE_COOKIE,
  getDemoSessionFromRequest,
  sanitizeDemoMerchantId,
  sanitizeDemoRole
} from "@/lib/demo-session";
import { apiErrorResponse, readJsonBody } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30
};

export async function GET(request: Request) {
  return NextResponse.json(getDemoSessionFromRequest(request));
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const role = sanitizeDemoRole(body.role ?? body.actorRole);
    const merchantId = sanitizeDemoMerchantId(body.merchantId);

    const response = NextResponse.json({ role, merchantId, source: "cookie" });
    response.cookies.set(DEMO_ROLE_COOKIE, role, cookieOptions);
    response.cookies.set(DEMO_MERCHANT_COOKIE, merchantId, cookieOptions);

    return response;
  } catch (error) {
    return apiErrorResponse(error, "Не удалось сохранить demo-сессию.");
  }
}
