import { Prisma } from "@prisma/client";

import { normalizeCurrency, type SupportedCurrency } from "./currency";
import { prisma } from "./prisma";

export const BASE_CURRENCY: SupportedCurrency = "RUB";
export const CBR_DAILY_RATES_URL = "https://www.cbr.ru/scripts/XML_daily.asp";
export const FALLBACK_USD_RUB_RATE = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

export type ExchangeRateView = {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  nominal: number;
  source: string;
  sourceUrl: string | null;
  sourceDate: Date;
  fetchedAt: Date;
  staleAfter: Date | null;
  isManual: boolean;
  note: string | null;
};

export type FxSnapshot = {
  baseCurrency: SupportedCurrency;
  rates: ExchangeRateView[];
  usdRubRate: number | null;
  usdRate: ExchangeRateView | null;
  isStale: boolean;
  warning: string | null;
};

export type MoneyBreakdown = Partial<Record<SupportedCurrency, number>>;

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return 0;
}

function toExchangeRateView(rate: {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: Prisma.Decimal | number | string;
  nominal: number;
  source: string;
  sourceUrl: string | null;
  sourceDate: Date;
  fetchedAt: Date;
  staleAfter: Date | null;
  isManual: boolean;
  note: string | null;
}): ExchangeRateView {
  return {
    ...rate,
    rate: toNumber(rate.rate)
  };
}

function parseCbrDate(value: string | undefined) {
  if (!value) return new Date();
  const [day, month, year] = value.split(".").map(Number);
  if (!day || !month || !year) return new Date();
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function extractTag(block: string, tag: string) {
  return block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1]?.trim() ?? "";
}

export function parseCbrUsdRubRate(xml: string) {
  const sourceDate = parseCbrDate(xml.match(/<ValCurs[^>]*Date="([^"]+)"/)?.[1]);
  const valuteBlocks = [...xml.matchAll(/<Valute\b[\s\S]*?<\/Valute>/g)].map((match) => match[0]);
  const usdBlock = valuteBlocks.find((block) => extractTag(block, "CharCode") === "USD");
  if (!usdBlock) throw new Error("В ответе ЦБ РФ не найден курс USD.");

  const nominal = Number(extractTag(usdBlock, "Nominal")) || 1;
  const value = Number(extractTag(usdBlock, "Value").replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) throw new Error("ЦБ РФ вернул некорректное значение курса USD.");

  return {
    baseCurrency: BASE_CURRENCY,
    quoteCurrency: "USD" as SupportedCurrency,
    rate: value / nominal,
    nominal,
    source: "CBR",
    sourceUrl: CBR_DAILY_RATES_URL,
    sourceDate,
    fetchedAt: new Date(),
    staleAfter: new Date(sourceDate.getTime() + 3 * DAY_MS),
    isManual: false,
    note: "Официальный справочный курс Банка России для демо-пересчета."
  };
}

export async function fetchCbrUsdRubRate() {
  const response = await fetch(CBR_DAILY_RATES_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`ЦБ РФ вернул HTTP ${response.status}.`);
  const xml = await response.text();
  return parseCbrUsdRubRate(xml);
}

export async function refreshCbrUsdRubRate() {
  const payload = await fetchCbrUsdRubRate();
  const rate = await prisma.exchangeRate.upsert({
    where: {
      baseCurrency_quoteCurrency_sourceDate_source: {
        baseCurrency: payload.baseCurrency,
        quoteCurrency: payload.quoteCurrency,
        sourceDate: payload.sourceDate,
        source: payload.source
      }
    },
    update: {
      rate: payload.rate,
      nominal: payload.nominal,
      sourceUrl: payload.sourceUrl,
      fetchedAt: payload.fetchedAt,
      staleAfter: payload.staleAfter,
      isManual: payload.isManual,
      note: payload.note
    },
    create: payload
  });

  return toExchangeRateView(rate);
}

export async function seedFallbackUsdRubRate() {
  const sourceDate = new Date();
  sourceDate.setUTCHours(12, 0, 0, 0);

  const rate = await prisma.exchangeRate.upsert({
    where: {
      baseCurrency_quoteCurrency_sourceDate_source: {
        baseCurrency: BASE_CURRENCY,
        quoteCurrency: "USD",
        sourceDate,
        source: "DEMO_FALLBACK"
      }
    },
    update: {
      rate: FALLBACK_USD_RUB_RATE,
      fetchedAt: new Date(),
      staleAfter: new Date(Date.now() - DAY_MS),
      isManual: true,
      note: "Резервный демо-курс. Нажмите обновление курса, чтобы получить актуальный курс ЦБ РФ."
    },
    create: {
      baseCurrency: BASE_CURRENCY,
      quoteCurrency: "USD",
      rate: FALLBACK_USD_RUB_RATE,
      nominal: 1,
      source: "DEMO_FALLBACK",
      sourceUrl: CBR_DAILY_RATES_URL,
      sourceDate,
      fetchedAt: new Date(),
      staleAfter: new Date(Date.now() - DAY_MS),
      isManual: true,
      note: "Резервный демо-курс. Нажмите обновление курса, чтобы получить актуальный курс ЦБ РФ."
    }
  });

  return toExchangeRateView(rate);
}

export async function saveManualUsdRubRate(rateValue: number, note?: string) {
  if (!Number.isFinite(rateValue) || rateValue <= 0) {
    throw new Error("Курс USD/RUB должен быть положительным числом.");
  }

  const sourceDate = new Date();
  sourceDate.setUTCHours(12, 0, 0, 0);

  const rate = await prisma.exchangeRate.upsert({
    where: {
      baseCurrency_quoteCurrency_sourceDate_source: {
        baseCurrency: BASE_CURRENCY,
        quoteCurrency: "USD",
        sourceDate,
        source: "MANUAL"
      }
    },
    update: {
      rate: rateValue,
      fetchedAt: new Date(),
      staleAfter: new Date(Date.now() + 3 * DAY_MS),
      isManual: true,
      note: note?.trim() || "Курс задан вручную для демонстрации."
    },
    create: {
      baseCurrency: BASE_CURRENCY,
      quoteCurrency: "USD",
      rate: rateValue,
      nominal: 1,
      source: "MANUAL",
      sourceUrl: CBR_DAILY_RATES_URL,
      sourceDate,
      fetchedAt: new Date(),
      staleAfter: new Date(Date.now() + 3 * DAY_MS),
      isManual: true,
      note: note?.trim() || "Курс задан вручную для демонстрации."
    }
  });

  return toExchangeRateView(rate);
}

export async function getLatestExchangeRates() {
  const rates = await prisma.exchangeRate.findMany({
    orderBy: [{ quoteCurrency: "asc" }, { fetchedAt: "desc" }]
  });

  const latestByQuote = new Map<string, ExchangeRateView>();
  const sourcePriority: Record<string, number> = {
    MANUAL: 3,
    CBR: 2,
    DEMO_FALLBACK: 1
  };

  rates
    .map(toExchangeRateView)
    .sort((left, right) => {
      const leftFresh = left.staleAfter ? left.staleAfter.getTime() >= Date.now() : true;
      const rightFresh = right.staleAfter ? right.staleAfter.getTime() >= Date.now() : true;
      if (leftFresh !== rightFresh) return leftFresh ? -1 : 1;

      const sourceDiff = (sourcePriority[right.source] ?? 0) - (sourcePriority[left.source] ?? 0);
      if (sourceDiff !== 0) return sourceDiff;

      const sourceDateDiff = right.sourceDate.getTime() - left.sourceDate.getTime();
      if (sourceDateDiff !== 0) return sourceDateDiff;

      return right.fetchedAt.getTime() - left.fetchedAt.getTime();
    })
    .forEach((rate) => {
      if (!latestByQuote.has(rate.quoteCurrency)) {
        latestByQuote.set(rate.quoteCurrency, rate);
      }
    });

  return [...latestByQuote.values()];
}

export async function getFxSnapshot(): Promise<FxSnapshot> {
  const rates = await getLatestExchangeRates();
  const usdRate = rates.find((rate) => rate.baseCurrency === BASE_CURRENCY && rate.quoteCurrency === "USD") ?? null;
  const isStale = !usdRate || (usdRate.staleAfter ? usdRate.staleAfter.getTime() < Date.now() : Date.now() - usdRate.fetchedAt.getTime() > 3 * DAY_MS);

  return {
    baseCurrency: BASE_CURRENCY,
    rates,
    usdRubRate: usdRate?.rate ?? null,
    usdRate,
    isStale,
    warning: isStale ? "Курс требует обновления. Для точного показа нажмите «Обновить курс ЦБ РФ»." : null
  };
}

export function convertMoneyToBase(amount: unknown, currencyInput: unknown, fx: Pick<FxSnapshot, "usdRubRate">) {
  const amountNumber = toNumber(amount);
  const currency = normalizeCurrency(currencyInput);
  if (currency === BASE_CURRENCY) return amountNumber;
  if (!fx.usdRubRate) return null;
  return amountNumber * fx.usdRubRate;
}

export function convertCurrency(amount: unknown, fromCurrencyInput: unknown, toCurrencyInput: unknown, fx: Pick<FxSnapshot, "usdRubRate"> = { usdRubRate: FALLBACK_USD_RUB_RATE }) {
  const amountNumber = toNumber(amount);
  if (!Number.isFinite(amountNumber)) return 0;

  const fromCurrency = normalizeCurrency(fromCurrencyInput);
  const toCurrency = normalizeCurrency(toCurrencyInput);
  const usdRubRate = fx.usdRubRate && fx.usdRubRate > 0 ? fx.usdRubRate : FALLBACK_USD_RUB_RATE;

  if (fromCurrency === toCurrency) return amountNumber;
  if (fromCurrency === "USD" && toCurrency === "RUB") return amountNumber * usdRubRate;
  if (fromCurrency === "RUB" && toCurrency === "USD") return amountNumber / usdRubRate;

  return amountNumber;
}

export function convertBreakdownToBase(totals: MoneyBreakdown, fx: Pick<FxSnapshot, "usdRubRate">) {
  const rub = toNumber(totals.RUB ?? 0);
  const usd = toNumber(totals.USD ?? 0);
  if (usd !== 0 && !fx.usdRubRate) return null;
  return rub + usd * (fx.usdRubRate ?? 0);
}
