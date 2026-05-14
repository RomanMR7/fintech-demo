"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Scenario = {
  key: string;
  title: string;
  description: string;
  step: number;
  totalSteps: number;
};

type StepInfo = {
  title: string;
  detail: string;
  result: string;
};

type ScenarioGuide = {
  simple: string;
  why: string;
  businessResult: string;
  money: string;
  lookAt: string;
  steps: StepInfo[];
};

const STORAGE_KEY = "fintech-demo-scenario-progress";

const guides: Record<string, ScenarioGuide> = {
  "merchant-create-order": {
    simple: "Клиент мерчанта хочет оплатить услугу. Мерчант создает платежный ордер, а платформа готовит оплату.",
    why: "Так начинается прием платежа: без ордера нельзя связать сумму, мерчанта, реквизиты, статус и будущий баланс.",
    businessResult: "Платформа получает управляемую операцию, которую можно провести, проверить и показать в отчетности.",
    money: "Заработок появляется на комиссии приема. Пример: оборот 10 000 000 RUB в месяц при комиссии 2.5% дает 250 000 RUB валовой комиссии.",
    lookAt: "После шага смотрите разделы «Ордера», «Уведомления» и «Журнал событий».",
    steps: [
      { title: "Мерчант создал ордер", detail: "Фиксируется сумма, валюта, мерчант и внешний ID.", result: "В системе появляется новая операция в статусе CREATED." },
      { title: "Платформа назначила реквизиты", detail: "Платформа подбирает доступный реквизит и провайдера.", result: "Ордер переходит в WAITING_PAYMENT." },
      { title: "Оператор отметил оплату", detail: "Оператор подтверждает, что платеж дошел до реквизита.", result: "Ордер переходит в PAID и готов к подтверждению." }
    ]
  },
  "assign-requisite": {
    simple: "Платформа выбирает, на какие реквизиты клиент должен оплатить заказ.",
    why: "Реквизиты нужны, чтобы направлять платежи через доступные банки/провайдеров и контролировать лимиты.",
    businessResult: "Платеж получает маршрут, а операторы видят, какой провайдер отвечает за прием денег.",
    money: "Хорошая маршрутизация снижает отказы. Если конверсия приема выросла с 85% до 92% на обороте 10 000 000 RUB, дополнительно проходит 700 000 RUB оборота.",
    lookAt: "Смотрите «Реквизиты», «Ордера» и «Интеграции».",
    steps: [
      { title: "Создан ордер для назначения", detail: "Берется новый ордер, которому еще не назначили реквизит.", result: "Появляется операция для маршрутизации." },
      { title: "Подобран активный реквизит", detail: "Система ищет реквизит по мерчанту, статусу и лимитам.", result: "Ордер получает реквизит и провайдера." },
      { title: "Лимиты реквизита обновлены", detail: "Использование реквизита фиксируется в демо-данных.", result: "Операционный контур видит нагрузку на реквизит." }
    ]
  },
  "order-status-flow": {
    simple: "Это жизненный цикл платежа от создания до завершения.",
    why: "Статусы нужны, чтобы все роли понимали, что уже произошло и кто должен действовать дальше.",
    businessResult: "Появляется прозрачный контроль операции: где деньги, кто отвечает и можно ли начислять баланс.",
    money: "Завершенный ордер формирует комиссию платформы. Пока статус не COMPLETED, доход нельзя считать надежно заработанным.",
    lookAt: "Смотрите детальную страницу ордера, «Балансы» и «Журнал событий».",
    steps: [
      { title: "Ожидает оплаты", detail: "Клиент получил реквизиты и должен оплатить.", result: "Статус WAITING_PAYMENT." },
      { title: "Оплачен", detail: "Платеж замечен оператором или провайдером.", result: "Статус PAID." },
      { title: "Подтвержден", detail: "Операция прошла проверку.", result: "Статус CONFIRMED." },
      { title: "Завершен", detail: "Операция закрыта как успешная.", result: "Статус COMPLETED и начисление баланса." },
      { title: "Финальный статус зафиксирован", detail: "Система повторно показывает, что операция закрыта.", result: "Журнал содержит финальную точку контроля." }
    ]
  },
  "balance-after-success": {
    simple: "Когда платеж успешно завершен, деньги появляются на балансе мерчанта.",
    why: "Баланс показывает, сколько мерчант может вывести, сколько заморожено и сколько удержано комиссий.",
    businessResult: "Мерчант видит доступные средства, а платформа видит свою комиссию.",
    money: "Пример: платеж 100 000 RUB, комиссия 2.5%. Мерчант получает 97 500 RUB, платформа фиксирует 2 500 RUB комиссии.",
    lookAt: "Смотрите «Балансы», «Комиссии» и «История изменений».",
    steps: [
      { title: "Оплата получена", detail: "Ордер доводится до оплаченного состояния.", result: "Система готовит начисление." },
      { title: "Операция подтверждена", detail: "Оператор или финансы подтверждают корректность операции.", result: "Статус CONFIRMED." },
      { title: "Баланс начислен с учетом комиссии", detail: "Доступный баланс растет, комиссии учитываются отдельно.", result: "Мерчант может использовать средства для выплаты." }
    ]
  },
  "merchant-create-payout": {
    simple: "Мерчант хочет вывести деньги со своего баланса.",
    why: "Выплата показывает обратный поток: деньги уходят с платформы получателю.",
    businessResult: "Средства резервируются, чтобы мерчант не смог потратить одну и ту же сумму дважды.",
    money: "Платформа может зарабатывать на комиссии выплат. Пример: вывод 500 000 RUB при комиссии 1.5% дает 7 500 RUB комиссии.",
    lookAt: "Смотрите «Выплаты», «Балансы» и «Журнал событий».",
    steps: [
      { title: "Мерчант создал выплату", detail: "Указывается сумма, получатель и источник средств.", result: "Появляется заявка на выплату." },
      { title: "Сумма взята в холд", detail: "Деньги переводятся из доступного баланса в замороженный.", result: "Риск двойного списания снижен." },
      { title: "Выплата передана финансисту", detail: "Финансовый менеджер получает задачу на проверку.", result: "Выплата готова к подтверждению." }
    ]
  },
  "finance-approve-payout": {
    simple: "Финансовый менеджер проверяет выплату и подтверждает ее.",
    why: "Нужен контроль перед тем, как деньги окончательно уйдут из системы.",
    businessResult: "Платформа закрывает выплату, снимает холд и фиксирует финансовое событие.",
    money: "Чем больше оборот выплат и чем ниже ручные ошибки, тем стабильнее комиссия и меньше потери на спорных выводах.",
    lookAt: "Смотрите «Выплаты», «Балансы» и «Финансовые события».",
    steps: [
      { title: "Выплата найдена", detail: "Система выбирает выплату в статусе CREATED/PENDING/HOLD.", result: "Есть объект для проверки." },
      { title: "Проверка выполнена", detail: "Выплата переводится в HOLD для финального контроля.", result: "Финансы видят, что сумма зарезервирована." },
      { title: "Выплата подтверждена", detail: "Холд списывается, статус становится COMPLETED.", result: "Выплата закрыта, история баланса обновлена." }
    ]
  },
  "freeze-disputed": {
    simple: "Если платеж спорный, часть денег временно замораживается.",
    why: "Заморозка защищает платформу и покупателя, пока support разбирается в ситуации.",
    businessResult: "Система не дает вывести спорные деньги до решения.",
    money: "Холды снижают убытки. Если спор на 100 000 RUB проигран, заморозка помогает не потерять сумму после вывода мерчантом.",
    lookAt: "Смотрите «Балансы», «Апелляции» и «Операционный кабинет».",
    steps: [
      { title: "Подготовлена спорная операция", detail: "Берется оплаченный или подтвержденный ордер.", result: "Есть операция для спора." },
      { title: "Сумма заморожена", detail: "Часть средств уходит из доступного баланса в холд.", result: "Появляется FROZEN-баланс." },
      { title: "Спор передан support-команде", detail: "Создается контекст для разбирательства.", result: "Support получает уведомление." }
    ]
  },
  "create-appeal": {
    simple: "Апелляция - это обращение по спорной операции.",
    why: "Она собирает причину, комментарии, ответственного и решение в одном месте.",
    businessResult: "Спор становится управляемым процессом, а не хаотичной перепиской.",
    money: "Быстрый разбор апелляций сохраняет оборот и доверие мерчантов. Чем меньше ручного хаоса, тем дешевле support на одну операцию.",
    lookAt: "Смотрите «Апелляции» и «Журнал событий».",
    steps: [
      { title: "Операция переведена в спор", detail: "Ордер получает статус DISPUTED.", result: "Деньги защищены холдом." },
      { title: "Апелляция создана", detail: "Мерчант добавляет причину обращения.", result: "Появляется карточка апелляции." },
      { title: "Апелляция готова к разбору", detail: "Support видит обращение и может взять его в работу.", result: "Процесс становится прозрачным." }
    ]
  },
  "support-review-appeal": {
    simple: "Support разбирает спор и собирает доказательства.",
    why: "Без этапа проверки невозможно честно решить, кому вернуть деньги.",
    businessResult: "Команда видит историю, комментарии и следующий шаг разбирательства.",
    money: "Качественный support снижает долю потерь. Даже 1% меньше проигранных споров на обороте 10 000 000 RUB может сохранить до 100 000 RUB риска.",
    lookAt: "Смотрите «Апелляции», комментарии и уведомления.",
    steps: [
      { title: "Support взял обращение", detail: "Апелляция переходит в работу.", result: "Статус OPEN." },
      { title: "Запрошена сверка", detail: "Support добавляет комментарий и проверяет данные.", result: "История обращения становится богаче." },
      { title: "Получен предварительный ответ", detail: "Добавляется результат проверки.", result: "Апелляция готова к решению." }
    ]
  },
  "appeal-resolution-balance": {
    simple: "После решения апелляции меняется статус операции и баланс.",
    why: "Финальный результат должен отразиться в деньгах, а не только в комментариях.",
    businessResult: "Холд снимается, спор закрывается, мерчант и платформа видят итог.",
    money: "Если решение в пользу мерчанта, деньги возвращаются в доступный баланс. Если в пользу платформы, спорная сумма не возвращается мерчанту.",
    lookAt: "Смотрите «Апелляции», «Балансы» и «Журнал событий».",
    steps: [
      { title: "Апелляция открыта", detail: "Есть активный спор для решения.", result: "Support может вынести итог." },
      { title: "Решение подготовлено", detail: "Фиксируется логика решения.", result: "Понятно, что будет с балансом." },
      { title: "Баланс обновлен после решения", detail: "Холд снимается и деньги возвращаются или списываются.", result: "Финансовый итог отражен в системе." }
    ]
  }
};

function readSavedProgress() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

function mergeWithSavedProgress(scenarios: Scenario[]) {
  const saved = readSavedProgress();

  return scenarios.map((scenario) => ({
    ...scenario,
    step: Math.min(Math.max(saved[scenario.key] ?? scenario.step, 0), scenario.totalSteps)
  }));
}

function saveProgress(scenarios: Scenario[]) {
  if (typeof window === "undefined") return;

  const payload = Object.fromEntries(scenarios.map((scenario) => [scenario.key, scenario.step]));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function clearProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function getGuide(scenario: Scenario) {
  return guides[scenario.key] ?? {
    simple: scenario.description,
    why: "Сценарий показывает один из рабочих процессов платформы.",
    businessResult: "После выполнения меняются связанные данные и появляется запись в журнале.",
    money: "Экономика зависит от оборота, комиссии и качества операционного контроля.",
    lookAt: "Смотрите журнал событий и связанные разделы.",
    steps: Array.from({ length: scenario.totalSteps }, (_, index) => ({
      title: `Шаг ${index + 1}`,
      detail: "Демо выполняет действие в системе.",
      result: "Данные обновляются."
    }))
  };
}

function getScenarioStatus(scenario: Scenario) {
  if (scenario.step <= 0) return { label: "Не начат", className: "bg-ink/8 text-graphite/60" };
  if (scenario.step >= scenario.totalSteps) return { label: "Завершено", className: "bg-jade/12 text-moss" };
  return { label: "В процессе", className: "bg-brass/15 text-brass" };
}

export function ScenariosClient({ scenarios }: { scenarios: Scenario[] }) {
  const router = useRouter();
  const [items, setItems] = useState(() => mergeWithSavedProgress(scenarios));
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setItems(mergeWithSavedProgress(scenarios));
  }, [scenarios]);

  const updateItems = (updater: (current: Scenario[]) => Scenario[]) => {
    setItems((current) => {
      const next = updater(current);
      saveProgress(next);
      return next;
    });
  };

  const resetAll = () => {
    clearProgress();
    setItems(scenarios.map((scenario) => ({ ...scenario, step: 0 })));
    setMessage({ type: "success", text: "Локальный прогресс сценариев сброшен. Можно пройти демо заново с первого шага." });
  };

  const run = async (scenario: Scenario) => {
    const currentStep = Math.min(Math.max(scenario.step, 0), scenario.totalSteps);
    const targetStep = currentStep >= scenario.totalSteps ? 1 : currentStep + 1;
    const guide = getGuide(scenario);
    const completed = guide.steps[targetStep - 1];
    const next = guide.steps[targetStep];

    setRunningKey(scenario.key);
    setMessage(null);

    try {
      const response = await fetch(`/api/scenarios/${scenario.key}/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStep })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Сценарий не выполнился. Попробуйте еще раз.");
      }

      const serverStep = Number.isFinite(Number(payload.step)) ? Number(payload.step) : targetStep;
      const updatedScenario = { ...scenario, ...payload, step: serverStep } as Scenario;

      updateItems((current) => current.map((item) => (item.key === scenario.key ? updatedScenario : item)));
      router.refresh();
      setMessage({
        type: "success",
        text:
          serverStep >= scenario.totalSteps
            ? `Сценарий «${scenario.title}» завершен. Результат: ${completed.result}`
            : `Выполнено: ${completed.title}. Дальше: ${next?.title ?? "можно перейти к следующему сценарию"}.`
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Не удалось выполнить сценарий."
      });
    } finally {
      setRunningKey(null);
    }
  };

  const isBusy = Boolean(runningKey);

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 rounded-[1.5rem] border border-ink/10 bg-white/70 p-4 shadow-soft sm:rounded-[2rem] sm:p-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">Как читать демо</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Каждый сценарий - это маленькая история движения денег</h2>
          <p className="mt-3 text-sm leading-6 text-graphite/68">
            Нажимайте кнопку по шагам. Зеленая шкала показывает, сколько процесса уже выполнено. Галочки показывают готовые действия.
            Ниже каждой карточки написано простыми словами: что произошло, зачем это нужно бизнесу и где смотреть результат.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-ink p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Где здесь заработок</p>
          <p className="mt-3 text-sm leading-6 text-white/78">
            Базовая формула: доход платформы = оборот приема × комиссия приема + оборот выплат × комиссия вывода + дополнительная маржа
            на маршрутизации и снижении спорных потерь.
          </p>
          <p className="mt-3 text-sm leading-6 text-white/78">
            Пример: 10 000 000 RUB приема при 2.5% = 250 000 RUB валовой комиссии. Если еще 4 000 000 RUB выводов при 1.5%,
            это еще 60 000 RUB. Итого в демо-модели: около 310 000 RUB валовой комиссии до расходов.
          </p>
        </div>
      </section>

      <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <Link href="/orders" className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-ink">Ордера</Link>
          <Link href="/balances" className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-ink">Балансы</Link>
          <Link href="/appeals" className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-ink">Апелляции</Link>
          <Link href="/events" className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-ink">Журнал событий</Link>
        </div>
        <button onClick={resetAll} className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm font-semibold text-graphite transition hover:bg-white">
          Сбросить прогресс сценариев
        </button>
      </div>

      {message ? (
        <div
          className={`rounded-[1.25rem] border px-4 py-3 text-sm font-medium ${
            message.type === "success" ? "border-jade/25 bg-jade/10 text-moss" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((scenario, index) => {
          const guide = getGuide(scenario);
          const safeStep = Math.min(Math.max(scenario.step, 0), scenario.totalSteps);
          const percent = Math.round((safeStep / scenario.totalSteps) * 100);
          const isCurrentRunning = runningKey === scenario.key;
          const status = getScenarioStatus(scenario);
          const completedText = safeStep > 0 ? guide.steps[safeStep - 1]?.title : "Пока ничего не выполнено";
          const nextText = safeStep >= scenario.totalSteps ? "Сценарий можно пройти заново" : guide.steps[safeStep]?.title;

          return (
            <article key={scenario.key} className="card rounded-[1.5rem] p-4 sm:rounded-[1.75rem] sm:p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-base font-semibold text-white sm:h-11 sm:w-11 sm:text-lg">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold sm:text-xl">{scenario.title}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-graphite/68">{guide.simple}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-ink/8 bg-white/55 p-3 sm:mt-5 sm:p-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-graphite/50">
                  <span>Выполнено {safeStep} из {scenario.totalSteps}</span>
                  <span>{percent}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-3 rounded-full bg-gradient-to-r from-jade via-moss to-brass transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>

                <div className="mt-4 grid gap-2">
                  {guide.steps.map((step, stepIndex) => {
                    const isDone = stepIndex < safeStep;
                    const isNext = stepIndex === safeStep && safeStep < scenario.totalSteps;

                    return (
                      <div
                        key={step.title}
                        className={`rounded-xl px-3 py-3 text-sm ${
                          isDone ? "bg-jade/10 text-moss" : isNext ? "bg-brass/12 text-ink" : "bg-ink/[0.03] text-graphite/55"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isDone ? "bg-jade text-white" : isNext ? "bg-brass text-ink" : "bg-ink/10 text-graphite/50"
                            }`}
                          >
                            {isDone ? "✓" : stepIndex + 1}
                          </span>
                          <span className="font-semibold">{step.title}</span>
                          {isNext ? <span className="ml-auto rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brass">следующий</span> : null}
                        </div>
                        <p className="mt-2 pl-0 leading-5 opacity-80 sm:pl-9">{step.detail}</p>
                        {isDone ? <p className="mt-1 pl-0 text-xs font-semibold opacity-80 sm:pl-9">Результат: {step.result}</p> : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl bg-ink/[0.04] p-4 text-sm leading-6">
                <p><span className="font-semibold">Что уже сделано:</span> {completedText}</p>
                <p><span className="font-semibold">Следующее действие:</span> {nextText}</p>
                <p><span className="font-semibold">Зачем это нужно:</span> {guide.why}</p>
                <p><span className="font-semibold">Что дает бизнесу:</span> {guide.businessResult}</p>
                <p><span className="font-semibold">Как на этом зарабатывать:</span> {guide.money}</p>
                <p><span className="font-semibold">Где увидеть результат:</span> {guide.lookAt}</p>
              </div>

              <button
                disabled={isBusy}
                onClick={() => run(scenario)}
                className="focus-ring mt-5 w-full rounded-2xl bg-jade px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-50"
              >
                {isCurrentRunning ? "Выполняю шаг..." : scenario.step >= scenario.totalSteps ? "Пройти сценарий заново" : `Выполнить шаг ${safeStep + 1}`}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
