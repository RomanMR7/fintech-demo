import assert from "node:assert/strict";
import {
  canAccessMerchant,
  getDemoSessionFromRequest,
  parseCookieHeader,
  resolveRequestActor,
  sanitizeDemoMerchantId,
  sanitizeDemoRole
} from "../lib/demo-session";
import { UserRole } from "../lib/constants";
import { defaultMerchantId } from "../lib/roles";

const cookieRequest = new Request("http://localhost/api/orders", {
  headers: {
    cookie: "demo-role=OPERATOR; demo-merchant-id=merchant-nova"
  }
});

const cookieSession = getDemoSessionFromRequest(cookieRequest);
assert.equal(cookieSession.role, UserRole.OPERATOR);
assert.equal(cookieSession.merchantId, "merchant-nova");
assert.equal(cookieSession.source, "cookie");

const cookieWins = resolveRequestActor(cookieRequest, {
  actorRole: UserRole.MERCHANT,
  merchantId: "merchant-orbita"
});
assert.equal(cookieWins.role, UserRole.OPERATOR);
assert.equal(cookieWins.merchantId, "merchant-nova");

const bodyFallback = resolveRequestActor(new Request("http://localhost/api/orders"), {
  actorRole: UserRole.FINANCE_MANAGER,
  merchantId: "merchant-sigma"
});
assert.equal(bodyFallback.role, UserRole.FINANCE_MANAGER);
assert.equal(bodyFallback.merchantId, "merchant-sigma");
assert.equal(bodyFallback.source, "body-fallback");

const invalidSession = resolveRequestActor(new Request("http://localhost/api/orders"), {
  actorRole: "OWNER",
  merchantId: "../bad"
});
assert.equal(invalidSession.role, UserRole.VIEWER);
assert.equal(invalidSession.merchantId, defaultMerchantId);

assert.equal(sanitizeDemoRole("PLATFORM_ADMIN"), UserRole.PLATFORM_ADMIN);
assert.equal(sanitizeDemoRole("UNKNOWN"), UserRole.VIEWER);
assert.equal(sanitizeDemoMerchantId("merchant-long-safe_123"), "merchant-long-safe_123");
assert.equal(sanitizeDemoMerchantId(""), defaultMerchantId);

const parsedCookies = parseCookieHeader("demo-role=MERCHANT; weird=%E0%A4%A");
assert.equal(parsedCookies.get("demo-role"), UserRole.MERCHANT);
assert.equal(parsedCookies.get("weird"), "%E0%A4%A");

assert.equal(canAccessMerchant({ role: UserRole.MERCHANT, merchantId: "merchant-orbita" }, "merchant-orbita"), true);
assert.equal(canAccessMerchant({ role: UserRole.MERCHANT, merchantId: "merchant-orbita" }, "merchant-nova"), false);
assert.equal(canAccessMerchant({ role: UserRole.PLATFORM_ADMIN, merchantId: "merchant-orbita" }, "merchant-nova"), true);

console.log("Demo session guard tests passed");

