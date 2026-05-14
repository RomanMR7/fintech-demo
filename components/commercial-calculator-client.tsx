"use client";

import { useEffect, useMemo, useState } from "react";
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

  const model = useMemo(() => {
    const payoutTurnover = payinTurnover * (payoutShare / 100);
    const payinRevenue = payinTurnover * (payinFee / 100);
    const payoutRevenue = payoutTurnover * (payoutFee / 100);
    const riskSaving = payinTurnover * (riskSavingRate / 100);
    const monthlyGross = payinRevenue + payoutRevenue + riskSaving;
    const providerCost = payinTurnover * (providerFeeRate / 100);
    const operatingCost = payinTurnover * (operatingCostRate / 100);
    const disputeLoss = payinTurnover * (disputeLossRate / 100);
    const netMargin = monthlyGross - providerCost - operatingCost - disputeLoss;
    const takeRate = payinTurnover > 0 ? (netMargin / payinTurnover) * 100 : 0;

    return {
      payoutTurnover,
      payinRevenue,
      payoutRevenue,
      riskSaving,
      monthlyGross,
      providerCost,
      operatingCost,
      disputeLoss,
      netMargin,
      takeRate,
      annualGross: monthlyGross * 12,
      annualNet: netMargin * 12,
      monthlyBaseRub: currency === "USD" && usdRubRate ? monthlyGross * usdRubRate : monthlyGross,
      annualBaseRub: currency === "USD" && usdRubRate ? monthlyGross * usdRubRate * 12 : monthlyGross * 12
    };
  }, [payinTurnover, payinFee, payoutShare, payoutFee, riskSavingRate, providerFeeRate, operatingCostRate, disputeLossRate, currency, usdRubRate]);

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
          <NumberField label="Оборот приема в месяц" suffix={currency} value={payinTurnover} min={1000} max={100000000000} step={currency === "USD" ? 1000 : 500000} helper="Можно вводить крупные обороты. Значение фиксируется сразу при корректном вводе и проверяется при выходе из поля." onChange={setPayinTurnover} />
          <NumberField label="Комиссия приема" suffix="%" value={payinFee} min={0} max={100} step={0.1} helper="Формула: оборот приема × комиссия приема." onChange={setPayinFee} />
          <NumberField label="Доля выплат от оборота" suffix="%" value={payoutShare} min={0} max={100} step={5} helper="Определяет объем payout-операций." onChange={setPayoutShare} />
          <NumberField label="Комиссия выплат" suffix="%" value={payoutFee} min={0} max={100} step={0.1} helper="Формула: объем выплат × комиссия выплат." onChange={setPayoutFee} />
          <NumberField label="Эффект снижения спорных потерь" suffix="%" value={riskSavingRate} min={0} max={100} step={0.1} helper="Управленческая оценка эффекта от risk/dispute tooling." onChange={setRiskSavingRate} />
          <NumberField label="Комиссия provider" suffix="%" value={providerFeeRate} min={0} max={100} step={0.1} helper="Оценочная себестоимость платежных провайдеров." onChange={setProviderFeeRate} />
          <NumberField label="Операционные расходы" suffix="%" value={operatingCostRate} min={0} max={100} step={0.05} helper="Support, ops, инфраструктура и ручная обработка." onChange={setOperatingCostRate} />
          <NumberField label="Risk / dispute loss" suffix="%" value={disputeLossRate} min={0} max={100} step={0.05} helper="Оценка потерь от споров, fraud и ошибок." onChange={setDisputeLossRate} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ResultCard label="Комиссия приема" value={formatMoney(model.payinRevenue, currency)} hint={`${formatMoney(payinTurnover, currency)} × ${payinFee}%`} />
          <ResultCard label="Комиссия выплат" value={formatMoney(model.payoutRevenue, currency)} hint={`${formatMoney(model.payoutTurnover, currency)} × ${payoutFee}%`} />
          <ResultCard label="Снижение потерь" value={formatMoney(model.riskSaving, currency)} hint={`Оценочный эффект ${riskSavingRate}% от оборота`} />
          <ResultCard label="Потенциал / год" value={formatMoney(model.annualGross, currency)} hint="Месячная модель × 12" accent />
          <ResultCard label="Комиссия provider" value={formatMoney(model.providerCost, currency)} hint={`${formatMoney(payinTurnover, currency)} × ${providerFeeRate}%`} />
          <ResultCard label="Операционные расходы" value={formatMoney(model.operatingCost, currency)} hint={`${formatMoney(payinTurnover, currency)} × ${operatingCostRate}%`} />
          <ResultCard label="Risk / dispute loss" value={formatMoney(model.disputeLoss, currency)} hint={`${formatMoney(payinTurnover, currency)} × ${disputeLossRate}%`} />
          <ResultCard label="Чистая маржа / месяц" value={formatMoney(model.netMargin, currency)} hint={`Take rate после расходов: ${formatRate(model.takeRate)}%`} accent={model.netMargin > 0} />
          <ResultCard label="Чистая маржа / год" value={formatMoney(model.annualNet, currency)} hint="Чистая маржа × 12. Не является обещанием доходности." accent={model.netMargin > 0} />
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
  onChange
}: {
  label: string;
  suffix: string;
  value: number;
  min: number;
  max: number;
  step: number;
  helper: string;
  onChange: (value: number) => void;
}) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  const clamp = (nextValue: number) => Math.min(Math.max(Number.isFinite(nextValue) ? nextValue : min, min), max);
  const commitValue = (rawValue: string) => {
    const parsedValue = Number(rawValue.replace(",", "."));
    const nextValue = clamp(parsedValue);
    setDraftValue(String(nextValue));
    onChange(nextValue);
  };

  return (
    <label className="grid gap-1 text-sm font-semibold text-ink">
      {label}
      <div className="economy-input-shell flex items-center overflow-hidden rounded-2xl shadow-insetSoft">
        <input
          type="number"
          value={draftValue}
          min={min}
          max={max}
          step={step}
          inputMode="decimal"
          onBlur={(event) => commitValue(event.target.value)}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraftValue(nextValue);

            if (nextValue === "") return;

            const parsedValue = Number(nextValue.replace(",", "."));
            if (Number.isFinite(parsedValue) && parsedValue >= min && parsedValue <= max) {
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
