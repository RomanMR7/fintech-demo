-- Add operational indexes for merchant-scoped dashboards, queues, audit feeds,
-- and ledger history. These are read-path optimizations only.

CREATE INDEX "User_merchantId_idx" ON "User"("merchantId");
CREATE INDEX "User_role_idx" ON "User"("role");

CREATE INDEX "Merchant_displayName_idx" ON "Merchant"("displayName");
CREATE INDEX "Merchant_status_idx" ON "Merchant"("status");

CREATE INDEX "Provider_displayName_idx" ON "Provider"("displayName");
CREATE INDEX "Provider_status_idx" ON "Provider"("status");
CREATE INDEX "Provider_availability_idx" ON "Provider"("availability");

CREATE INDEX "PaymentRequisite_merchantId_status_idx" ON "PaymentRequisite"("merchantId", "status");
CREATE INDEX "PaymentRequisite_providerId_idx" ON "PaymentRequisite"("providerId");
CREATE INDEX "PaymentRequisite_status_createdAt_idx" ON "PaymentRequisite"("status", "createdAt");

CREATE INDEX "PaymentOrder_merchantId_createdAt_idx" ON "PaymentOrder"("merchantId", "createdAt");
CREATE INDEX "PaymentOrder_merchantId_status_idx" ON "PaymentOrder"("merchantId", "status");
CREATE INDEX "PaymentOrder_status_updatedAt_idx" ON "PaymentOrder"("status", "updatedAt");
CREATE INDEX "PaymentOrder_createdAt_idx" ON "PaymentOrder"("createdAt");

CREATE INDEX "Payout_merchantId_createdAt_idx" ON "Payout"("merchantId", "createdAt");
CREATE INDEX "Payout_merchantId_status_idx" ON "Payout"("merchantId", "status");
CREATE INDEX "Payout_status_updatedAt_idx" ON "Payout"("status", "updatedAt");
CREATE INDEX "Payout_createdAt_idx" ON "Payout"("createdAt");

CREATE INDEX "BalanceTransaction_merchantId_createdAt_idx" ON "BalanceTransaction"("merchantId", "createdAt");
CREATE INDEX "BalanceTransaction_balanceId_createdAt_idx" ON "BalanceTransaction"("balanceId", "createdAt");
CREATE INDEX "BalanceTransaction_orderId_idx" ON "BalanceTransaction"("orderId");
CREATE INDEX "BalanceTransaction_payoutId_idx" ON "BalanceTransaction"("payoutId");
CREATE INDEX "BalanceTransaction_appealId_idx" ON "BalanceTransaction"("appealId");

CREATE INDEX "CommissionRule_type_idx" ON "CommissionRule"("type");
CREATE INDEX "CommissionRule_active_idx" ON "CommissionRule"("active");

CREATE INDEX "Appeal_merchantId_status_idx" ON "Appeal"("merchantId", "status");
CREATE INDEX "Appeal_status_updatedAt_idx" ON "Appeal"("status", "updatedAt");
CREATE INDEX "Appeal_orderId_idx" ON "Appeal"("orderId");
CREATE INDEX "Appeal_createdAt_idx" ON "Appeal"("createdAt");

CREATE INDEX "AppealComment_appealId_createdAt_idx" ON "AppealComment"("appealId", "createdAt");

CREATE INDEX "Notification_role_createdAt_idx" ON "Notification"("role", "createdAt");
CREATE INDEX "Notification_merchantId_createdAt_idx" ON "Notification"("merchantId", "createdAt");
CREATE INDEX "Notification_read_createdAt_idx" ON "Notification"("read", "createdAt");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

CREATE INDEX "EventLog_createdAt_idx" ON "EventLog"("createdAt");
CREATE INDEX "EventLog_type_createdAt_idx" ON "EventLog"("type", "createdAt");
CREATE INDEX "EventLog_entityType_entityId_idx" ON "EventLog"("entityType", "entityId");
CREATE INDEX "EventLog_actorRole_createdAt_idx" ON "EventLog"("actorRole", "createdAt");
