"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateCommercialModel, clampNumber, COMMERCIAL_LIMITS, parseNumericInput } from "@/lib/commercial-model";
import { formatMoney, formatRate } from "@/lib/format";

export function CommercialCalculatorClient({ usdRubRate }: { usdRubRate: number | null }) {
  const [payinTurnover, setPayinTurnover] = useState(10000000);
  const [currency, setCurrency] = useState("RUB");
  const [payinFee, setPayinFee] = useState(2.5);
  const [payoutShare, setPayoutShare] = useState(40);
  const [payoutFee, setPayoutFee] = useState(1.5);
  const [riskSavingRate, setRiskSavingRate] = useState(0.4);
  const [providerFeeRate, setProviderFeeRate] = useState(0.9);
  const [operatingCostRate, setOperatingCostRate] = useState(0.35);
  const [disputeLossRate, setDisputeLossRate] = useState(0.15);

  const model = useMemo(
    () =>
      calculateCommercialModel({
        acquiringVolume: payinTurnover,
        acquiringFeePercent: payinFee,
        payoutSharePercent: payoutShare,
        payoutFeePercent: payoutFee,
        lossReductionPercent: riskSavingRate,
        providerFeePercent: providerFeeRate,
        operationalCostPercent: operatingCostRate,
        riskLossPercent: disputeLossRate
      }),
    [payinTurnover, payinFee, payoutShare, payoutFee, riskSavingRate, providerFeeRate, operatingCostRate, disputeLossRate]
  );
  const monthlyBaseRub = currency === "USD" && usdRubRate ? model.grossRevenue * usdRubRate : model.grossRevenue;
  const annualBaseRub = currency === "USD" && usdRubRate ? model.grossRevenueYearly * usdRubRate : model.grossRevenueYearly;

  const presets = [
    { label: "Малый мерчант", turnover: 2500000, payin: 2.8, payoutShare: 35, payout: 1.6, risk: 0.25, provider: 1.05, ops: 0.45, loss: 0.2 },
    { label: "Средний PSP", turnover: 18000000, payin: 2.3, payoutShare: 48, payout: 1.3, risk: 0.35, provider: 0.85, ops: 0.32, loss: 0.16 },
    { label: "Enterprise", turnover: 85000000, payin: 1.7, payoutShare: 55, payout: 0.9, risk: 0.18, provider: 0.62, ops: 0.22, loss: 0.08 },
    { label: "High-risk", turnover: 12000000, payin: 4.2, payoutShare: 60, payout: 2.1, risk: 0.8, provider: 1.7, ops: 0.65, loss: 0.55 }
  ];

  function applyPreset(preset: (typeof presets)[number]) {
    setPayinTurnover(preset.turnover);
    setPayinFee(preset.payin);
    setPayoutShare(preset.payoutShare);
    setPayoutFee(preset.payout);
    setRiskSavingRate(preset.risk);
    setProviderFeeRate(preset.provider);
    setOperatingCostRate(preset.ops);
    setDisputeLossRate(preset.loss);
  }

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
        <div className="dark-panel rounded-2xl px-5 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Потенциал / месяц</p>
          <p className="mt-1 font-display text-3xl font-semibold">{formatMoney(model.grossRevenue, currency)}</p>
          <p className="mt-2 text-xs leading-5 text-white/60">
            {currency === "USD"
              ? usdRubRate
                ? `Эквивалент: ${formatMoney(monthlyBaseRub, "RUB")} по ${formatRate(usdRubRate)} RUB за 1 USD.`
                : "Рублевый эквивалент недоступен: курс USD/RUB не задан."
              : "Модель уже в базовой валюте RUB."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {presets.map((preset) => (
              <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="btn btn-secondary btn-sm focus-ring justify-center">
                {preset.label}
              </button>
            ))}
          </div>
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
          <NumberField label="Оборот приема в месяц" suffix={currency} value={payinTurnover} min={COMMERCIAL_LIMITS.acquiringVolume.min} max={COMMERCIAL_LIMITS.acquiringVolume.max} step={currency === "USD" ? 1000 : 500000} helper="Можно стереть поле, вставить крупную сумму или ввести 0. Расчет использует последнее корректное значение, а финальная проверка происходит при выходе из поля." onChange={setPayinTurnover} />
          <NumberField label="Комиссия приема" suffix="%" value={payinFee} min={0} max={100} step={0.1} helper="Формула: оборот приема × комиссия приема." warning={payinFee > COMMERCIAL_LIMITS.feeWarningPercent ? "Выше 10%: проверьте реалистичность тарифа." : undefined} onChange={setPayinFee} />
          <NumberField label="Доля выплат от оборота" suffix="%" value={payoutShare} min={0} max={100} step={5} helper="Определяет объем payout-операций." onChange={setPayoutShare} />
          <NumberField label="Комиссия выплат" suffix="%" value={payoutFee} min={0} max={100} step={0.1} helper="Формула: объем выплат × комиссия выплат." warning={payoutFee > COMMERCIAL_LIMITS.feeWarningPercent ? "Выше 10%: проверьте реалистичность тарифа." : undefined} onChange={setPayoutFee} />
          <NumberField label="Эффект снижения спорных потерь" suffix="%" value={riskSavingRate} min={0} max={100} step={0.1} helper="Управленческая оценка эффекта от risk/dispute tooling." onChange={setRiskSavingRate} />
          <NumberField label="Комиссия provider" suffix="%" value={providerFeeRate} min={0} max={100} step={0.1} helper="Оценочная себестоимость платежных провайдеров." onChange={setProviderFeeRate} />
          <NumberField label="Операционные расходы" suffix="%" value={operatingCostRate} min={0} max={100} step={0.05} helper="Support, ops, инфраструктура и ручная обработка." onChange={setOperatingCostRate} />
          <NumberField label="Risk / dispute loss" suffix="%" value={disputeLossRate} min={0} max={100} step={0.05} helper="Оценка потерь от споров, fraud и ошибок." onChange={setDisputeLossRate} />
          {model.warnings.length ? (
            <div className="rounded-2xl border border-brass/25 bg-brass/10 px-4 py-3 text-sm font-semibold leading-6 text-brass">
              {model.warnings.join(" ")}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ResultCard label="Комиссия приема" value={formatMoney(model.acquiringFeeRevenue, currency)} hint={`${formatMoney(model.acquiringVolume, currency)} × ${model.acquiringFeePercent}%`} />
          <ResultCard label="Комиссия выплат" value={formatMoney(model.payoutFeeRevenue, currency)} hint={`${formatMoney(model.payoutVolume, currency)} × ${model.payoutFeePercent}%`} />
          <ResultCard label="Снижение потерь" value={formatMoney(model.lossReductionEffect, currency)} hint={`Оценочный эффект ${model.lossReductionPercent}% от оборота`} />
          <ResultCard label="Потенциал / год" value={formatMoney(model.grossRevenueYearly, currency)} hint={`Валовая выручка / месяц × 12. Gross take rate: ${formatRate(model.grossTakeRate)}%`} accent />
          <ResultCard label="Комиссия provider" value={formatMoney(model.providerCost, currency)} hint={`${formatMoney(payinTurnover, currency)} × ${providerFeeRate}%`} />
          <ResultCard label="Операционные расходы" value={formatMoney(model.operationalCost, currency)} hint={`${formatMoney(model.acquiringVolume, currency)} × ${model.operationalCostPercent}%`} />
          <ResultCard label="Risk / dispute loss" value={formatMoney(model.riskLoss, currency)} hint={`${formatMoney(model.acquiringVolume, currency)} × ${model.riskLossPercent}%`} />
          <ResultCard label="Чистая маржа / месяц" value={formatMoney(model.netMarginMonthly, currency)} hint={`Take rate после расходов: ${formatRate(model.takeRateAfterCosts)}%`} accent={model.netMarginMonthly > 0} />
          <ResultCard label="Чистая маржа / год" value={formatMoney(model.netMarginYearly, currency)} hint="Чистая маржа × 12. Не является обещанием доходности." accent={model.netMarginMonthly > 0} />
          <ResultCard label="Break-even" value={model.breakEvenStatus ? "Положительная маржа" : "Маржа ниже нуля"} hint={`Считается честно: net margin / месяц ${model.breakEvenStatus ? ">" : "≤"} 0.`} accent={model.breakEvenStatus} />
          {currency === "USD" ? (
            <ResultCard
              label="Эквивалент / год"
              value={usdRubRate ? formatMoney(annualBaseRub, "RUB") : "курс не задан"}
              hint={usdRubRate ? `Пересчет по ${formatRate(usdRubRate)} RUB за 1 USD` : "Обновите курс на странице «Курсы валют»"}
              accent
            />
          ) : null}
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-ink/10 bg-white/55 p-4 shadow-insetSoft">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow">Как считается модель</p>
            <h3 className="card-title mt-2 text-ink">Формулы разделяют выручку, расходы и чистую маржу</h3>
          </div>
          <span className="pill bg-brass/10 text-brass">Demo assumptions</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FormulaRow title="Monthly gross revenue" value="Acquiring fee revenue + Payout fee revenue + Loss reduction effect" />
          <FormulaRow title="Total monthly costs" value="Provider cost + Operational cost + Risk / dispute loss" />
          <FormulaRow title="Net monthly margin" value="Gross revenue - Total costs" />
          <FormulaRow title="Take rate after costs" value="Net monthly margin / Acquiring volume" />
        </div>
        <p className="mt-4 text-sm leading-6 text-graphite/68">
          Все значения являются демонстрационными assumptions и не являются гарантией доходности. Если расходы и risk-loss выше валовой выручки, модель честно показывает отрицательную маржу и статус ниже break-even.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-brass/25 bg-brass/10 p-4 text-sm leading-6 text-graphite/72">
        Расчеты являются демонстрационной моделью и не являются обещанием доходности. Для production-запуска необходимо учитывать налоги, стоимость provider-каналов, риск-профиль, fraud-loss, chargeback/dispute rate, требования комплаенса и реальные операционные расходы.
      </div>
    </div>
  );
}

function NumberField({
  label,
  suffix,
  value,
  min,
  max,
  step,
  helper,
  warning,
  onChange
}: {
  label: string;
  suffix: string;
  value: number;
  min: number;
  max: number;
  step: number;
  helper: string;
  warning?: string;
  onChange: (value: number) => void;
}) {
  const [draftValue, setDraftValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) setDraftValue(String(value));
  }, [isFocused, value]);

  const commitValue = (rawValue: string) => {
    const parsedValue = parseNumericInput(rawValue);
    const nextValue = clampNumber(parsedValue ?? min, min, max);
    setDraftValue(String(nextValue));
    onChange(nextValue);
  };

  return (
    <label className="grid gap-1 text-sm font-semibold text-ink">
      {label}
      <div className="economy-input-shell flex items-center overflow-hidden rounded-2xl shadow-insetSoft">
        <input
          type="text"
          value={draftValue}
          min={min}
          max={max}
          step={step}
          inputMode="decimal"
          onFocus={() => setIsFocused(true)}
          onBlur={(event) => {
            setIsFocused(false);
            commitValue(event.target.value);
          }}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraftValue(nextValue);

            if (nextValue === "") return;

            const parsedValue = parseNumericInput(nextValue);
            if (parsedValue !== null && parsedValue >= min && parsedValue <= max) {
              onChange(parsedValue);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitValue(event.currentTarget.value);
              event.currentTarget.blur();
            }
          }}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 font-normal outline-none"
        />
        <span className="economy-input-suffix border-l px-4 py-3">{suffix}</span>
      </div>
      <span className="text-xs font-medium leading-5 text-graphite/65">{helper}</span>
      {warning ? <span className="text-xs font-semibold leading-5 text-brass">{warning}</span> : null}
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

function FormulaRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-jade">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-ink">{value}</p>
    </div>
  );
}
