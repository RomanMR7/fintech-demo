"use client";

import { useMemo, useState } from "react";
import { formatMoney, formatRate } from "@/lib/format";

export function CommercialCalculatorClient({ usdRubRate }: { usdRubRate: number | null }) {
  const [payinTurnover, setPayinTurnover] = useState(10000000);
  const [currency, setCurrency] = useState("RUB");
  const [payinFee, setPayinFee] = useState(2.5);
  const [payoutShare, setPayoutShare] = useState(40);
  const [payoutFee, setPayoutFee] = useState(1.5);
  const [riskSavingRate, setRiskSavingRate] = useState(0.4);

  const model = useMemo(() => {
    const payoutTurnover = payinTurnover * (payoutShare / 100);
    const payinRevenue = payinTurnover * (payinFee / 100);
    const payoutRevenue = payoutTurnover * (payoutFee / 100);
    const riskSaving = payinTurnover * (riskSavingRate / 100);
    const monthlyGross = payinRevenue + payoutRevenue + riskSaving;

    return {
      payoutTurnover,
      payinRevenue,
      payoutRevenue,
      riskSaving,
      monthlyGross,
      annualGross: monthlyGross * 12,
      monthlyBaseRub: currency === "USD" && usdRubRate ? monthlyGross * usdRubRate : monthlyGross,
      annualBaseRub: currency === "USD" && usdRubRate ? monthlyGross * usdRubRate * 12 : monthlyGross * 12
    };
  }, [payinTurnover, payinFee, payoutShare, payoutFee, riskSavingRate, currency, usdRubRate]);

  return (
    <div className="card rounded-[1.5rem] p-4 sm:rounded-[1.75rem] sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-jade">Калькулятор экономики</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Сколько может приносить платформа</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-graphite/65">
            Это не финансовая гарантия, а модель для разговора с инвестором или клиентом. Меняйте оборот и комиссии, чтобы быстро показать,
            как выручка зависит от объема платежей, выплат и снижения спорных потерь.
          </p>
        </div>
        <div className="rounded-2xl bg-ink px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Потенциал / месяц</p>
          <p className="mt-1 font-display text-3xl font-semibold">{formatMoney(model.monthlyGross, currency)}</p>
          <p className="mt-2 text-xs leading-5 text-white/60">
            {currency === "USD"
              ? usdRubRate
                ? `Эквивалент: ${formatMoney(model.monthlyBaseRub, "RUB")} по ${formatRate(usdRubRate)} RUB за 1 USD.`
                : "Рублевый эквивалент недоступен: курс USD/RUB не задан."
              : "Модель уже в базовой валюте RUB."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm font-semibold">
            Валюта модели
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 font-normal outline-none transition focus:border-jade"
            >
              <option value="RUB">RUB — рублевая модель</option>
              <option value="USD">USD — долларовая модель</option>
            </select>
          </label>
          <NumberField label="Оборот приема в месяц" suffix={currency} value={payinTurnover} min={1000} step={currency === "USD" ? 1000 : 500000} onChange={setPayinTurnover} />
          <NumberField label="Комиссия приема" suffix="%" value={payinFee} min={0.1} step={0.1} onChange={setPayinFee} />
          <NumberField label="Доля выплат от оборота" suffix="%" value={payoutShare} min={0} step={5} onChange={setPayoutShare} />
          <NumberField label="Комиссия выплат" suffix="%" value={payoutFee} min={0} step={0.1} onChange={setPayoutFee} />
          <NumberField label="Эффект снижения спорных потерь" suffix="%" value={riskSavingRate} min={0} step={0.1} onChange={setRiskSavingRate} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ResultCard label="Комиссия приема" value={formatMoney(model.payinRevenue, currency)} hint={`${formatMoney(payinTurnover, currency)} × ${payinFee}%`} />
          <ResultCard label="Комиссия выплат" value={formatMoney(model.payoutRevenue, currency)} hint={`${formatMoney(model.payoutTurnover, currency)} × ${payoutFee}%`} />
          <ResultCard label="Снижение потерь" value={formatMoney(model.riskSaving, currency)} hint={`Оценочный эффект ${riskSavingRate}% от оборота`} />
          <ResultCard label="Потенциал / год" value={formatMoney(model.annualGross, currency)} hint="Месячная модель × 12" accent />
          {currency === "USD" ? (
            <ResultCard
              label="Эквивалент / год"
              value={usdRubRate ? formatMoney(model.annualBaseRub, "RUB") : "курс не задан"}
              hint={usdRubRate ? `Пересчет по ${formatRate(usdRubRate)} RUB за 1 USD` : "Обновите курс на странице «Курсы валют»"}
              accent
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  suffix,
  value,
  min,
  step,
  onChange
}: {
  label: string;
  suffix: string;
  value: number;
  min: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      {label}
      <div className="flex items-center overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-insetSoft">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 font-normal outline-none"
        />
        <span className="border-l border-ink/10 px-4 py-3 text-graphite/55">{suffix}</span>
      </div>
    </label>
  );
}

function ResultCard({ label, value, hint, accent = false }: { label: string; value: string; hint: string; accent?: boolean }) {
  return (
    <div className={`rounded-[1.5rem] border p-4 ${accent ? "border-jade/25 bg-jade/10" : "border-ink/10 bg-white/65"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-graphite/45">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-5 text-graphite/60">{hint}</p>
    </div>
  );
}
