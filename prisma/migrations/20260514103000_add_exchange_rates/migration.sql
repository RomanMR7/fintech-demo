-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baseCurrency" TEXT NOT NULL DEFAULT 'RUB',
    "quoteCurrency" TEXT NOT NULL,
    "rate" DECIMAL NOT NULL,
    "nominal" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT NOT NULL DEFAULT 'CBR',
    "sourceUrl" TEXT,
    "sourceDate" DATETIME NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "staleAfter" DATETIME,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_baseCurrency_quoteCurrency_sourceDate_source_key" ON "ExchangeRate"("baseCurrency", "quoteCurrency", "sourceDate", "source");

-- CreateIndex
CREATE INDEX "ExchangeRate_baseCurrency_quoteCurrency_sourceDate_idx" ON "ExchangeRate"("baseCurrency", "quoteCurrency", "sourceDate");
