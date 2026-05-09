import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "outputs");
const SCRATCH_DIR = path.join(ROOT, "tmp", "slides", "fintech-solution-deck");
const PREVIEW_DIR = path.join(SCRATCH_DIR, "preview");
const VERIFY_DIR = path.join(SCRATCH_DIR, "verification");
const INSPECT_PATH = path.join(SCRATCH_DIR, "inspect.ndjson");

const W = 1280;
const H = 720;

const C = {
  ink: "#14241F",
  graphite: "#31413B",
  muted: "#68756F",
  pearl: "#F7F2E8",
  porcelain: "#FBFAF6",
  jade: "#0D766C",
  moss: "#17483F",
  brass: "#B5863B",
  smoke: "#E6E0D4",
  white: "#FFFFFF",
  red: "#B44747",
  sky: "#D9ECE8",
  transparent: "#00000000"
};

const FONT = {
  title: "Poppins",
  body: "Lato",
  mono: "Aptos Mono"
};

const slides = [
  {
    kicker: "FINTECH SAAS DEMO",
    title: "Интерактивный прототип платежной платформы",
    subtitle: "Локальное приложение, которое показывает роли, процессы, статусы, операции, связи сущностей и бизнес-логику на мок-данных.",
    badge: "Next.js · TypeScript · Prisma · SQLite",
    note: "Открывающий слайд. Акцент: это рабочий прототип, а не статичная картинка."
  },
  {
    kicker: "01 · Суть решения",
    title: "Что уже собрано",
    subtitle: "Прототип объединяет интерфейс, локальные API, базу данных, seed-данные и сценарии, чтобы быстро объяснить продукт партнеру или инвестору.",
    cards: [
      ["Рабочая локальная система", "Запускается на компьютере и открывается в браузере без внешних платежных сервисов."],
      ["Живые данные и действия", "Статусы меняются, балансы пересчитываются, уведомления и события создаются автоматически."],
      ["Презентационный контур", "Можно показать роли, модули, жизненный цикл операции и спорные сценарии на понятных мок-данных."]
    ]
  },
  {
    kicker: "02 · Роли",
    title: "Роли и зоны ответственности",
    subtitle: "Переключатель ролей показывает, как один продукт выглядит для разных участников платежного процесса.",
    lanes: [
      ["Администратор", "Вся система, провайдеры, настройки, аудит"],
      ["Мерчант", "Свои ордера, выплаты, баланс, API"],
      ["Оператор", "Статусы, реквизиты, ручная обработка"],
      ["Финансы", "Балансы, комиссии, холды, выплаты"],
      ["Support", "Апелляции, комментарии, решения"]
    ]
  },
  {
    kicker: "03 · Модули",
    title: "Покрытие продукта",
    subtitle: "Внутри есть не только экраны, но и связанная логика между операционными, финансовыми и support-модулями.",
    modules: [
      "Дашборд", "Ордера", "Выплаты", "Реквизиты", "Балансы", "Комиссии",
      "Апелляции", "Уведомления", "Журнал событий", "Интеграции", "API-демо", "Карта процессов"
    ]
  },
  {
    kicker: "04 · Операционный поток",
    title: "Жизненный цикл платежного ордера",
    subtitle: "Ордер проходит понятную цепочку статусов, а финансовое действие происходит только в бизнес-значимых переходах.",
    flow: ["Создан", "Ожидает оплаты", "Оплачен", "Подтвержден", "Завершен"],
    side: ["Спорная ветка", "Операция может уйти в спор, создать апелляцию и заморозить часть баланса до решения."]
  },
  {
    kicker: "05 · Финансы",
    title: "Балансы, комиссии и холды",
    subtitle: "Финансовая логика объясняет, когда деньги доступны, когда они заморожены и как фиксируются комиссии.",
    cards: [
      ["Доступный баланс", "Увеличивается после успешного ордера на сумму за вычетом комиссии."],
      ["Замороженный баланс", "Используется для выплат и спорных операций, чтобы снизить риск двойного расходования."],
      ["Комиссии", "Фиксируются на уровне операции и отражают экономику платформы и провайдеров."]
    ]
  },
  {
    kicker: "06 · Риски",
    title: "Апелляции и спорные операции",
    subtitle: "Спор не теряется в комментариях: он становится сущностью с причиной, ответственным, историей, решением и влиянием на баланс.",
    process: [
      ["Новая", "создана по ордеру"],
      ["В работе", "support проверяет данные"],
      ["Решение", "в пользу мерчанта или платформы"],
      ["Баланс", "холд возвращается или списывается"]
    ]
  },
  {
    kicker: "07 · Интеграции",
    title: "API-демо и провайдеры",
    subtitle: "Локальные API routes показывают, как мерчант и провайдер могли бы обмениваться событиями без подключения реальных сервисов.",
    code: [
      "POST /api/orders",
      "PATCH /api/orders/{id}/status",
      "POST /api/payouts",
      "PATCH /api/appeals/{id}/resolve"
    ],
    cards: [
      ["Провайдеры", "Статус, комиссия, доступность, pay-in/pay-out и тестовый режим."],
      ["Webhook-логика", "Пример изменения статуса через локальный API."],
      ["Безопасная песочница", "Нет реальных денег, внешних API и персональных данных."]
    ]
  },
  {
    kicker: "08 · Демонстрация",
    title: "10 кликабельных сценариев",
    subtitle: "Сценарии помогают за несколько минут показать весь продуктовый контур от создания ордера до решения апелляции.",
    scenarios: [
      "Создание ордера",
      "Назначение реквизитов",
      "Проведение статусов",
      "Начисление баланса",
      "Создание выплаты",
      "Подтверждение выплаты",
      "Заморозка спора",
      "Создание апелляции",
      "Рассмотрение support",
      "Финальное решение"
    ]
  },
  {
    kicker: "09 · Ценность",
    title: "Зачем это партнеру или инвестору",
    subtitle: "Прототип снижает неопределенность: можно увидеть продукт, пройти сценарии, обсудить логику и согласовать следующий этап разработки.",
    cards: [
      ["Быстрое понимание", "Продукт можно объяснить без длинных документов и схем в отрыве от интерфейса."],
      ["Проверка гипотез", "Сценарии на мок-данных помогают заметить спорные места в логике до production-разработки."],
      ["База для roadmap", "На основе прототипа проще оценить приоритеты, роли, интеграции и требования к безопасности."]
    ],
    footer: "Следующий этап: авторизация, RBAC, загрузка файлов, графики, расширенная маршрутизация и реальные интеграции."
  }
];

const inspect = [];

function line(fill = C.transparent, width = 0) {
  return { style: "solid", fill, width };
}

function addShape(slide, geometry, x, y, w, h, fill = C.transparent, stroke = C.transparent, strokeWidth = 0, role = "shape") {
  const shape = slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: line(stroke, strokeWidth)
  });
  inspect.push({ kind: "shape", role, bbox: [x, y, w, h] });
  return shape;
}

function addText(slide, slideNo, text, x, y, w, h, opts = {}) {
  const box = addShape(slide, "rect", x, y, w, h, opts.fill ?? C.transparent, opts.stroke ?? C.transparent, opts.strokeWidth ?? 0, opts.role ?? "text");
  box.text = Array.isArray(text) ? text.join("\n") : String(text);
  box.text.fontSize = opts.size ?? 22;
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
    text: Array.isArray(text) ? text.join("\n") : String(text),
    textChars: String(text).length,
    textLines: Array.isArray(text) ? text.length : String(text).split(/\n/).length,
    bbox: [x, y, w, h]
  });
  return box;
}

function addBackground(slide, slideNo) {
  slide.background.fill = C.pearl;
  addShape(slide, "ellipse", -180, -170, 520, 520, "#B5863B26", C.transparent, 0, "warm glow");
  addShape(slide, "ellipse", 930, -190, 500, 500, "#0D766C24", C.transparent, 0, "jade glow");
  addShape(slide, "ellipse", 900, 475, 420, 260, "#17483F12", C.transparent, 0, "moss shadow");
  addShape(slide, "rect", 0, 0, W, H, "#FFFFFF88", C.transparent, 0, "soft veil");
  addText(slide, slideNo, `${String(slideNo).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`, 1126, 36, 90, 24, {
    size: 13,
    color: C.moss,
    bold: true,
    face: FONT.mono,
    align: "right",
    role: "page number"
  });
}

function addHeader(slide, slideNo, kicker) {
  addText(slide, slideNo, kicker.toUpperCase(), 64, 36, 560, 24, {
    size: 13,
    color: C.jade,
    bold: true,
    face: FONT.mono,
    role: "kicker"
  });
  addShape(slide, "rect", 64, 68, 1152, 2, "#14241F26", C.transparent, 0, "header rule");
}

function addTitle(slide, slideNo, data, y = 92, width = 760) {
  addText(slide, slideNo, data.title, 64, y, width, 108, {
    size: 39,
    color: C.ink,
    bold: true,
    face: FONT.title,
    role: "title"
  });
  addText(slide, slideNo, data.subtitle, 66, y + 118, Math.min(width + 80, 840), 72, {
    size: 18,
    color: C.graphite,
    face: FONT.body,
    role: "subtitle"
  });
}

function addPanel(slide, x, y, w, h, fill = "#FBFAF6E8", role = "panel") {
  addShape(slide, "roundRect", x, y, w, h, fill, "#14241F20", 1.2, role);
}

function addCard(slide, slideNo, x, y, w, h, label, body, accent = C.jade) {
  addPanel(slide, x, y, w, h, "#FBFAF6EA", `card ${label}`);
  addShape(slide, "rect", x, y, 8, h, accent, C.transparent, 0, `card accent ${label}`);
  addShape(slide, "ellipse", x + 24, y + 24, 44, 44, "#FFFFFF", "#14241F18", 1, `card icon ${label}`);
  addShape(slide, "rect", x + 40, y + 39, 12, 18, accent, C.transparent, 0, "icon bar");
  addText(slide, slideNo, label, x + 84, y + 24, w - 108, 28, {
    size: 15,
    color: accent,
    bold: true,
    face: FONT.mono,
    role: "card label"
  });
  addText(slide, slideNo, body, x + 28, y + 88, w - 56, h - 106, {
    size: 17,
    color: C.graphite,
    face: FONT.body,
    role: "card body"
  });
}

function addMetric(slide, slideNo, x, y, value, label, accent) {
  addPanel(slide, x, y, 205, 126, "#FFFFFFD8", `metric ${label}`);
  addText(slide, slideNo, value, x + 20, y + 20, 165, 48, {
    size: 36,
    color: C.ink,
    bold: true,
    face: FONT.title,
    role: "metric value"
  });
  addText(slide, slideNo, label, x + 22, y + 74, 160, 36, {
    size: 14,
    color: C.graphite,
    face: FONT.body,
    role: "metric label"
  });
  addShape(slide, "rect", x, y, 205, 6, accent, C.transparent, 0, "metric accent");
}

function notes(slide, text) {
  slide.speakerNotes.setText(text);
}

function slideCover(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  addBackground(slide, slideNo);
  addShape(slide, "rect", 64, 112, 8, 410, C.jade, C.transparent, 0, "cover accent");
  addText(slide, slideNo, data.kicker, 92, 112, 520, 26, { size: 14, color: C.jade, bold: true, face: FONT.mono, role: "kicker" });
  addText(slide, slideNo, data.title, 88, 160, 760, 150, { size: 48, color: C.ink, bold: true, face: FONT.title, role: "cover title" });
  addText(slide, slideNo, data.subtitle, 92, 332, 640, 92, { size: 20, color: C.graphite, role: "cover subtitle" });
  addPanel(slide, 92, 476, 430, 76, "#14241FEA", "stack badge");
  addText(slide, slideNo, data.badge, 118, 500, 378, 30, { size: 17, color: C.pearl, bold: true, face: FONT.body, role: "tech stack" });
  addPanel(slide, 828, 130, 338, 440, "#FFFFFFAA", "hero panel");
  ["Роли", "Ордера", "Балансы", "Апелляции", "API", "Сценарии"].forEach((item, i) => {
    const x = 870 + (i % 2) * 142;
    const y = 184 + Math.floor(i / 2) * 92;
    addShape(slide, "roundRect", x, y, 116, 54, i % 2 ? "#B5863B22" : "#0D766C22", "#14241F18", 1, `hero chip ${item}`);
    addText(slide, slideNo, item, x + 12, y + 16, 92, 22, { size: 16, bold: true, color: C.ink, align: "center", role: "hero chip" });
  });
  addText(slide, slideNo, "Работает локально · данные моковые · логика кликабельная", 824, 500, 348, 42, { size: 18, color: C.moss, bold: true, align: "center", role: "hero claim" });
  notes(slide, data.note);
}

function slideCards(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  addBackground(slide, slideNo);
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data);
  const accents = [C.jade, C.brass, C.moss];
  data.cards.forEach((card, i) => addCard(slide, slideNo, 82 + i * 382, 420, 340, 180, card[0], card[1], accents[i]));
  if (data.metrics) {
    data.metrics.forEach((metric, i) => addMetric(slide, slideNo, 82 + i * 225, 572, metric[0], metric[1], accents[i]));
  }
  if (data.footer) {
    addText(slide, slideNo, data.footer, 84, 628, 1040, 46, { size: 16, color: C.graphite, role: "footer callout" });
  }
  notes(slide, data.subtitle);
}

function slideRoles(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  addBackground(slide, slideNo);
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data, 92, 720);
  data.lanes.forEach((lane, i) => {
    const y = 352 + i * 58;
    addShape(slide, "roundRect", 92, y, 1090, 44, i % 2 ? "#FFFFFFC8" : "#D9ECE8B8", "#14241F14", 1, `role lane ${lane[0]}`);
    addText(slide, slideNo, lane[0], 118, y + 12, 190, 18, { size: 15, color: C.ink, bold: true, role: "role name" });
    addText(slide, slideNo, lane[1], 330, y + 12, 760, 18, { size: 15, color: C.graphite, role: "role responsibility" });
  });
  notes(slide, data.subtitle);
}

function slideModules(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  addBackground(slide, slideNo);
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data, 92, 760);
  data.modules.forEach((module, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 92 + col * 282;
    const y = 352 + row * 86;
    addPanel(slide, x, y, 250, 58, i % 3 === 0 ? "#0D766C18" : i % 3 === 1 ? "#B5863B18" : "#FFFFFFD6", `module ${module}`);
    addText(slide, slideNo, module, x + 18, y + 17, 214, 20, { size: 16, color: C.ink, bold: true, align: "center", role: "module name" });
  });
  notes(slide, data.subtitle);
}

function slideFlow(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  addBackground(slide, slideNo);
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data, 92, 760);
  data.flow.forEach((step, i) => {
    const x = 82 + i * 224;
    addShape(slide, "ellipse", x + 72, 386, 58, 58, i === data.flow.length - 1 ? C.jade : "#FFFFFF", C.jade, 2, `flow node ${step}`);
    addText(slide, slideNo, String(i + 1), x + 89, 402, 24, 22, { size: 18, color: i === data.flow.length - 1 ? C.white : C.jade, bold: true, align: "center", role: "flow number" });
    addText(slide, slideNo, step, x, 462, 204, 42, { size: 17, color: C.ink, bold: true, align: "center", role: "flow label" });
    if (i < data.flow.length - 1) addShape(slide, "rightArrow", x + 148, 401, 86, 28, "#0D766C55", C.transparent, 0, "flow arrow");
  });
  addPanel(slide, 260, 568, 760, 78, "#B5863B1F", "dispute branch");
  addText(slide, slideNo, data.side[0], 290, 588, 180, 26, { size: 18, color: C.brass, bold: true, face: FONT.title, role: "dispute title" });
  addText(slide, slideNo, data.side[1], 486, 586, 480, 36, { size: 16, color: C.graphite, role: "dispute body" });
  notes(slide, data.subtitle);
}

function slideAppeals(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  addBackground(slide, slideNo);
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data, 92, 760);
  data.process.forEach((item, i) => {
    const x = 100 + i * 276;
    addPanel(slide, x, 388, 230, 154, i === 2 ? "#B5863B20" : "#FFFFFFD6", `appeal step ${item[0]}`);
    addText(slide, slideNo, item[0], x + 24, 418, 182, 30, { size: 21, color: i === 2 ? C.brass : C.jade, bold: true, face: FONT.title, role: "appeal step title" });
    addText(slide, slideNo, item[1], x + 24, 468, 182, 42, { size: 16, color: C.graphite, align: "center", role: "appeal step body" });
    if (i < data.process.length - 1) addShape(slide, "rightArrow", x + 224, 447, 76, 30, "#17483F55", C.transparent, 0, "appeal arrow");
  });
  notes(slide, data.subtitle);
}

function slideApi(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  addBackground(slide, slideNo);
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data, 92, 690);
  addPanel(slide, 82, 374, 468, 218, "#14241FF2", "api code panel");
  data.code.forEach((line, i) => addText(slide, slideNo, line, 112, 412 + i * 38, 410, 24, { size: 17, color: C.pearl, face: FONT.mono, role: "api endpoint" }));
  data.cards.forEach((card, i) => {
    const y = 350 + i * 92;
    const accent = [C.jade, C.brass, C.moss][i];
    addPanel(slide, 590, y, 560, 74, "#FFFFFFDC", `api compact ${card[0]}`);
    addShape(slide, "rect", 590, y, 7, 74, accent, C.transparent, 0, "api compact accent");
    addText(slide, slideNo, card[0], 622, y + 14, 190, 22, { size: 15, color: accent, bold: true, face: FONT.mono, role: "api compact title" });
    addText(slide, slideNo, card[1], 622, y + 40, 490, 20, { size: 13, color: C.graphite, role: "api compact body" });
  });
  notes(slide, data.subtitle);
}

function slideScenarios(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  addBackground(slide, slideNo);
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data, 92, 760);
  data.scenarios.forEach((scenario, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 112 + col * 520;
    const y = 330 + row * 54;
    addShape(slide, "ellipse", x, y, 32, 32, i < 5 ? C.jade : C.brass, C.transparent, 0, `scenario number ${i + 1}`);
    addText(slide, slideNo, String(i + 1), x + 8, y + 8, 16, 14, { size: 12, color: C.white, bold: true, align: "center", role: "scenario number" });
    addText(slide, slideNo, scenario, x + 46, y + 6, 420, 22, { size: 16, color: C.ink, bold: true, role: "scenario label" });
  });
  notes(slide, data.subtitle);
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
    if (index === 0) slideCover(presentation, data, slideNo);
    else if (data.lanes) slideRoles(presentation, data, slideNo);
    else if (data.modules) slideModules(presentation, data, slideNo);
    else if (data.flow) slideFlow(presentation, data, slideNo);
    else if (data.process) slideAppeals(presentation, data, slideNo);
    else if (data.code) slideApi(presentation, data, slideNo);
    else if (data.scenarios) slideScenarios(presentation, data, slideNo);
    else slideCards(presentation, data, slideNo);
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
