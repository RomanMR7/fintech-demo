-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MERCHANT',
    "merchantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "apiKey" TEXT NOT NULL,
    "callbackUrl" TEXT NOT NULL,
    "payinFeeRate" DECIMAL NOT NULL DEFAULT 0.025,
    "payoutFeeRate" DECIMAL NOT NULL DEFAULT 0.015,
    "trustLimit" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "commissionRate" DECIMAL NOT NULL DEFAULT 0.018,
    "availability" INTEGER NOT NULL DEFAULT 99,
    "testMode" BOOLEAN NOT NULL DEFAULT true,
    "payinAvailable" BOOLEAN NOT NULL DEFAULT true,
    "payoutAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PaymentRequisite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT,
    "providerId" TEXT,
    "type" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "maskedNumber" TEXT NOT NULL,
    "holder" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "dailyLimit" DECIMAL NOT NULL DEFAULT 0,
    "dailyUsed" DECIMAL NOT NULL DEFAULT 0,
    "minAmount" DECIMAL NOT NULL DEFAULT 0,
    "maxAmount" DECIMAL NOT NULL DEFAULT 0,
    "linkedOrders" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentRequisite_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PaymentRequisite_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "providerId" TEXT,
    "requisiteId" TEXT,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "orderType" TEXT NOT NULL DEFAULT 'PAY-IN',
    "providerName" TEXT,
    "commission" DECIMAL NOT NULL DEFAULT 0,
    "platformFee" DECIMAL NOT NULL DEFAULT 0,
    "merchantNet" DECIMAL NOT NULL DEFAULT 0,
    "paymentUrl" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "PaymentOrder_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PaymentOrder_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PaymentOrder_requisiteId_fkey" FOREIGN KEY ("requisiteId") REFERENCES "PaymentRequisite" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "recipient" TEXT NOT NULL,
    "commission" DECIMAL NOT NULL DEFAULT 0,
    "sourceBalance" TEXT NOT NULL DEFAULT 'Доступный баланс',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "Payout_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BalanceAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "amount" DECIMAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BalanceAccount_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BalanceTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "balanceId" TEXT,
    "orderId" TEXT,
    "payoutId" TEXT,
    "appealId" TEXT,
    "type" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "beforeAmount" DECIMAL NOT NULL,
    "afterAmount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BalanceTransaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BalanceTransaction_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "BalanceAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BalanceTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PaymentOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BalanceTransaction_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommissionRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rate" DECIMAL NOT NULL,
    "minAmount" DECIMAL NOT NULL DEFAULT 0,
    "maxAmount" DECIMAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Appeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "authorId" TEXT,
    "assigneeId" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "decision" TEXT,
    "frozenAmount" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    CONSTRAINT "Appeal_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PaymentOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appeal_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appeal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Appeal_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppealComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appealId" TEXT NOT NULL,
    "userId" TEXT,
    "authorRole" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppealComment_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "Appeal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AppealComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "merchantId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorRole" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScenarioState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 0,
    "totalSteps" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_externalId_key" ON "PaymentOrder"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceAccount_merchantId_type_currency_key" ON "BalanceAccount"("merchantId", "type", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioState_key_key" ON "ScenarioState"("key");
