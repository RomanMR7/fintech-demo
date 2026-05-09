import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "sales-pitch", "outputs");
const SCRATCH_DIR = path.join(ROOT, "sales-pitch", "tmp", "slides", "sales-pitch");
const PREVIEW_DIR = path.join(SCRATCH_DIR, "preview");
const VERIFY_DIR = path.join(SCRATCH_DIR, "verification");
const INSPECT_PATH = path.join(SCRATCH_DIR, "inspect.ndjson");

const W = 1280;
const H = 720;

const C = {
  ink: "#12231E",
  graphite: "#31413B",
  muted: "#6B7671",
  pearl: "#F6F0E4",
  porcelain: "#FCFAF5",
  jade: "#0B7A6E",
  moss: "#173F37",
  brass: "#B88438",
  sand: "#E9DDC7",
  sky: "#DDEEEA",
  white: "#FFFFFF",
  red: "#B84C4C",
  transparent: "#00000000"
};

const FONT = {
  title: "Poppins",
  body: "Lato",
  mono: "Aptos Mono"
};

const slides = [
  {
    kind: "cover",
    kicker: "INVESTOR / CLIENT PITCH",
    title: "Платежная платформа, которую можно понять за 15 минут",
    subtitle: "Рабочий интерактивный прототип для демонстрации приема платежей, выплат, балансов, апелляций, ролей, статусов и экономики fintech/SaaS-продукта.",
    badge: "Pay-in · Payout · Балансы · Споры · API · Аудит",
    note: "Открыть как разговор: это не просто презентация, а продуктовый прототип, который можно запустить и покликать."
  },
  {
    kind: "problem",
    kicker: "01 · Боль рынка",
    title: "Платежные процессы часто живут в разрозненных таблицах, чатах и ручных решениях",
    subtitle: "Когда оборот растет, хаос в статусах, балансах и спорных операциях быстро превращается в финансовый риск.",
    items: [
      ["Нет единой картины", "Мерчант, оператор, финансы и support видят разные фрагменты процесса."],
      ["Сложно объяснить деньги", "Не всегда понятно, почему баланс изменился, где холд и какая комиссия удержана."],
      ["Споры съедают маржу", "Апелляции без четкого workflow увеличивают потери, нагрузку на support и недоверие клиентов."]
    ],
    metric: ["1 спор", "может заблокировать сумму, статус, выплату и коммуникацию с клиентом одновременно"]
  },
  {
    kind: "solution",
    kicker: "02 · Решение",
    title: "Единый операционный слой для платежей, выплат и финансового контроля",
    subtitle: "Прототип показывает, как продукт объединяет бизнес-логику, роли, статусы, балансы и аудит в одной управляемой системе.",
    pillars: [
      ["Прием платежей", "Ордер, реквизиты, провайдер, статус, комиссия"],
      ["Выплаты", "Заявка, холд, подтверждение, списание"],
      ["Балансы", "Доступно, заморожено, комиссии, история"],
      ["Апелляции", "Причина, ответственный, комментарии, решение"]
    ],
    outcome: "Главная ценность: любой участник видит, что произошло с деньгами, кто отвечает и какой следующий шаг."
  },
  {
    kind: "modules",
    kicker: "03 · Что уже можно показать",
    title: "Внутри уже есть рабочий контур продукта",
    subtitle: "Это не статичный макет: действия меняют данные, а события отражаются в связанных модулях.",
    modules: [
      "Дашборд", "Ордера", "Выплаты", "Реквизиты", "Балансы", "Комиссии",
      "Апелляции", "Уведомления", "Журнал событий", "Интеграции", "API-демо", "Карта процессов"
    ],
    callout: "Демо можно использовать как sales-инструмент, investor demo, ТЗ для команды или прототип для пилота."
  },
  {
    kind: "audience",
    kicker: "04 · Для кого",
    title: "Кому это можно продавать или показывать",
    subtitle: "Решение интересно тем, кто работает с платежным оборотом, ручной операционкой, выплатами и спорными ситуациями.",
    segments: [
      ["Онлайн-мерчанты", "Нужно принимать платежи, выводить средства и видеть прозрачный баланс."],
      ["Платежные команды", "Нужен внутренний back-office для операторов, финансов и support."],
      ["PSP / агрегаторы", "Нужен слой маршрутизации, статусов, провайдеров и аудита."],
      ["Инвесторы", "Нужен быстрый способ оценить продукт, логику, UX и коммерческий потенциал."]
    ]
  },
  {
    kind: "moneyflow",
    kicker: "05 · Как движутся деньги",
    title: "Один платеж проходит через понятную цепочку контроля",
    subtitle: "Каждое изменение статуса связано с финансовым смыслом: где деньги, доступны ли они и можно ли считать комиссию заработанной.",
    flow: ["Ордер", "Реквизиты", "Оплата", "Подтверждение", "Баланс"],
    side: [
      ["Если все хорошо", "мерчант получает доступный баланс за вычетом комиссии"],
      ["Если есть спор", "часть суммы замораживается до решения апелляции"]
    ]
  },
  {
    kind: "roles",
    kicker: "06 · Управление ролями",
    title: "Каждая роль видит свой участок ответственности",
    subtitle: "Это снижает хаос: оператор не занимается финансами, support не меняет выплаты, мерчант видит только свои данные.",
    roles: [
      ["Администратор", "Вся система, мерчанты, провайдеры, аудит"],
      ["Мерчант", "Свои ордера, выплаты, баланс, реквизиты"],
      ["Оператор", "Статусы, реквизиты, спорные операции"],
      ["Финансы", "Балансы, комиссии, холды, выплаты"],
      ["Support", "Апелляции, комментарии, решения"]
    ],
    noteBox: "Для production это масштабируется в полноценный RBAC, права доступа и аудит действий."
  },
  {
    kind: "scenarios",
    kicker: "07 · Демонстрация",
    title: "10 сценариев объясняют продукт человеку без технического опыта",
    subtitle: "Пользователь нажимает шаги и видит, что меняется: статусы, баланс, апелляции, уведомления и журнал.",
    scenarios: [
      "Мерчант создает ордер",
      "Платформа назначает реквизиты",
      "Оператор меняет статусы",
      "Успешный ордер начисляет баланс",
      "Мерчант создает выплату",
      "Финансы подтверждают выплату",
      "Спор замораживает баланс",
      "Создается апелляция",
      "Support рассматривает спор",
      "Решение меняет баланс"
    ]
  },
  {
    kind: "businessModel",
    kicker: "08 · Бизнес-модель",
    title: "Заработок строится на обороте, комиссиях и снижении потерь",
    subtitle: "Модель проста для объяснения клиенту и инвестору: чем больше обработанный оборот и чем лучше контроль рисков, тем выше валовая комиссия.",
    formulas: [
      ["Pay-in комиссия", "Оборот приема × ставка комиссии"],
      ["Payout комиссия", "Оборот выплат × ставка комиссии"],
      ["Операционная маржа", "Меньше ручного труда, ошибок и спорных потерь"],
      ["Доп. монетизация", "Премиум-модули: API, кастомные лимиты, аналитика, SLA"]
    ],
    example: "Демо-формула: 10 млн RUB pay-in × 2.5% + 4 млн RUB payout × 1.5% = 310 000 RUB валовой комиссии в месяц."
  },
  {
    kind: "economics",
    kicker: "09 · Потенциальная экономика",
    title: "Пример валовой комиссии при разных объемах",
    subtitle: "Это демонстрационная модель, не гарантия доходности. Реальные цифры зависят от ниши, провайдеров, риска, налогов и стоимости операций.",
    rows: [
      ["Pay-in оборот / мес.", "10 млн RUB", "50 млн RUB", "100 млн RUB"],
      ["Pay-in комиссия 2.5%", "250 тыс.", "1.25 млн", "2.5 млн"],
      ["Payout 40% оборота, 1.5%", "60 тыс.", "300 тыс.", "600 тыс."],
      ["Валовая комиссия / мес.", "310 тыс.", "1.55 млн", "3.1 млн"],
      ["Валовая комиссия / год", "3.72 млн", "18.6 млн", "37.2 млн"]
    ],
    callout: "Ключ к росту: подключать мерчантов с оборотом, удерживать конверсию платежей и снижать потери на спорах."
  },
  {
    kind: "clientValue",
    kicker: "10 · Ценность для клиента",
    title: "Клиент покупает не интерфейс, а контроль над деньгами",
    subtitle: "Продукт помогает быстро понять состояние платежей, уменьшить ручной труд и объяснить финансовые изменения.",
    cards: [
      ["Прозрачность", "Понятно, где деньги: в оплате, на балансе, в холде или в споре."],
      ["Скорость операций", "Оператор и финансы работают по статусам, а не по хаотичным чатам."],
      ["Снижение риска", "Спорные суммы замораживаются, апелляции имеют историю и ответственного."],
      ["Готовность к интеграциям", "API-демо показывает, как можно подключать мерчантов и провайдеров."]
    ]
  },
  {
    kind: "investorValue",
    kicker: "11 · Ценность для инвестора",
    title: "Прототип снижает риск первого этапа",
    subtitle: "Вместо идеи на словах есть продуктовый контур, который можно открыть, пройти и обсудить с рынком.",
    cards: [
      ["Проверяемая гипотеза", "Можно показать рынку до затрат на сложную production-инфраструктуру."],
      ["Понятный roadmap", "Видно, какие модули уже нужны: RBAC, провайдеры, аналитика, файлы, compliance."],
      ["Коммерческий контур", "Есть модель дохода через комиссии, оборот и операционную эффективность."],
      ["Sales-материал", "Демо помогает проводить встречи с клиентами и партнерами уже сейчас."]
    ]
  },
  {
    kind: "roadmap",
    kicker: "12 · Roadmap",
    title: "Как превратить демо в production-продукт",
    subtitle: "Следующий этап - не переписывать все заново, а усилить прототип production-слоями.",
    phases: [
      ["Этап 1", "Hosted DB, авторизация, RBAC, audit trail"],
      ["Этап 2", "Провайдеры, webhooks, файлы по апелляциям, аналитика"],
      ["Этап 3", "Маршрутизация, лимиты, риск-правила, SLA-мониторинг"],
      ["Этап 4", "Пилоты с мерчантами, unit economics, масштабирование"]
    ],
    caption: "Сильная сторона прототипа: он уже задает бизнес-структуру продукта и ускоряет постановку задач команде."
  },
  {
    kind: "ask",
    kicker: "13 · Следующий шаг",
    title: "Предлагаем пройти демо и выбрать формат сотрудничества",
    subtitle: "После 30-45 минут демонстрации можно принять решение: пилот, кастомизация, инвестиционный раунд или совместная разработка.",
    options: [
      ["Для клиента", "Пилот под ваши процессы, роли, комиссии и платежные сценарии."],
      ["Для инвестора", "Оценка MVP, roadmap, рынка, бюджета и сроков production-версии."],
      ["Для партнера", "Интеграция провайдеров, совместная упаковка и запуск продаж."]
    ],
    close: "Цель встречи: перейти от абстрактной идеи к конкретной модели продукта, денег и запуска."
  }
];

const inspect = [];

function stroke(fill = C.transparent, width = 0) {
  return { style: "solid", fill, width };
}

function shape(slide, geometry, x, y, w, h, fill = C.transparent, lineFill = C.transparent, lineWidth = 0, role = "shape") {
  const s = slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: stroke(lineFill, lineWidth)
  });
  inspect.push({ kind: "shape", role, bbox: [x, y, w, h] });
  return s;
}

function text(slide, slideNo, value, x, y, w, h, opts = {}) {
  const box = shape(slide, "rect", x, y, w, h, opts.fill ?? C.transparent, opts.stroke ?? C.transparent, opts.strokeWidth ?? 0, opts.role ?? "text");
  box.text = Array.isArray(value) ? value.join("\n") : String(value);
  box.text.fontSize = opts.size ?? 20;
  box.text.color = opts.color ?? C.ink;
  box.text.bold = Boolean(opts.bold);
  box.text.typeface = opts.face ?? FONT.body;
  box.text.alignment = opts.align ?? "left";
  box.text.verticalAlignment = opts.valign ?? "top";
  box.text.insets = opts.insets ?? { left: 0, right: 0, top: 0, bottom: 0 };
  if (opts.autoFit) box.text.autoFit = opts.autoFit;
  inspect.push({
    kind: "textbox",
    slide: slideNo,
    role: opts.role ?? "text",
    text: Array.isArray(value) ? value.join("\n") : String(value),
    textChars: String(value).length,
    textLines: Array.isArray(value) ? value.length : String(value).split(/\n/).length,
    bbox: [x, y, w, h]
  });
  return box;
}

function background(slide, slideNo) {
  slide.background.fill = C.pearl;
  shape(slide, "ellipse", -220, -210, 580, 580, "#B8843826", C.transparent, 0, "warm orbital glow");
  shape(slide, "ellipse", 900, -220, 560, 560, "#0B7A6E24", C.transparent, 0, "jade orbital glow");
  shape(slide, "ellipse", 915, 500, 410, 260, "#173F3718", C.transparent, 0, "bottom glow");
  shape(slide, "rect", 0, 0, W, H, "#FFFFFF7C", C.transparent, 0, "soft veil");
  for (let i = 0; i < 7; i += 1) {
    shape(slide, "rect", 72 + i * 168, 680, 82, 2, i % 2 ? "#B8843850" : "#0B7A6E4D", C.transparent, 0, "footer pulse");
  }
  text(slide, slideNo, `${String(slideNo).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`, 1118, 34, 98, 24, {
    size: 12,
    color: C.moss,
    bold: true,
    face: FONT.mono,
    align: "right",
    role: "slide number"
  });
}

function header(slide, slideNo, kicker) {
  text(slide, slideNo, kicker.toUpperCase(), 64, 36, 670, 24, {
    size: 13,
    color: C.jade,
    bold: true,
    face: FONT.mono,
    role: "kicker"
  });
  shape(slide, "rect", 64, 70, 1152, 2, "#12231E24", C.transparent, 0, "header rule");
}

function titleBlock(slide, slideNo, data, y = 94, w = 800) {
  text(slide, slideNo, data.title, 64, y, w, 108, {
    size: 39,
    color: C.ink,
    bold: true,
    face: FONT.title,
    role: "slide title",
    autoFit: "shrinkText"
  });
  text(slide, slideNo, data.subtitle, 66, y + 118, Math.min(w + 120, 920), 70, {
    size: 18,
    color: C.graphite,
    role: "slide subtitle",
    autoFit: "shrinkText"
  });
}

function panel(slide, x, y, w, h, fill = "#FCFAF5E8", role = "panel") {
  return shape(slide, "roundRect", x, y, w, h, fill, "#12231E18", 1.1, role);
}

function card(slide, slideNo, x, y, w, h, title, body, accent = C.jade) {
  panel(slide, x, y, w, h, "#FCFAF5E8", `card ${title}`);
  shape(slide, "rect", x, y, 7, h, accent, C.transparent, 0, "card accent");
  shape(slide, "ellipse", x + 22, y + 20, 38, 38, "#FFFFFF", "#12231E14", 1, "card icon");
  shape(slide, "rect", x + 36, y + 31, 10, 16, accent, C.transparent, 0, "card icon mark");
  if (h <= 110) {
    text(slide, slideNo, title, x + 76, y + 19, w - 96, 24, {
      size: 15,
      color: accent,
      bold: true,
      face: FONT.title,
      role: "card title",
      autoFit: "shrinkText"
    });
    text(slide, slideNo, body, x + 76, y + 48, w - 104, h - 56, {
      size: 13,
      color: C.graphite,
      role: "card body",
      autoFit: "shrinkText"
    });
    return;
  }

  text(slide, slideNo, title, x + 76, y + 21, w - 96, 28, {
    size: 16,
    color: accent,
    bold: true,
    face: FONT.title,
    role: "card title",
    autoFit: "shrinkText"
  });
  text(slide, slideNo, body, x + 24, y + 72, w - 48, h - 84, {
    size: 15,
    color: C.graphite,
    role: "card body",
    autoFit: "shrinkText"
  });
}

function metric(slide, slideNo, x, y, value, label, accent = C.jade) {
  panel(slide, x, y, 244, 120, "#FFFFFFDC", `metric ${label}`);
  shape(slide, "rect", x, y, 244, 7, accent, C.transparent, 0, "metric accent");
  text(slide, slideNo, value, x + 22, y + 22, 202, 42, {
    size: 34,
    color: C.ink,
    bold: true,
    face: FONT.title,
    role: "metric value",
    autoFit: "shrinkText"
  });
  text(slide, slideNo, label, x + 24, y + 72, 196, 30, {
    size: 13,
    color: C.graphite,
    role: "metric label",
    autoFit: "shrinkText"
  });
}

function note(slide, value) {
  slide.speakerNotes.setText(value);
}

function cover(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  shape(slide, "rect", 64, 114, 8, 420, C.jade, C.transparent, 0, "cover accent");
  text(slide, slideNo, data.kicker, 94, 116, 560, 28, { size: 14, color: C.jade, bold: true, face: FONT.mono, role: "cover kicker" });
  text(slide, slideNo, data.title, 90, 162, 790, 160, { size: 47, color: C.ink, bold: true, face: FONT.title, role: "cover title", autoFit: "shrinkText" });
  text(slide, slideNo, data.subtitle, 94, 346, 690, 96, { size: 19, color: C.graphite, role: "cover subtitle", autoFit: "shrinkText" });
  panel(slide, 94, 492, 520, 72, "#12231EF0", "cover badge");
  text(slide, slideNo, data.badge, 122, 516, 468, 30, { size: 16, color: C.pearl, bold: true, role: "cover badge" });

  panel(slide, 848, 122, 330, 450, "#FFFFFFB8", "hero stack");
  ["Ордера", "Выплаты", "Балансы", "Апелляции", "API", "Журнал"].forEach((item, i) => {
    const x = 884 + (i % 2) * 138;
    const y = 176 + Math.floor(i / 2) * 86;
    shape(slide, "roundRect", x, y, 114, 52, i % 2 ? "#B8843820" : "#0B7A6E20", "#12231E12", 1, `hero chip ${item}`);
    text(slide, slideNo, item, x + 10, y + 16, 94, 20, { size: 15, color: C.ink, bold: true, align: "center", role: "hero chip" });
  });
  text(slide, slideNo, "Открывается в браузере\nи показывает живую бизнес-логику", 878, 484, 276, 56, {
    size: 18,
    color: C.moss,
    bold: true,
    align: "center",
    role: "hero claim",
    autoFit: "shrinkText"
  });
  note(slide, data.note);
}

function problem(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 790);
  const accents = [C.red, C.brass, C.jade];
  data.items.forEach((item, i) => card(slide, slideNo, 82 + i * 382, 390, 340, 170, item[0], item[1], accents[i]));
  panel(slide, 170, 592, 940, 62, "#12231EF0", "problem metric");
  text(slide, slideNo, data.metric[0], 202, 608, 140, 28, { size: 24, color: C.brass, bold: true, face: FONT.title, role: "problem metric value" });
  text(slide, slideNo, data.metric[1], 360, 610, 710, 26, { size: 16, color: C.pearl, role: "problem metric label", autoFit: "shrinkText" });
  note(slide, data.subtitle);
}

function solution(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 780);
  data.pillars.forEach((pillar, i) => {
    const x = 90 + (i % 2) * 548;
    const y = 352 + Math.floor(i / 2) * 112;
    card(slide, slideNo, x, y, 500, 88, pillar[0], pillar[1], i % 2 ? C.brass : C.jade);
  });
  panel(slide, 160, 600, 960, 58, "#0B7A6E1F", "solution outcome");
  text(slide, slideNo, data.outcome, 192, 616, 896, 24, { size: 17, color: C.moss, bold: true, align: "center", role: "solution outcome", autoFit: "shrinkText" });
  note(slide, data.outcome);
}

function modules(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 760);
  data.modules.forEach((module, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 92 + col * 282;
    const y = 338 + row * 80;
    panel(slide, x, y, 248, 56, i % 3 === 0 ? "#0B7A6E18" : i % 3 === 1 ? "#B8843818" : "#FFFFFFD6", `module ${module}`);
    text(slide, slideNo, module, x + 16, y + 17, 216, 20, { size: 15, color: C.ink, bold: true, align: "center", role: "module name" });
  });
  panel(slide, 150, 604, 980, 54, "#12231EEF", "modules callout");
  text(slide, slideNo, data.callout, 184, 620, 912, 22, { size: 16, color: C.pearl, bold: true, align: "center", role: "modules callout", autoFit: "shrinkText" });
  note(slide, data.callout);
}

function audience(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 760);
  data.segments.forEach((seg, i) => {
    const x = 92 + (i % 2) * 548;
    const y = 352 + Math.floor(i / 2) * 122;
    card(slide, slideNo, x, y, 500, 98, seg[0], seg[1], i === 3 ? C.brass : C.jade);
  });
  note(slide, data.subtitle);
}

function moneyflow(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 780);
  data.flow.forEach((step, i) => {
    const x = 82 + i * 224;
    shape(slide, "ellipse", x + 72, 372, 60, 60, i === data.flow.length - 1 ? C.jade : "#FFFFFF", C.jade, 2, `flow node ${step}`);
    text(slide, slideNo, String(i + 1), x + 91, 389, 22, 20, { size: 18, color: i === data.flow.length - 1 ? C.white : C.jade, bold: true, align: "center", role: "flow number" });
    text(slide, slideNo, step, x, 446, 204, 36, { size: 17, color: C.ink, bold: true, align: "center", role: "flow label" });
    if (i < data.flow.length - 1) shape(slide, "rightArrow", x + 150, 388, 84, 28, "#0B7A6E55", C.transparent, 0, "flow arrow");
  });
  data.side.forEach((item, i) => {
    const x = 170 + i * 500;
    panel(slide, x, 568, 440, 72, i ? "#B884381F" : "#0B7A6E1E", `moneyflow side ${item[0]}`);
    text(slide, slideNo, item[0], x + 24, 584, 160, 22, { size: 16, color: i ? C.brass : C.jade, bold: true, face: FONT.title, role: "moneyflow side title" });
    text(slide, slideNo, item[1], x + 190, 584, 220, 34, { size: 14, color: C.graphite, role: "moneyflow side body", autoFit: "shrinkText" });
  });
  note(slide, data.subtitle);
}

function roles(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 790);
  data.roles.forEach((role, i) => {
    const y = 342 + i * 55;
    panel(slide, 100, y, 1080, 42, i % 2 ? "#FFFFFFD0" : "#DDEEEAB8", `role ${role[0]}`);
    text(slide, slideNo, role[0], 126, y + 11, 184, 18, { size: 15, color: C.ink, bold: true, role: "role title" });
    text(slide, slideNo, role[1], 330, y + 11, 760, 18, { size: 15, color: C.graphite, role: "role body" });
  });
  panel(slide, 190, 624, 900, 42, "#B884381A", "roles note");
  text(slide, slideNo, data.noteBox, 218, 636, 844, 16, { size: 14, color: C.graphite, align: "center", role: "roles note", autoFit: "shrinkText" });
  note(slide, data.noteBox);
}

function scenarios(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 790);
  data.scenarios.forEach((scenario, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 108 + col * 528;
    const y = 326 + row * 58;
    shape(slide, "ellipse", x, y, 34, 34, i < 5 ? C.jade : C.brass, C.transparent, 0, "scenario bullet");
    text(slide, slideNo, String(i + 1), x + 8, y + 8, 18, 14, { size: 12, color: C.white, bold: true, align: "center", role: "scenario number" });
    text(slide, slideNo, scenario, x + 48, y + 7, 418, 20, { size: 16, color: C.ink, bold: true, role: "scenario label", autoFit: "shrinkText" });
  });
  note(slide, data.subtitle);
}

function businessModel(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 790);
  data.formulas.forEach((formula, i) => {
    const x = 92 + (i % 2) * 548;
    const y = 354 + Math.floor(i / 2) * 108;
    card(slide, slideNo, x, y, 500, 86, formula[0], formula[1], i % 2 ? C.brass : C.jade);
  });
  panel(slide, 126, 604, 1028, 50, "#12231EF2", "business model example");
  text(slide, slideNo, data.example, 154, 620, 972, 20, { size: 15, color: C.pearl, bold: true, align: "center", role: "business model example", autoFit: "shrinkText" });
  note(slide, data.example);
}

function economics(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 850);
  const x = 92;
  const y = 324;
  const colW = [318, 250, 250, 250];
  const rowH = 50;
  data.rows.forEach((row, r) => {
    let currentX = x;
    row.forEach((cell, c) => {
      const fill = r === 0 ? C.ink : r === data.rows.length - 1 ? "#0B7A6E1D" : c === 0 ? "#FFFFFFD6" : "#FFFFFFB8";
      const color = r === 0 ? C.pearl : C.ink;
      panel(slide, currentX, y + r * rowH, colW[c] - 8, rowH - 8, fill, `economics cell ${r}-${c}`);
      text(slide, slideNo, cell, currentX + 14, y + r * rowH + 15, colW[c] - 36, 18, {
        size: c === 0 ? 13 : 15,
        color,
        bold: r === 0 || r === data.rows.length - 1,
        align: c === 0 ? "left" : "center",
        role: "economics cell",
        autoFit: "shrinkText"
      });
      currentX += colW[c];
    });
  });
  panel(slide, 170, 606, 940, 50, "#B884381B", "economics callout");
  text(slide, slideNo, data.callout, 200, 622, 880, 18, { size: 14, color: C.graphite, bold: true, align: "center", role: "economics callout", autoFit: "shrinkText" });
  note(slide, data.subtitle);
}

function cards4(presentation, data, slideNo, kind) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 790);
  data.cards.forEach((item, i) => {
    const x = 92 + (i % 2) * 548;
    const y = 350 + Math.floor(i / 2) * 116;
    card(slide, slideNo, x, y, 500, 92, item[0], item[1], i % 2 ? C.brass : C.jade);
  });
  note(slide, data.subtitle);
}

function roadmap(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 800);
  data.phases.forEach((phase, i) => {
    const x = 96 + i * 288;
    panel(slide, x, 370, 248, 156, i === 0 ? "#0B7A6E1D" : i === 3 ? "#B884381F" : "#FFFFFFD6", `roadmap ${phase[0]}`);
    text(slide, slideNo, phase[0], x + 22, 396, 200, 26, { size: 18, color: i === 3 ? C.brass : C.jade, bold: true, face: FONT.title, align: "center", role: "roadmap phase" });
    text(slide, slideNo, phase[1], x + 22, 448, 204, 48, { size: 14, color: C.graphite, align: "center", role: "roadmap body", autoFit: "shrinkText" });
    if (i < data.phases.length - 1) shape(slide, "rightArrow", x + 244, 432, 60, 28, "#173F3750", C.transparent, 0, "roadmap arrow");
  });
  panel(slide, 160, 604, 960, 50, "#12231EEF", "roadmap caption");
  text(slide, slideNo, data.caption, 192, 620, 896, 18, { size: 14, color: C.pearl, bold: true, align: "center", role: "roadmap caption", autoFit: "shrinkText" });
  note(slide, data.caption);
}

function ask(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  background(slide, slideNo);
  header(slide, slideNo, data.kicker);
  titleBlock(slide, slideNo, data, 92, 790);
  data.options.forEach((option, i) => card(slide, slideNo, 82 + i * 382, 388, 340, 170, option[0], option[1], [C.jade, C.brass, C.moss][i]));
  panel(slide, 154, 602, 972, 58, "#12231EF2", "closing ask");
  text(slide, slideNo, data.close, 186, 620, 908, 22, { size: 16, color: C.pearl, bold: true, align: "center", role: "closing ask", autoFit: "shrinkText" });
  note(slide, data.close);
}

async function saveBlob(blob, filePath) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await fs.writeFile(filePath, bytes);
}

async function build() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  await fs.mkdir(VERIFY_DIR, { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: W, height: H } });

  slides.forEach((data, index) => {
    const slideNo = index + 1;
    if (data.kind === "cover") cover(presentation, data, slideNo);
    else if (data.kind === "problem") problem(presentation, data, slideNo);
    else if (data.kind === "solution") solution(presentation, data, slideNo);
    else if (data.kind === "modules") modules(presentation, data, slideNo);
    else if (data.kind === "audience") audience(presentation, data, slideNo);
    else if (data.kind === "moneyflow") moneyflow(presentation, data, slideNo);
    else if (data.kind === "roles") roles(presentation, data, slideNo);
    else if (data.kind === "scenarios") scenarios(presentation, data, slideNo);
    else if (data.kind === "businessModel") businessModel(presentation, data, slideNo);
    else if (data.kind === "economics") economics(presentation, data, slideNo);
    else if (data.kind === "clientValue") cards4(presentation, data, slideNo, data.kind);
    else if (data.kind === "investorValue") cards4(presentation, data, slideNo, data.kind);
    else if (data.kind === "roadmap") roadmap(presentation, data, slideNo);
    else if (data.kind === "ask") ask(presentation, data, slideNo);
  });

  const inspectLines = [
    JSON.stringify({ kind: "deck", slideCount: presentation.slides.count, slideSize: { width: W, height: H } }),
    ...inspect.map((record) => JSON.stringify(record))
  ].join("\n");
  await fs.writeFile(INSPECT_PATH, `${inspectLines}\n`, "utf8");

  const previewPaths = [];
  for (let i = 0; i < presentation.slides.items.length; i += 1) {
    const slide = presentation.slides.items[i];
    const preview = await presentation.export({ slide, format: "png", scale: 1 });
    const previewPath = path.join(PREVIEW_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`);
    await saveBlob(preview, previewPath);
    previewPaths.push(previewPath);
  }

  const pptx = await PresentationFile.exportPptx(presentation);
  const pptxPath = path.join(OUT_DIR, "output.pptx");
  await pptx.save(pptxPath);

  await fs.writeFile(
    path.join(VERIFY_DIR, "render_verify_loops.ndjson"),
    JSON.stringify({ loop: 1, slideCount: presentation.slides.count, previewCount: previewPaths.length, pptxPath, timestamp: new Date().toISOString() }) + "\n",
    "utf8"
  );

  console.log(pptxPath);
}

await build();
