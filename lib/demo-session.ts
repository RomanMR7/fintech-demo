import { UserRole, type UserRoleValue } from "@/lib/constants";
import { defaultMerchantId } from "@/lib/roles";

export const DEMO_ROLE_COOKIE = "demo-role";
export const DEMO_MERCHANT_COOKIE = "demo-merchant-id";

const validRoles = new Set<string>(Object.values(UserRole));
const merchantIdPattern = /^[a-zA-Z0-9_-]{3,96}$/;

export type DemoSessionSource = "cookie" | "body-fallback" | "default";

export type DemoRequestActor = {
  role: UserRoleValue;
  merchantId: string;
  source: DemoSessionSource;
};

export function sanitizeDemoRole(value: unknown, fallback: UserRoleValue = UserRole.VIEWER): UserRoleValue {
  const candidate = typeof value === "string" ? value.trim() : "";
  return validRoles.has(candidate) ? (candidate as UserRoleValue) : fallback;
}

export function sanitizeDemoMerchantId(value: unknown, fallback: string = defaultMerchantId) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return merchantIdPattern.test(candidate) ? candidate : fallback;
}

export function parseCookieHeader(cookieHeader: string | null) {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  for (const part of cookieHeader.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (!key) continue;

    try {
      cookies.set(key, decodeURIComponent(value));
    } catch {
      cookies.set(key, value);
    }
  }

  return cookies;
}

export function getDemoSessionFromRequest(request: Request): DemoRequestActor {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const cookieRole = cookies.get(DEMO_ROLE_COOKIE);
  const cookieMerchantId = cookies.get(DEMO_MERCHANT_COOKIE);
  const hasSessionCookie = Boolean(cookieRole || cookieMerchantId);

  return {
    role: sanitizeDemoRole(cookieRole),
    merchantId: sanitizeDemoMerchantId(cookieMerchantId),
    source: hasSessionCookie ? "cookie" : "default"
  };
}

export function resolveRequestActor(
  request: Request,
  body: Record<string, unknown> = {},
  fallbackRole: UserRoleValue = UserRole.VIEWER
): DemoRequestActor {
  const cookieSession = getDemoSessionFromRequest(request);
  if (cookieSession.source === "cookie") return cookieSession;

  const bodyRole = body.actorRole ?? body.role;
  const bodyMerchantId = body.merchantId;
  const hasBodySession = Boolean(bodyRole || bodyMerchantId);

  return {
    role: sanitizeDemoRole(bodyRole, fallbackRole),
    merchantId: sanitizeDemoMerchantId(bodyMerchantId),
    source: hasBodySession ? "body-fallback" : "default"
  };
}

export function canAccessMerchant(actor: Pick<DemoRequestActor, "role" | "merchantId">, merchantId: string) {
  return actor.role !== UserRole.MERCHANT || actor.merchantId === merchantId;
}
