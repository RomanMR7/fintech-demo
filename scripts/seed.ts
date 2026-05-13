import { PrismaClient } from "@prisma/client";
import {
  AppealStatus,
  BalanceDirection,
  BalanceType,
  CommissionType,
  EventType,
  NotificationType,
  OrderStatus,
  PayoutStatus,
  ProviderStatus,
  RequisiteStatus,
  UserRole
} from "../lib/constants";

const prisma = new PrismaClient();

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

const money = (value: number) => value.toFixed(2);
const commission = (amount: number, rate: number) => Number((amount * rate).toFixed(2));

async function main() {
  await prisma.scenarioState.deleteMany();
  await prisma.eventLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.appealComment.deleteMany();
  await prisma.appeal.deleteMany();
  await prisma.balanceTransaction.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.paymentOrder.deleteMany();
  await prisma.paymentRequisite.deleteMany();
  await prisma.commissionRule.deleteMany();
  await prisma.balanceAccount.deleteMany();
  await prisma.user.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.merchant.deleteMany();

  await prisma.merchant.createMany({
    data: [
      {
        id: "merchant-orbita",
        name: "ООО Орбита Маркет",
        displayName: "Орбита",
        apiKey: "demo_orbita_9f8a",
        callbackUrl: "https://orbita.example/webhook",
        payinFeeRate: "0.025",
        payoutFeeRate: "0.015",
        trustLimit: "1800000"
      },
      {
        id: "merchant-nova",
        name: "Нова Геймс",
        displayName: "Nova Games",
        apiKey: "demo_nova_1bc2",
        callbackUrl: "https://nova.example/payment/callback",
        payinFeeRate: "0.028",
        payoutFeeRate: "0.018",
        trustLimit: "950000"
      },
      {
        id: "merchant-sigma",
        name: "Сигма Тревел",
        displayName: "Sigma Travel",
        apiKey: "demo_sigma_7ad4",
        callbackUrl: "https://sigma.example/api/payments",
        payinFeeRate: "0.022",
        payoutFeeRate: "0.014",
        trustLimit: "1250000"
      }
    ]
  });

  await prisma.user.createMany({
    data: [
      {
        id: "user-admin",
        name: "Алина Волкова",
        email: "admin.demo@example.local",
        role: UserRole.PLATFORM_ADMIN
      },
      {
        id: "user-merchant",
        name: "Илья Соколов",
        email: "merchant.demo@example.local",
        role: UserRole.MERCHANT,
        merchantId: "merchant-orbita"
      },
      {
        id: "user-operator",
        name: "Мария Лебедева",
        email: "operator.demo@example.local",
        role: UserRole.OPERATOR
      },
      {
        id: "user-finance",
        name: "Глеб Фомин",
        email: "finance.demo@example.local",
        role: UserRole.FINANCE_MANAGER
      },
      {
        id: "user-support",
        name: "Надежда Ким",
        email: "support.demo@example.local",
        role: UserRole.SUPPORT
      }
    ]
  });

  await prisma.provider.createMany({
    data: [
      {
        id: "provider-cascade",
        name: "payphoria-cascade",
        displayName: "Payphoria Cascade",
        type: "Каскадный агрегатор",
        status: ProviderStatus.ACTIVE,
        commissionRate: "0.014",
        availability: 99,
        testMode: true,
        payinAvailable: true,
        payoutAvailable: true
      },
      {
        id: "provider-fireex",
        name: "fireex",
        displayName: "Fireex Box",
        type: "Коробка с API",
        status: ProviderStatus.ACTIVE,
        commissionRate: "0.018",
        availability: 97,
        testMode: true,
        payinAvailable: true,
        payoutAvailable: false
      },
      {
        id: "provider-titan",
        name: "titanpay",
        displayName: "TitanPay",
        type: "P2P-провайдер",
        status: ProviderStatus.DEGRADED,
        commissionRate: "0.021",
        availability: 84,
        testMode: true,
        payinAvailable: true,
        payoutAvailable: true
      },
      {
        id: "provider-flow",
        name: "payflow",
        displayName: "PayFlow",
        type: "Выплатной шлюз",
        status: ProviderStatus.ACTIVE,
        commissionRate: "0.016",
        availability: 96,
        testMode: true,
        payinAvailable: false,
        payoutAvailable: true
      },
      {
        id: "provider-test",
        name: "test_aggregator",
        displayName: "Тестовый агрегатор",
        type: "Песочница",
        status: ProviderStatus.MAINTENANCE,
        commissionRate: "0.010",
        availability: 62,
        testMode: true,
        payinAvailable: true,
        payoutAvailable: true
      }
    ]
  });

  await prisma.paymentRequisite.createMany({
    data: [
      {
        id: "req-sber-c2c",
        merchantId: "merchant-orbita",
        providerId: "provider-cascade",
        type: "C2C",
        bank: "Сбербанк",
        maskedNumber: "2202 **** **** 4831",
        holder: "А. Петров",
        status: RequisiteStatus.ACTIVE,
        dailyLimit: "900000",
        dailyUsed: "315000",
        minAmount: "1000",
        maxAmount: "150000",
        linkedOrders: 4
      },
      {
        id: "req-tinkoff-phone",
        merchantId: "merchant-orbita",
        providerId: "provider-fireex",
        type: "PHONE",
        bank: "Т-Банк",
        maskedNumber: "+7 999 *** 42-18",
        holder: "Е. Смирнова",
        status: RequisiteStatus.LIMITED,
        dailyLimit: "600000",
        dailyUsed: "552000",
        minAmount: "1500",
        maxAmount: "90000",
        linkedOrders: 2
      },
      {
        id: "req-orbita-usd",
        merchantId: "merchant-orbita",
        providerId: "provider-fireex",
        type: "USD_ACCOUNT",
        bank: "Demo Global Bank",
        maskedNumber: "USD **** 1842",
        holder: "Orbita Demo",
        status: RequisiteStatus.ACTIVE,
        currency: "USD",
        dailyLimit: "25000",
        dailyUsed: "4200",
        minAmount: "100",
        maxAmount: "5000",
        linkedOrders: 1
      },
      {
        id: "req-vtb-account",
        merchantId: "merchant-nova",
        providerId: "provider-titan",
        type: "ACCOUNT",
        bank: "ВТБ",
        maskedNumber: "40817 **** **** 0027",
        holder: "К. Иванов",
        status: RequisiteStatus.ACTIVE,
        dailyLimit: "750000",
        dailyUsed: "215000",
        minAmount: "2000",
        maxAmount: "120000",
        linkedOrders: 1
      },
      {
        id: "req-alfa-sbp",
        merchantId: "merchant-sigma",
        providerId: "provider-flow",
        type: "SBP",
        bank: "Альфа-Банк",
        maskedNumber: "+7 901 *** 71-40",
        holder: "О. Кузнецова",
        status: RequisiteStatus.ACTIVE,
        dailyLimit: "1100000",
        dailyUsed: "460000",
        minAmount: "1000",
        maxAmount: "200000",
        linkedOrders: 2
      },
      {
        id: "req-sigma-usd",
        merchantId: "merchant-sigma",
        providerId: "provider-cascade",
        type: "SWIFT",
        bank: "Demo Trust USD",
        maskedNumber: "SWIFT **** 7730",
        holder: "Sigma Demo",
        status: RequisiteStatus.ACTIVE,
        currency: "USD",
        dailyLimit: "30000",
        dailyUsed: "6100",
        minAmount: "100",
        maxAmount: "7000",
        linkedOrders: 1
      },
      {
        id: "req-ozon-c2c",
        merchantId: "merchant-nova",
        providerId: "provider-test",
        type: "C2C",
        bank: "Озон Банк",
        maskedNumber: "2204 **** **** 9038",
        holder: "Д. Морозов",
        status: RequisiteStatus.PAUSED,
        dailyLimit: "450000",
        dailyUsed: "120000",
        minAmount: "500",
        maxAmount: "60000",
        linkedOrders: 1
      }
    ]
  });

  await prisma.balanceAccount.createMany({
    data: [
      { id: "bal-orbita-available", merchantId: "merchant-orbita", type: BalanceType.AVAILABLE, currency: "RUB", amount: "1432500.00" },
      { id: "bal-orbita-frozen", merchantId: "merchant-orbita", type: BalanceType.FROZEN, currency: "RUB", amount: "185000.00" },
      { id: "bal-orbita-fees", merchantId: "merchant-orbita", type: BalanceType.FEES, currency: "RUB", amount: "82450.00" },
      { id: "bal-orbita-usd-available", merchantId: "merchant-orbita", type: BalanceType.AVAILABLE, currency: "USD", amount: "12500.00" },
      { id: "bal-orbita-usd-frozen", merchantId: "merchant-orbita", type: BalanceType.FROZEN, currency: "USD", amount: "800.00" },
      { id: "bal-orbita-usd-fees", merchantId: "merchant-orbita", type: BalanceType.FEES, currency: "USD", amount: "420.00" },
      { id: "bal-nova-available", merchantId: "merchant-nova", type: BalanceType.AVAILABLE, currency: "RUB", amount: "782300.00" },
      { id: "bal-nova-frozen", merchantId: "merchant-nova", type: BalanceType.FROZEN, currency: "RUB", amount: "64000.00" },
      { id: "bal-nova-fees", merchantId: "merchant-nova", type: BalanceType.FEES, currency: "RUB", amount: "39480.00" },
      { id: "bal-nova-usd-available", merchantId: "merchant-nova", type: BalanceType.AVAILABLE, currency: "USD", amount: "7400.00" },
      { id: "bal-nova-usd-frozen", merchantId: "merchant-nova", type: BalanceType.FROZEN, currency: "USD", amount: "1221.60" },
      { id: "bal-nova-usd-fees", merchantId: "merchant-nova", type: BalanceType.FEES, currency: "USD", amount: "210.00" },
      { id: "bal-sigma-available", merchantId: "merchant-sigma", type: BalanceType.AVAILABLE, currency: "RUB", amount: "1105400.00" },
      { id: "bal-sigma-frozen", merchantId: "merchant-sigma", type: BalanceType.FROZEN, currency: "RUB", amount: "121000.00" },
      { id: "bal-sigma-fees", merchantId: "merchant-sigma", type: BalanceType.FEES, currency: "RUB", amount: "51720.00" },
      { id: "bal-sigma-usd-available", merchantId: "merchant-sigma", type: BalanceType.AVAILABLE, currency: "USD", amount: "9800.00" },
      { id: "bal-sigma-usd-frozen", merchantId: "merchant-sigma", type: BalanceType.FROZEN, currency: "USD", amount: "1200.00" },
      { id: "bal-sigma-usd-fees", merchantId: "merchant-sigma", type: BalanceType.FEES, currency: "USD", amount: "315.00" }
    ]
  });

  const orders = [
    ["ord-1001", "M-1001", "merchant-orbita", "provider-cascade", "req-sber-c2c", 125000, "RUB", OrderStatus.COMPLETED, 0.025, daysAgo(6)],
    ["ord-1002", "M-1002", "merchant-orbita", "provider-fireex", "req-orbita-usd", 1250, "USD", OrderStatus.WAITING_PAYMENT, 0.025, daysAgo(5)],
    ["ord-1003", "M-1003", "merchant-orbita", "provider-cascade", "req-sber-c2c", 216000, "RUB", OrderStatus.DISPUTED, 0.025, daysAgo(4)],
    ["ord-1004", "N-2201", "merchant-nova", "provider-titan", "req-vtb-account", 94000, "RUB", OrderStatus.PAID, 0.028, daysAgo(3)],
    ["ord-1005", "N-2202", "merchant-nova", "provider-test", "req-ozon-c2c", 51000, "RUB", OrderStatus.FAILED, 0.028, daysAgo(3)],
    ["ord-1006", "S-3010", "merchant-sigma", "provider-flow", "req-alfa-sbp", 188000, "RUB", OrderStatus.CONFIRMED, 0.022, daysAgo(2)],
    ["ord-1007", "S-3011", "merchant-sigma", "provider-cascade", "req-sigma-usd", 1750, "USD", OrderStatus.CREATED, 0.022, daysAgo(2)],
    ["ord-1008", "M-1008", "merchant-orbita", "provider-cascade", "req-sber-c2c", 305000, "RUB", OrderStatus.COMPLETED, 0.025, daysAgo(1)],
    ["ord-1009", "N-2209", "merchant-nova", "provider-titan", "req-vtb-account", 116000, "RUB", OrderStatus.CANCELED, 0.028, hoursAgo(16)],
    ["ord-1010", "S-3020", "merchant-sigma", "provider-cascade", "req-alfa-sbp", 149000, "RUB", OrderStatus.WAITING_PAYMENT, 0.022, hoursAgo(8)]
  ] as const;

  for (const [id, externalId, merchantId, providerId, requisiteId, amount, currency, status, rate, createdAt] of orders) {
    const fee = commission(amount, rate);
    await prisma.paymentOrder.create({
      data: {
        id,
        externalId,
        merchantId,
        providerId,
        requisiteId,
        amount: money(amount),
        currency,
        status,
        commission: money(fee),
        platformFee: money(commission(amount, 0.006)),
        merchantNet: money(amount - fee),
        providerName: providerId === "provider-cascade" ? "Payphoria Cascade" : providerId === "provider-fireex" ? "Fireex Box" : providerId === "provider-flow" ? "PayFlow" : providerId === "provider-test" ? "Тестовый агрегатор" : "TitanPay",
        paymentUrl: `https://pay.local/demo/${externalId}`,
        metadata: JSON.stringify({ source: "seed", demo: true }),
        createdAt,
        paidAt: status === OrderStatus.PAID || status === OrderStatus.CONFIRMED || status === OrderStatus.COMPLETED || status === OrderStatus.DISPUTED ? new Date(createdAt.getTime() + 40 * 60 * 1000) : null,
        completedAt: status === OrderStatus.COMPLETED ? new Date(createdAt.getTime() + 90 * 60 * 1000) : null
      }
    });
  }

  await prisma.payout.createMany({
    data: [
      { id: "payout-501", merchantId: "merchant-orbita", amount: "250000.00", status: PayoutStatus.COMPLETED, recipient: "USDT TRC20: TX9q...K2a", commission: "3750.00", completedAt: daysAgo(2), createdAt: daysAgo(3) },
      { id: "payout-502", merchantId: "merchant-orbita", amount: "110000.00", status: PayoutStatus.PENDING_APPROVAL, recipient: "Счет 40817...7711", commission: "1650.00", createdAt: hoursAgo(10) },
      { id: "payout-503", merchantId: "merchant-nova", amount: "1200.00", currency: "USD", status: PayoutStatus.HOLD, recipient: "SWIFT USD: DEMO-781", commission: "21.60", createdAt: hoursAgo(20) },
      { id: "payout-504", merchantId: "merchant-sigma", amount: "121000.00", status: PayoutStatus.DISPUTED, recipient: "СБП +7 905 *** 55-10", commission: "1694.00", createdAt: daysAgo(1) },
      { id: "payout-505", merchantId: "merchant-sigma", amount: "83000.00", status: PayoutStatus.CANCELED, recipient: "Счет 40817...4202", commission: "1162.00", createdAt: daysAgo(4) }
    ]
  });

  await prisma.commissionRule.createMany({
    data: [
      { id: "fee-payin-base", name: "Базовая комиссия pay-in", type: CommissionType.PAYIN, rate: "0.025", minAmount: "1000", maxAmount: "300000", description: "Используется для стандартных платежных ордеров." },
      { id: "fee-payout-base", name: "Базовая комиссия выплаты", type: CommissionType.PAYOUT, rate: "0.015", minAmount: "5000", maxAmount: "500000", description: "Списывается при создании выплаты мерчантом." },
      { id: "fee-platform", name: "Платформенный доход", type: CommissionType.PLATFORM, rate: "0.006", minAmount: "0", maxAmount: "0", description: "Доля платформы внутри комиссии ордера." },
      { id: "fee-dispute", name: "Холд спорной операции", type: CommissionType.DISPUTE, rate: "0.150", minAmount: "0", maxAmount: "100000", description: "Доля суммы, которую демо замораживает при апелляции." }
    ]
  });

  await prisma.appeal.createMany({
    data: [
      {
        id: "appeal-701",
        orderId: "ord-1003",
        merchantId: "merchant-orbita",
        authorId: "user-merchant",
        assigneeId: "user-support",
        reason: "Плательщик приложил чек, но провайдер не подтвердил поступление.",
        status: AppealStatus.OPEN,
        frozenAmount: "32400.00",
        decision: null,
        createdAt: daysAgo(3)
      },
      {
        id: "appeal-702",
        orderId: "ord-1005",
        merchantId: "merchant-nova",
        authorId: "user-operator",
        assigneeId: "user-support",
        reason: "Реквизит был недоступен в момент оплаты.",
        status: AppealStatus.REJECTED,
        frozenAmount: "0.00",
        decision: "Отклонено: платеж не был найден у провайдера.",
        createdAt: daysAgo(2),
        resolvedAt: daysAgo(1)
      },
      {
        id: "appeal-703",
        orderId: "ord-1006",
        merchantId: "merchant-sigma",
        authorId: "user-support",
        assigneeId: "user-support",
        reason: "Сумма в чеке отличается от суммы ордера.",
        status: AppealStatus.NEW,
        frozenAmount: "28200.00",
        decision: null,
        createdAt: hoursAgo(7)
      }
    ]
  });

  await prisma.appealComment.createMany({
    data: [
      { id: "comment-1", appealId: "appeal-701", userId: "user-merchant", authorRole: UserRole.MERCHANT, message: "Загрузили чек и скрин из личного кабинета банка.", createdAt: daysAgo(3) },
      { id: "comment-2", appealId: "appeal-701", userId: "user-support", authorRole: UserRole.SUPPORT, message: "Запросили подтверждение у провайдера Payphoria Cascade.", createdAt: daysAgo(2) },
      { id: "comment-3", appealId: "appeal-702", userId: "user-support", authorRole: UserRole.SUPPORT, message: "По логам провайдера успешного webhook не было.", createdAt: daysAgo(1) },
      { id: "comment-4", appealId: "appeal-703", userId: "user-operator", authorRole: UserRole.OPERATOR, message: "Оператор пометил ордер как требующий ручной сверки.", createdAt: hoursAgo(6) }
    ]
  });

  await prisma.balanceTransaction.createMany({
    data: [
      { id: "tx-1", merchantId: "merchant-orbita", balanceId: "bal-orbita-available", orderId: "ord-1001", type: "Начисление по ордеру", direction: BalanceDirection.CREDIT, amount: "121875.00", currency: "RUB", beforeAmount: "1010000.00", afterAmount: "1131875.00", description: "Ордер M-1001 завершен." },
      { id: "tx-2", merchantId: "merchant-orbita", balanceId: "bal-orbita-fees", orderId: "ord-1001", type: "Комиссия", direction: BalanceDirection.CREDIT, amount: "3125.00", currency: "RUB", beforeAmount: "72000.00", afterAmount: "75125.00", description: "Удержана комиссия по ордеру." },
      { id: "tx-3", merchantId: "merchant-orbita", balanceId: "bal-orbita-frozen", appealId: "appeal-701", type: "Заморозка", direction: BalanceDirection.FREEZE, amount: "32400.00", currency: "RUB", beforeAmount: "152600.00", afterAmount: "185000.00", description: "Холд по апелляции appeal-701." },
      { id: "tx-4", merchantId: "merchant-orbita", balanceId: "bal-orbita-frozen", payoutId: "payout-502", type: "Резерв выплаты", direction: BalanceDirection.FREEZE, amount: "111650.00", currency: "RUB", beforeAmount: "73350.00", afterAmount: "185000.00", description: "Создана выплата payout-502." },
      { id: "tx-5", merchantId: "merchant-nova", balanceId: "bal-nova-usd-frozen", payoutId: "payout-503", type: "Резерв выплаты", direction: BalanceDirection.FREEZE, amount: "1221.60", currency: "USD", beforeAmount: "0.00", afterAmount: "1221.60", description: "USD-выплата ожидает подтверждения." },
      { id: "tx-6", merchantId: "merchant-sigma", balanceId: "bal-sigma-frozen", appealId: "appeal-703", type: "Заморозка", direction: BalanceDirection.FREEZE, amount: "28200.00", currency: "RUB", beforeAmount: "92800.00", afterAmount: "121000.00", description: "Спор по сумме чека." },
      { id: "tx-7", merchantId: "merchant-orbita", balanceId: "bal-orbita-available", payoutId: "payout-501", type: "Списание выплаты", direction: BalanceDirection.DEBIT, amount: "253750.00", currency: "RUB", beforeAmount: "1686250.00", afterAmount: "1432500.00", description: "Выплата подтверждена финансовым менеджером." },
      { id: "tx-8", merchantId: "merchant-sigma", balanceId: "bal-sigma-available", orderId: "ord-1006", type: "Ожидаемое начисление", direction: BalanceDirection.CREDIT, amount: "183864.00", currency: "RUB", beforeAmount: "921536.00", afterAmount: "1105400.00", description: "Ордер подтвержден, ожидает финального завершения." }
    ]
  });

  const events = [
    [EventType.ORDER_CREATED, UserRole.MERCHANT, "Илья Соколов", "Ордер M-1001 создан", "Мерчант создал платежный ордер на 125 000 RUB.", "PaymentOrder", "ord-1001"],
    [EventType.STATUS_CHANGED, UserRole.OPERATOR, "Мария Лебедева", "Статус M-1001 изменен", "Оператор подтвердил оплату и завершил ордер.", "PaymentOrder", "ord-1001"],
    [EventType.BALANCE_CHANGED, UserRole.FINANCE_MANAGER, "Глеб Фомин", "Баланс Орбиты обновлен", "Доступный баланс увеличен после успешного ордера.", "BalanceAccount", "bal-orbita-available"],
    [EventType.ORDER_CREATED, UserRole.MERCHANT, "Илья Соколов", "Ордер M-1002 создан", "Ожидает оплаты по USD-реквизиту Demo Global Bank.", "PaymentOrder", "ord-1002"],
    [EventType.APPEAL_CREATED, UserRole.MERCHANT, "Илья Соколов", "Создана апелляция", "По ордеру M-1003 открыт спор.", "Appeal", "appeal-701"],
    [EventType.BALANCE_FROZEN, UserRole.SUPPORT, "Надежда Ким", "Заморожена спорная сумма", "По апелляции appeal-701 заморожено 32 400 RUB.", "Appeal", "appeal-701"],
    [EventType.PAYOUT_CREATED, UserRole.MERCHANT, "Илья Соколов", "Создана выплата", "Выплата payout-502 ожидает подтверждения.", "Payout", "payout-502"],
    [EventType.STATUS_CHANGED, UserRole.OPERATOR, "Мария Лебедева", "Ордер N-2201 оплачен", "Провайдер TitanPay прислал webhook об оплате.", "PaymentOrder", "ord-1004"],
    [EventType.STATUS_CHANGED, UserRole.OPERATOR, "Мария Лебедева", "Ордер N-2202 завершился ошибкой", "Не найден подходящий реквизит у тестового агрегатора.", "PaymentOrder", "ord-1005"],
    [EventType.APPEAL_RESOLVED, UserRole.SUPPORT, "Надежда Ким", "Апелляция appeal-702 отклонена", "Платеж не найден у провайдера.", "Appeal", "appeal-702"],
    [EventType.STATUS_CHANGED, UserRole.OPERATOR, "Мария Лебедева", "Ордер S-3010 подтвержден", "Ожидается финальное завершение.", "PaymentOrder", "ord-1006"],
    [EventType.ORDER_CREATED, UserRole.MERCHANT, "Системный API", "Ордер S-3011 создан", "Платежный ордер создан через API.", "PaymentOrder", "ord-1007"],
    [EventType.STATUS_CHANGED, UserRole.OPERATOR, "Мария Лебедева", "Ордер M-1008 завершен", "Успешная операция по Payphoria Cascade.", "PaymentOrder", "ord-1008"],
    [EventType.BALANCE_CHANGED, UserRole.FINANCE_MANAGER, "Глеб Фомин", "Начисление по M-1008", "Доступный баланс увеличен на сумму за вычетом комиссии.", "BalanceAccount", "bal-orbita-available"],
    [EventType.STATUS_CHANGED, UserRole.OPERATOR, "Мария Лебедева", "Ордер N-2209 отменен", "Истекло время ожидания оплаты.", "PaymentOrder", "ord-1009"],
    [EventType.ORDER_CREATED, UserRole.MERCHANT, "API Sigma", "Ордер S-3020 создан", "Ожидает оплаты через каскад.", "PaymentOrder", "ord-1010"],
    [EventType.REQUISITE_CHANGED, UserRole.OPERATOR, "Мария Лебедева", "Реквизит Т-Банк ограничен", "Достигнут дневной лимит, новые ордера временно не назначаются.", "PaymentRequisite", "req-tinkoff-phone"],
    [EventType.PAYOUT_CREATED, UserRole.MERCHANT, "API Nova", "USD-выплата payout-503 создана", "Средства переведены в долларовый холд до проверки.", "Payout", "payout-503"],
    [EventType.BALANCE_FROZEN, UserRole.FINANCE_MANAGER, "Глеб Фомин", "Холд по USD-выплате Nova", "Зарезервирована сумма выплаты и комиссия в USD.", "Payout", "payout-503"],
    [EventType.NOTIFICATION_CREATED, UserRole.PLATFORM_ADMIN, "Система", "Сформированы уведомления", "Уведомления распределены по ролям демо-продукта.", "Notification", "seed"]
  ] as const;

  for (let index = 0; index < events.length; index += 1) {
    const [type, actorRole, actorName, title, description, entityType, entityId] = events[index];
    await prisma.eventLog.create({
      data: {
        id: `event-${index + 1}`,
        type,
        actorRole,
        actorName,
        title,
        description,
        entityType,
        entityId,
        createdAt: hoursAgo(30 - index),
        metadata: JSON.stringify({ seed: true, index: index + 1 })
      }
    });
  }

  await prisma.notification.createMany({
    data: [
      { id: "notif-1", role: UserRole.PLATFORM_ADMIN, title: "Новый спорный ордер", message: "Ордер M-1003 переведен в апелляцию.", type: NotificationType.ACTION_REQUIRED, merchantId: "merchant-orbita", createdAt: hoursAgo(25) },
      { id: "notif-2", role: UserRole.MERCHANT, title: "Ордер завершен", message: "M-1008 успешно завершен, баланс обновлен.", type: NotificationType.SUCCESS, merchantId: "merchant-orbita", createdAt: hoursAgo(14) },
      { id: "notif-3", role: UserRole.OPERATOR, title: "Нужна ручная проверка", message: "S-3010 подтвержден, но требует сверки суммы.", type: NotificationType.WARNING, merchantId: "merchant-sigma", createdAt: hoursAgo(7) },
      { id: "notif-4", role: UserRole.FINANCE_MANAGER, title: "Выплата ожидает подтверждения", message: "payout-502 на 110 000 RUB ожидает решения.", type: NotificationType.ACTION_REQUIRED, merchantId: "merchant-orbita", createdAt: hoursAgo(10) },
      { id: "notif-5", role: UserRole.SUPPORT, title: "Новая апелляция", message: "appeal-703 назначена на support-команду.", type: NotificationType.ACTION_REQUIRED, merchantId: "merchant-sigma", createdAt: hoursAgo(6) },
      { id: "notif-6", role: UserRole.MERCHANT, title: "Реквизит близок к лимиту", message: "Т-Банк PHONE использовал 92% дневного лимита.", type: NotificationType.WARNING, merchantId: "merchant-orbita", createdAt: hoursAgo(12) },
      { id: "notif-7", role: UserRole.OPERATOR, title: "Провайдер TitanPay деградирует", message: "Доступность провайдера снизилась до 84%.", type: NotificationType.WARNING, createdAt: hoursAgo(18) },
      { id: "notif-8", role: UserRole.PLATFORM_ADMIN, title: "Seed-данные готовы", message: "Локальный демо-контур заполнен мок-данными.", type: NotificationType.INFO, createdAt: hoursAgo(1) },
      { id: "notif-9", role: UserRole.FINANCE_MANAGER, title: "USD-холд Nova", message: "По payout-503 зарезервировано 1 221.60 USD.", type: NotificationType.INFO, merchantId: "merchant-nova", createdAt: hoursAgo(20) },
      { id: "notif-10", role: UserRole.SUPPORT, title: "Апелляция отклонена", message: "appeal-702 закрыта с решением в пользу платформы.", type: NotificationType.SUCCESS, merchantId: "merchant-nova", createdAt: hoursAgo(22) }
    ]
  });

  await prisma.scenarioState.createMany({
    data: [
      { key: "merchant-create-order", title: "Мерчант создает платежный ордер", description: "Создаем новый pay-in ордер от лица мерчанта и уведомляем операционную команду.", totalSteps: 3 },
      { key: "assign-requisite", title: "Платформа назначает реквизиты", description: "Находим активный реквизит и переводим ордер в ожидание оплаты.", totalSteps: 3 },
      { key: "order-status-flow", title: "Оператор проводит ордер по статусам", description: "Показываем цепочку создан -> ожидает оплаты -> оплачен -> подтвержден -> завершен.", totalSteps: 5 },
      { key: "balance-after-success", title: "Успешный ордер обновляет баланс", description: "Финализируем оплаченный ордер и начисляем сумму за вычетом комиссии.", totalSteps: 3 },
      { key: "merchant-create-payout", title: "Мерчант создает выплату", description: "Создаем выплату и резервируем сумму на замороженном балансе.", totalSteps: 3 },
      { key: "finance-approve-payout", title: "Финансовый менеджер подтверждает выплату", description: "Подтверждаем выплату и списываем сумму из холда.", totalSteps: 3 },
      { key: "freeze-disputed", title: "Спорная операция замораживает баланс", description: "Переводим ордер в спорный статус и замораживаем часть суммы.", totalSteps: 3 },
      { key: "create-appeal", title: "Создается апелляция", description: "Support получает обращение, связанное с конкретным ордером.", totalSteps: 3 },
      { key: "support-review-appeal", title: "Support рассматривает апелляцию", description: "Добавляем комментарии и переводим апелляцию в работу.", totalSteps: 3 },
      { key: "appeal-resolution-balance", title: "Решение апелляции меняет баланс", description: "Закрываем спор и показываем возврат или списание замороженной суммы.", totalSteps: 3 }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed-данные для fintech demo успешно созданы.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
