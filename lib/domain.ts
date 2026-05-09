import { Prisma, PrismaClient } from "@prisma/client";

import {
  AppealStatus,
  BalanceDirection,
  BalanceType,
  EventType,
  NotificationType,
  OrderStatus,
  PayoutStatus,
  ProviderStatus,
  RequisiteStatus,
  UserRole,
  type BalanceDirectionValue,
  type BalanceTypeValue,
  type EventTypeValue,
  type NotificationTypeValue,
  type OrderStatusValue
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type DbClient = Prisma.TransactionClient | PrismaClient;

const scenarioActor = {
  name: "Демо-сценарий",
  role: UserRole.PLATFORM_ADMIN
};

async function getBalance(db: DbClient, merchantId: string, type: BalanceTypeValue) {
  const existing = await db.balanceAccount.findUnique({
    where: { merchantId_type_currency: { merchantId, type, currency: "RUB" } }
  });

  if (existing) return existing;

  return db.balanceAccount.create({
    data: {
      merchantId,
      type,
      currency: "RUB",
      amount: "0"
    }
  });
}

async function moveBalance(
  db: DbClient,
  params: {
    merchantId: string;
    type: BalanceTypeValue;
    direction: BalanceDirectionValue;
    amount: Prisma.Decimal;
    description: string;
    orderId?: string;
    payoutId?: string;
    appealId?: string;
  }
) {
  const balance = await getBalance(db, params.merchantId, params.type);
  const before = new Prisma.Decimal(balance.amount);
  const signedAmount =
    params.direction === BalanceDirection.CREDIT || params.direction === BalanceDirection.UNFREEZE || params.direction === BalanceDirection.FREEZE
      ? params.amount
      : params.amount.negated();
  const after = before.plus(signedAmount);

  await db.balanceAccount.update({
    where: { id: balance.id },
    data: { amount: after }
  });

  await db.balanceTransaction.create({
    data: {
      merchantId: params.merchantId,
      balanceId: balance.id,
      orderId: params.orderId,
      payoutId: params.payoutId,
      appealId: params.appealId,
      type: params.description,
      direction: params.direction,
      amount: params.amount,
      beforeAmount: before,
      afterAmount: after,
      description: params.description
    }
  });
}

async function writeEventAndNotification(
  db: DbClient,
  params: {
    actorRole: string;
    actorName: string;
    type: EventTypeValue;
    entityType: string;
    entityId: string;
    title: string;
    description: string;
    notifyRole?: string;
    merchantId?: string | null;
    notificationType?: NotificationTypeValue;
  }
) {
  await db.eventLog.create({
    data: {
      actorRole: params.actorRole,
      actorName: params.actorName,
      type: params.type,
      entityType: params.entityType,
      entityId: params.entityId,
      title: params.title,
      description: params.description,
      metadata: JSON.stringify({ demo: true })
    }
  });

  if (params.notifyRole) {
    await db.notification.create({
      data: {
        role: params.notifyRole,
        merchantId: params.merchantId ?? undefined,
        title: params.title,
        message: params.description,
        type: params.notificationType ?? NotificationType.INFO
      }
    });
  }
}

function statusTimestamp(status: OrderStatusValue) {
  if (status === OrderStatus.PAID) return { paidAt: new Date() };
  if (status === OrderStatus.COMPLETED) return { paidAt: new Date(), completedAt: new Date() };
  return {};
}

export async function createDemoOrder(actorRole: string = UserRole.MERCHANT) {
  const merchant = await prisma.merchant.findFirst({ orderBy: { createdAt: "asc" } });
  const provider = await prisma.provider.findFirst({ where: { payinAvailable: true, status: { not: ProviderStatus.DISABLED } } });
  if (!merchant) throw new Error("Нет мерчанта для создания ордера.");

  const amount = new Prisma.Decimal(70000 + Math.floor(Math.random() * 90000));
  const commission = amount.mul(merchant.payinFeeRate);
  const idSuffix = `${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

  return prisma.$transaction(async (db) => {
    const order = await db.paymentOrder.create({
      data: {
        externalId: `DEMO-${idSuffix}`,
        merchantId: merchant.id,
        providerId: provider?.id,
        amount,
        currency: "RUB",
        status: OrderStatus.CREATED,
        commission,
        platformFee: amount.mul("0.006"),
        merchantNet: amount.minus(commission),
        providerName: provider?.displayName ?? "Провайдер не назначен",
        paymentUrl: `https://pay.local/demo/DEMO-${idSuffix}`,
        metadata: JSON.stringify({ scenario: true })
      }
    });

    await writeEventAndNotification(db, {
      actorRole,
      actorName: actorRole === UserRole.MERCHANT ? "Мерчант демо" : scenarioActor.name,
      type: EventType.ORDER_CREATED,
      entityType: "PaymentOrder",
      entityId: order.id,
      title: "Создан платежный ордер",
      description: `Создан демо-ордер ${order.externalId} на ${order.amount.toString()} RUB.`,
      notifyRole: UserRole.OPERATOR,
      merchantId: merchant.id,
      notificationType: NotificationType.ACTION_REQUIRED
    });

    return order;
  });
}

export async function assignRequisiteToOrder(orderId?: string) {
  return prisma.$transaction(async (db) => {
    const order =
      (orderId
        ? await db.paymentOrder.findUnique({ where: { id: orderId } })
        : await db.paymentOrder.findFirst({
            where: { status: OrderStatus.CREATED },
            orderBy: { createdAt: "desc" }
          })) ?? (await createDemoOrder(UserRole.PLATFORM_ADMIN));

    const requisite = await db.paymentRequisite.findFirst({
      where: {
        merchantId: order.merchantId,
        status: { in: [RequisiteStatus.ACTIVE, RequisiteStatus.LIMITED] }
      },
      orderBy: { linkedOrders: "asc" }
    });

    if (!requisite) throw new Error("Нет доступных реквизитов для назначения.");

    const updated = await db.paymentOrder.update({
      where: { id: order.id },
      data: {
        requisiteId: requisite.id,
        providerId: requisite.providerId,
        providerName: requisite.providerId ? undefined : order.providerName,
        status: OrderStatus.WAITING_PAYMENT
      }
    });

    await db.paymentRequisite.update({
      where: { id: requisite.id },
      data: { linkedOrders: { increment: 1 } }
    });

    await writeEventAndNotification(db, {
      actorRole: UserRole.OPERATOR,
      actorName: "Мария Лебедева",
      type: EventType.REQUISITE_CHANGED,
      entityType: "PaymentOrder",
      entityId: order.id,
      title: "Назначены реквизиты",
      description: `Ордер ${order.externalId} получил реквизит ${requisite.bank} ${requisite.maskedNumber}.`,
      notifyRole: UserRole.MERCHANT,
      merchantId: order.merchantId,
      notificationType: NotificationType.INFO
    });

    return updated;
  });
}

export async function changeOrderStatus(orderId: string, nextStatus: OrderStatusValue, actorRole: string = UserRole.OPERATOR) {
  return prisma.$transaction(async (db) => {
    const order = await db.paymentOrder.findUnique({
      where: { id: orderId },
      include: { merchant: true }
    });

    if (!order) throw new Error("Ордер не найден.");
    if (order.status === nextStatus) return order;

    const oldStatus = order.status;
    const updated = await db.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        ...statusTimestamp(nextStatus)
      }
    });

    if (nextStatus === OrderStatus.COMPLETED && oldStatus !== OrderStatus.COMPLETED) {
      const net = new Prisma.Decimal(order.merchantNet);
      const fee = new Prisma.Decimal(order.commission);

      await moveBalance(db, {
        merchantId: order.merchantId,
        type: BalanceType.AVAILABLE,
        direction: BalanceDirection.CREDIT,
        amount: net,
        orderId: order.id,
        description: `Начисление по завершенному ордеру ${order.externalId}`
      });

      await moveBalance(db, {
        merchantId: order.merchantId,
        type: BalanceType.FEES,
        direction: BalanceDirection.CREDIT,
        amount: fee,
        orderId: order.id,
        description: `Удержанная комиссия по ордеру ${order.externalId}`
      });
    }

    if (nextStatus === OrderStatus.DISPUTED && oldStatus !== OrderStatus.DISPUTED) {
      const disputedHold = new Prisma.Decimal(order.amount).mul("0.15");

      await moveBalance(db, {
        merchantId: order.merchantId,
        type: BalanceType.AVAILABLE,
        direction: BalanceDirection.DEBIT,
        amount: disputedHold,
        orderId: order.id,
        description: `Списание в холд по спорному ордеру ${order.externalId}`
      });

      await moveBalance(db, {
        merchantId: order.merchantId,
        type: BalanceType.FROZEN,
        direction: BalanceDirection.FREEZE,
        amount: disputedHold,
        orderId: order.id,
        description: `Заморозка спорной суммы по ордеру ${order.externalId}`
      });
    }

    await writeEventAndNotification(db, {
      actorRole,
      actorName: actorRole === UserRole.OPERATOR ? "Мария Лебедева" : scenarioActor.name,
      type: EventType.STATUS_CHANGED,
      entityType: "PaymentOrder",
      entityId: order.id,
      title: "Статус ордера изменен",
      description: `Ордер ${order.externalId}: ${oldStatus} -> ${nextStatus}.`,
      notifyRole: nextStatus === OrderStatus.DISPUTED ? UserRole.SUPPORT : UserRole.MERCHANT,
      merchantId: order.merchantId,
      notificationType: nextStatus === OrderStatus.COMPLETED ? NotificationType.SUCCESS : NotificationType.INFO
    });

    return updated;
  });
}

export async function createPayoutForMerchant(merchantId = "merchant-orbita") {
  return prisma.$transaction(async (db) => {
    const merchant = await db.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) throw new Error("Мерчант не найден.");

    const amount = new Prisma.Decimal(85000 + Math.floor(Math.random() * 60000));
    const payoutCommission = amount.mul(merchant.payoutFeeRate);
    const total = amount.plus(payoutCommission);

    await moveBalance(db, {
      merchantId,
      type: BalanceType.AVAILABLE,
      direction: BalanceDirection.DEBIT,
      amount: total,
      description: "Резерв выплаты из доступного баланса"
    });

    await moveBalance(db, {
      merchantId,
      type: BalanceType.FROZEN,
      direction: BalanceDirection.FREEZE,
      amount: total,
      description: "Заморозка суммы выплаты до подтверждения"
    });

    const payout = await db.payout.create({
      data: {
        merchantId,
        amount,
        commission: payoutCommission,
        status: PayoutStatus.PENDING_APPROVAL,
        recipient: `USDT TRC20: T${Date.now().toString().slice(-8)}...demo`,
        sourceBalance: "Доступный баланс"
      }
    });

    await writeEventAndNotification(db, {
      actorRole: UserRole.MERCHANT,
      actorName: "Мерчант демо",
      type: EventType.PAYOUT_CREATED,
      entityType: "Payout",
      entityId: payout.id,
      title: "Создана выплата",
      description: `Выплата на ${amount.toString()} RUB ожидает подтверждения финансовым менеджером.`,
      notifyRole: UserRole.FINANCE_MANAGER,
      merchantId,
      notificationType: NotificationType.ACTION_REQUIRED
    });

    return payout;
  });
}

export async function resolvePayout(payoutId: string, status: typeof PayoutStatus.COMPLETED | typeof PayoutStatus.CANCELED) {
  return prisma.$transaction(async (db) => {
    const payout = await db.payout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new Error("Выплата не найдена.");
    if (payout.status === status) return payout;

    const total = new Prisma.Decimal(payout.amount).plus(payout.commission);

    await moveBalance(db, {
      merchantId: payout.merchantId,
      type: BalanceType.FROZEN,
      direction: BalanceDirection.DEBIT,
      amount: total,
      payoutId,
      description: status === PayoutStatus.COMPLETED ? "Списание холда после подтверждения выплаты" : "Снятие холда после отмены выплаты"
    });

    if (status === PayoutStatus.CANCELED) {
      await moveBalance(db, {
        merchantId: payout.merchantId,
        type: BalanceType.AVAILABLE,
        direction: BalanceDirection.CREDIT,
        amount: total,
        payoutId,
        description: "Возврат выплаты в доступный баланс"
      });
    }

    const updated = await db.payout.update({
      where: { id: payoutId },
      data: {
        status,
        completedAt: status === PayoutStatus.COMPLETED ? new Date() : null
      }
    });

    await writeEventAndNotification(db, {
      actorRole: UserRole.FINANCE_MANAGER,
      actorName: "Глеб Фомин",
      type: EventType.STATUS_CHANGED,
      entityType: "Payout",
      entityId: payout.id,
      title: status === PayoutStatus.COMPLETED ? "Выплата подтверждена" : "Выплата отменена",
      description: `Выплата ${payout.id} переведена в статус ${status}.`,
      notifyRole: UserRole.MERCHANT,
      merchantId: payout.merchantId,
      notificationType: status === PayoutStatus.COMPLETED ? NotificationType.SUCCESS : NotificationType.WARNING
    });

    return updated;
  });
}

export async function createAppealForOrder(orderId?: string) {
  return prisma.$transaction(async (db) => {
    const order =
      (orderId
        ? await db.paymentOrder.findUnique({ where: { id: orderId } })
        : await db.paymentOrder.findFirst({
            where: { status: { in: [OrderStatus.DISPUTED, OrderStatus.PAID, OrderStatus.CONFIRMED, OrderStatus.WAITING_PAYMENT] } },
            orderBy: { createdAt: "desc" }
          })) ?? (await createDemoOrder(UserRole.PLATFORM_ADMIN));

    const existing = await db.appeal.findFirst({
      where: { orderId: order.id, status: { in: [AppealStatus.NEW, AppealStatus.OPEN] } }
    });

    if (existing) return existing;

    const support = await db.user.findFirst({ where: { role: UserRole.SUPPORT } });
    const frozenAmount = new Prisma.Decimal(order.amount).mul("0.15");

    if (order.status !== OrderStatus.DISPUTED) {
      await db.paymentOrder.update({ where: { id: order.id }, data: { status: OrderStatus.DISPUTED } });
      await moveBalance(db, {
        merchantId: order.merchantId,
        type: BalanceType.AVAILABLE,
        direction: BalanceDirection.DEBIT,
        amount: frozenAmount,
        orderId: order.id,
        description: `Списание в холд по апелляции ордера ${order.externalId}`
      });
      await moveBalance(db, {
        merchantId: order.merchantId,
        type: BalanceType.FROZEN,
        direction: BalanceDirection.FREEZE,
        amount: frozenAmount,
        orderId: order.id,
        description: `Заморозка по апелляции ордера ${order.externalId}`
      });
    }

    const appeal = await db.appeal.create({
      data: {
        orderId: order.id,
        merchantId: order.merchantId,
        authorId: "user-merchant",
        assigneeId: support?.id,
        reason: "Демо-апелляция: плательщик сообщил об оплате, но подтверждение провайдера не пришло.",
        status: AppealStatus.NEW,
        frozenAmount
      }
    });

    await db.appealComment.create({
      data: {
        appealId: appeal.id,
        userId: "user-merchant",
        authorRole: UserRole.MERCHANT,
        message: "Мерчант приложил чек и просит проверить спорную операцию."
      }
    });

    await writeEventAndNotification(db, {
      actorRole: UserRole.MERCHANT,
      actorName: "Мерчант демо",
      type: EventType.APPEAL_CREATED,
      entityType: "Appeal",
      entityId: appeal.id,
      title: "Создана апелляция",
      description: `По ордеру ${order.externalId} создано обращение support-команде.`,
      notifyRole: UserRole.SUPPORT,
      merchantId: order.merchantId,
      notificationType: NotificationType.ACTION_REQUIRED
    });

    return appeal;
  });
}

export async function openAppeal(appealId: string) {
  return prisma.$transaction(async (db) => {
    const appeal = await db.appeal.update({
      where: { id: appealId },
      data: { status: AppealStatus.OPEN }
    });

    await db.appealComment.create({
      data: {
        appealId,
        userId: "user-support",
        authorRole: UserRole.SUPPORT,
        message: "Support принял обращение в работу и запросил сверку у провайдера."
      }
    });

    await writeEventAndNotification(db, {
      actorRole: UserRole.SUPPORT,
      actorName: "Надежда Ким",
      type: EventType.STATUS_CHANGED,
      entityType: "Appeal",
      entityId: appealId,
      title: "Апелляция взята в работу",
      description: "Support начал разбор спорной операции.",
      notifyRole: UserRole.MERCHANT,
      merchantId: appeal.merchantId,
      notificationType: NotificationType.INFO
    });

    return appeal;
  });
}

export async function resolveAppeal(appealId: string, resolution: "merchant" | "platform") {
  return prisma.$transaction(async (db) => {
    const appeal = await db.appeal.findUnique({
      where: { id: appealId },
      include: { order: true }
    });
    if (!appeal) throw new Error("Апелляция не найдена.");

    const frozenAmount = new Prisma.Decimal(appeal.frozenAmount);
    if (frozenAmount.greaterThan(0)) {
      await moveBalance(db, {
        merchantId: appeal.merchantId,
        type: BalanceType.FROZEN,
        direction: BalanceDirection.DEBIT,
        amount: frozenAmount,
        appealId,
        description: "Снятие холда после решения апелляции"
      });

      if (resolution === "merchant") {
        await moveBalance(db, {
          merchantId: appeal.merchantId,
          type: BalanceType.AVAILABLE,
          direction: BalanceDirection.CREDIT,
          amount: frozenAmount,
          appealId,
          description: "Возврат спорной суммы мерчанту"
        });
      }
    }

    const nextAppealStatus = resolution === "merchant" ? AppealStatus.RESOLVED_MERCHANT : AppealStatus.RESOLVED_PLATFORM;
    const updated = await db.appeal.update({
      where: { id: appealId },
      data: {
        status: nextAppealStatus,
        decision:
          resolution === "merchant"
            ? "Решение в пользу мерчанта: чек признан валидным, холд возвращен."
            : "Решение в пользу платформы: подтверждения оплаты нет, спорная сумма списана.",
        resolvedAt: new Date()
      }
    });

    await db.paymentOrder.update({
      where: { id: appeal.orderId },
      data: { status: resolution === "merchant" ? OrderStatus.CONFIRMED : OrderStatus.CANCELED }
    });

    await db.appealComment.create({
      data: {
        appealId,
        userId: "user-support",
        authorRole: UserRole.SUPPORT,
        message: updated.decision ?? "Апелляция закрыта."
      }
    });

    await writeEventAndNotification(db, {
      actorRole: UserRole.SUPPORT,
      actorName: "Надежда Ким",
      type: EventType.APPEAL_RESOLVED,
      entityType: "Appeal",
      entityId: appealId,
      title: "Апелляция решена",
      description: updated.decision ?? "Support вынес решение по спорной операции.",
      notifyRole: UserRole.MERCHANT,
      merchantId: appeal.merchantId,
      notificationType: resolution === "merchant" ? NotificationType.SUCCESS : NotificationType.WARNING
    });

    return updated;
  });
}

function toSlug(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

  return normalized || "demo";
}

export async function createMerchantProfile(params: {
  displayName: string;
  legalName?: string;
  trustLimit?: number;
  initialBalance?: number;
  payinFeeRate?: number;
  payoutFeeRate?: number;
}) {
  const displayName = params.displayName.trim();
  if (!displayName) throw new Error("Укажите название мерчанта.");

  const idSuffix = Date.now().toString().slice(-6);
  const slug = toSlug(displayName);
  const merchantId = `merchant-${slug}-${idSuffix}`;
  const legalName = params.legalName?.trim() || `ООО ${displayName}`;
  const trustLimit = new Prisma.Decimal(params.trustLimit ?? 0);
  const initialBalance = new Prisma.Decimal(params.initialBalance ?? 0);
  const payinFeeRate = new Prisma.Decimal(params.payinFeeRate ?? 0.025);
  const payoutFeeRate = new Prisma.Decimal(params.payoutFeeRate ?? 0.015);

  if (initialBalance.lessThan(0)) throw new Error("Стартовый баланс не может быть отрицательным.");

  return prisma.$transaction(async (db) => {
    const merchant = await db.merchant.create({
      data: {
        id: merchantId,
        name: legalName,
        displayName,
        apiKey: `demo_${slug}_${idSuffix}`,
        callbackUrl: `https://${slug}.example/webhook`,
        trustLimit,
        payinFeeRate,
        payoutFeeRate
      }
    });

    const available = await db.balanceAccount.create({
      data: {
        merchantId: merchant.id,
        type: BalanceType.AVAILABLE,
        currency: "RUB",
        amount: initialBalance
      }
    });

    await db.balanceAccount.createMany({
      data: [
        { merchantId: merchant.id, type: BalanceType.FROZEN, currency: "RUB", amount: "0" },
        { merchantId: merchant.id, type: BalanceType.FEES, currency: "RUB", amount: "0" }
      ]
    });

    if (initialBalance.greaterThan(0)) {
      await db.balanceTransaction.create({
        data: {
          merchantId: merchant.id,
          balanceId: available.id,
          type: "Стартовое пополнение",
          direction: BalanceDirection.CREDIT,
          amount: initialBalance,
          beforeAmount: "0",
          afterAmount: initialBalance,
          description: "Стартовый баланс нового мерчанта"
        }
      });
    }

    await db.user.create({
      data: {
        id: `user-${slug}-${idSuffix}`,
        name: `Менеджер ${displayName}`,
        email: `${slug}-${idSuffix}@demo.local`,
        role: UserRole.MERCHANT,
        merchantId: merchant.id
      }
    });

    await writeEventAndNotification(db, {
      actorRole: UserRole.PLATFORM_ADMIN,
      actorName: "Администратор демо",
      type: EventType.BALANCE_CHANGED,
      entityType: "Merchant",
      entityId: merchant.id,
      title: "Добавлен новый мерчант",
      description: `Мерчант ${displayName} подключен к демо-контуру со стартовым балансом ${initialBalance.toString()} RUB.`,
      notifyRole: UserRole.PLATFORM_ADMIN,
      merchantId: merchant.id,
      notificationType: NotificationType.SUCCESS
    });

    return merchant;
  });
}

export async function adjustMerchantBalance(params: {
  merchantId: string;
  operation: "credit_available" | "debit_available" | "freeze" | "unfreeze" | "credit_fees" | "debit_fees";
  amount: number;
  description?: string;
}) {
  const amount = new Prisma.Decimal(params.amount);
  if (amount.lessThanOrEqualTo(0)) throw new Error("Сумма должна быть больше нуля.");

  const description = params.description?.trim() || "Ручная корректировка баланса";

  return prisma.$transaction(async (db) => {
    const merchant = await db.merchant.findUnique({ where: { id: params.merchantId } });
    if (!merchant) throw new Error("Мерчант не найден.");

    const ensureEnough = async (type: BalanceTypeValue) => {
      const balance = await getBalance(db, params.merchantId, type);
      if (new Prisma.Decimal(balance.amount).lessThan(amount)) {
        throw new Error("Недостаточно средств на выбранном балансе.");
      }
    };

    if (params.operation === "credit_available") {
      await moveBalance(db, {
        merchantId: params.merchantId,
        type: BalanceType.AVAILABLE,
        direction: BalanceDirection.CREDIT,
        amount,
        description
      });
    }

    if (params.operation === "debit_available") {
      await ensureEnough(BalanceType.AVAILABLE);
      await moveBalance(db, {
        merchantId: params.merchantId,
        type: BalanceType.AVAILABLE,
        direction: BalanceDirection.DEBIT,
        amount,
        description
      });
    }

    if (params.operation === "freeze") {
      await ensureEnough(BalanceType.AVAILABLE);
      await moveBalance(db, {
        merchantId: params.merchantId,
        type: BalanceType.AVAILABLE,
        direction: BalanceDirection.DEBIT,
        amount,
        description: `${description}: списание в холд`
      });
      await moveBalance(db, {
        merchantId: params.merchantId,
        type: BalanceType.FROZEN,
        direction: BalanceDirection.FREEZE,
        amount,
        description: `${description}: заморозка`
      });
    }

    if (params.operation === "unfreeze") {
      await ensureEnough(BalanceType.FROZEN);
      await moveBalance(db, {
        merchantId: params.merchantId,
        type: BalanceType.FROZEN,
        direction: BalanceDirection.DEBIT,
        amount,
        description: `${description}: снятие холда`
      });
      await moveBalance(db, {
        merchantId: params.merchantId,
        type: BalanceType.AVAILABLE,
        direction: BalanceDirection.CREDIT,
        amount,
        description: `${description}: возврат в доступный баланс`
      });
    }

    if (params.operation === "credit_fees") {
      await moveBalance(db, {
        merchantId: params.merchantId,
        type: BalanceType.FEES,
        direction: BalanceDirection.CREDIT,
        amount,
        description
      });
    }

    if (params.operation === "debit_fees") {
      await ensureEnough(BalanceType.FEES);
      await moveBalance(db, {
        merchantId: params.merchantId,
        type: BalanceType.FEES,
        direction: BalanceDirection.DEBIT,
        amount,
        description
      });
    }

    await writeEventAndNotification(db, {
      actorRole: UserRole.FINANCE_MANAGER,
      actorName: "Финансовый менеджер демо",
      type: EventType.BALANCE_CHANGED,
      entityType: "Merchant",
      entityId: params.merchantId,
      title: "Ручная корректировка баланса",
      description: `${merchant.displayName}: ${description} на ${amount.toString()} RUB.`,
      notifyRole: UserRole.MERCHANT,
      merchantId: params.merchantId,
      notificationType: NotificationType.INFO
    });

    return db.balanceAccount.findMany({
      where: { merchantId: params.merchantId },
      orderBy: { type: "asc" }
    });
  });
}

async function writeScenarioCheckpoint(key: string, step: number, title: string, description: string, merchantId?: string | null, notifyRole: string = UserRole.PLATFORM_ADMIN) {
  await prisma.$transaction(async (db) => {
    await writeEventAndNotification(db, {
      actorRole: scenarioActor.role,
      actorName: scenarioActor.name,
      type: EventType.SCENARIO_STEP,
      entityType: "ScenarioState",
      entityId: key,
      title,
      description: `Шаг ${step}: ${description}`,
      notifyRole,
      merchantId,
      notificationType: NotificationType.INFO
    });
  });
}

async function findLatestOrder(statuses: string[]) {
  return prisma.paymentOrder.findFirst({
    where: { status: { in: statuses } },
    orderBy: { updatedAt: "desc" }
  });
}

async function ensureWaitingPaymentOrder() {
  const waiting = await findLatestOrder([OrderStatus.WAITING_PAYMENT]);
  if (waiting) return waiting;

  const created = (await findLatestOrder([OrderStatus.CREATED])) ?? (await createDemoOrder(UserRole.PLATFORM_ADMIN));
  return assignRequisiteToOrder(created.id);
}

async function ensurePaidOrder() {
  const paid = await findLatestOrder([OrderStatus.PAID]);
  if (paid) return paid;

  const waiting = await ensureWaitingPaymentOrder();
  return changeOrderStatus(waiting.id, OrderStatus.PAID, UserRole.OPERATOR);
}

async function ensureConfirmedOrder() {
  const confirmed = await findLatestOrder([OrderStatus.CONFIRMED]);
  if (confirmed) return confirmed;

  const paid = await ensurePaidOrder();
  return changeOrderStatus(paid.id, OrderStatus.CONFIRMED, UserRole.OPERATOR);
}

async function ensureDisputedOrder() {
  const disputed = await findLatestOrder([OrderStatus.DISPUTED]);
  if (disputed) return disputed;

  const order =
    (await findLatestOrder([OrderStatus.CONFIRMED, OrderStatus.PAID, OrderStatus.WAITING_PAYMENT, OrderStatus.CREATED])) ??
    (await createDemoOrder(UserRole.PLATFORM_ADMIN));

  return changeOrderStatus(order.id, OrderStatus.DISPUTED, UserRole.OPERATOR);
}

async function findLatestPayout(statuses: string[]) {
  return prisma.payout.findFirst({
    where: { status: { in: statuses } },
    orderBy: { updatedAt: "desc" }
  });
}

async function ensureReviewablePayout() {
  return (await findLatestPayout([PayoutStatus.PENDING_APPROVAL, PayoutStatus.HOLD, PayoutStatus.CREATED])) ?? (await createPayoutForMerchant());
}

async function movePayoutToHold(payoutId: string) {
  return prisma.$transaction(async (db) => {
    const payout = await db.payout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new Error("Выплата не найдена.");
    if (payout.status === PayoutStatus.HOLD || payout.status === PayoutStatus.COMPLETED) return payout;

    const updated = await db.payout.update({
      where: { id: payoutId },
      data: { status: PayoutStatus.HOLD }
    });

    await writeEventAndNotification(db, {
      actorRole: UserRole.FINANCE_MANAGER,
      actorName: "Глеб Фомин",
      type: EventType.STATUS_CHANGED,
      entityType: "Payout",
      entityId: payoutId,
      title: "Выплата взята на финансовую проверку",
      description: `Выплата ${payoutId} переведена в статус HOLD перед подтверждением.`,
      notifyRole: UserRole.MERCHANT,
      merchantId: payout.merchantId,
      notificationType: NotificationType.INFO
    });

    return updated;
  });
}

async function ensureOpenAppeal() {
  const open = await prisma.appeal.findFirst({ where: { status: AppealStatus.OPEN }, orderBy: { updatedAt: "desc" } });
  if (open) return open;

  const fresh = (await prisma.appeal.findFirst({ where: { status: AppealStatus.NEW }, orderBy: { updatedAt: "desc" } })) ?? (await createAppealForOrder());
  return openAppeal(fresh.id);
}

async function addAppealReviewComment(message: string) {
  const appeal = await ensureOpenAppeal();

  await prisma.$transaction(async (db) => {
    await db.appealComment.create({
      data: {
        appealId: appeal.id,
        userId: "user-support",
        authorRole: UserRole.SUPPORT,
        message
      }
    });

    await writeEventAndNotification(db, {
      actorRole: UserRole.SUPPORT,
      actorName: "Надежда Ким",
      type: EventType.STATUS_CHANGED,
      entityType: "Appeal",
      entityId: appeal.id,
      title: "Support обновил разбор апелляции",
      description: message,
      notifyRole: UserRole.MERCHANT,
      merchantId: appeal.merchantId,
      notificationType: NotificationType.INFO
    });
  });

  return appeal;
}

export async function runScenarioStep(key: string, targetStep?: number) {
  const state = await prisma.scenarioState.findUnique({ where: { key } });
  if (!state) throw new Error("Сценарий не найден.");

  const requestedStep = Number.isFinite(targetStep) ? Math.trunc(Number(targetStep)) : undefined;
  const nextStep = requestedStep ? Math.min(Math.max(requestedStep, 1), state.totalSteps) : state.step >= state.totalSteps ? 1 : state.step + 1;

  if (key === "merchant-create-order") {
    if (nextStep === 1) await createDemoOrder(UserRole.MERCHANT);
    if (nextStep === 2) await assignRequisiteToOrder();
    if (nextStep === 3) {
      const order = await ensureWaitingPaymentOrder();
      await changeOrderStatus(order.id, OrderStatus.PAID, UserRole.OPERATOR);
    }
  }

  if (key === "assign-requisite") {
    if (nextStep === 1) await createDemoOrder(UserRole.PLATFORM_ADMIN);
    if (nextStep === 2) await assignRequisiteToOrder();
    if (nextStep === 3) {
      const requisite = await prisma.paymentRequisite.findFirst({ orderBy: { linkedOrders: "desc" } });
      if (requisite) {
        await prisma.paymentRequisite.update({
          where: { id: requisite.id },
          data: { linkedOrders: { increment: 1 } }
        });
      }
      await writeScenarioCheckpoint(key, nextStep, "Проверены лимиты реквизитов", "Платформа зафиксировала использование реквизита и обновила операционный журнал.", requisite?.merchantId, UserRole.OPERATOR);
    }
  }

  if (key === "order-status-flow") {
    const order =
      (await prisma.paymentOrder.findFirst({
        where: { status: { in: [OrderStatus.CREATED, OrderStatus.WAITING_PAYMENT, OrderStatus.PAID, OrderStatus.CONFIRMED] } },
        orderBy: { updatedAt: "desc" }
      })) ?? (await createDemoOrder(UserRole.PLATFORM_ADMIN));
    const flow = [OrderStatus.WAITING_PAYMENT, OrderStatus.PAID, OrderStatus.CONFIRMED, OrderStatus.COMPLETED, OrderStatus.COMPLETED];
    await changeOrderStatus(order.id, flow[nextStep - 1] ?? OrderStatus.COMPLETED, UserRole.OPERATOR);
  }

  if (key === "balance-after-success") {
    if (nextStep === 1) await ensurePaidOrder();
    if (nextStep === 2) {
      const order = await ensurePaidOrder();
      await changeOrderStatus(order.id, OrderStatus.CONFIRMED, UserRole.OPERATOR);
    }
    if (nextStep === 3) {
      const order = await ensureConfirmedOrder();
      await changeOrderStatus(order.id, OrderStatus.COMPLETED, UserRole.FINANCE_MANAGER);
    }
  }

  if (key === "merchant-create-payout") {
    if (nextStep === 1) await createPayoutForMerchant();
    if (nextStep === 2) {
      const payout = await ensureReviewablePayout();
      await movePayoutToHold(payout.id);
    }
    if (nextStep === 3) {
      const payout = await ensureReviewablePayout();
      await writeScenarioCheckpoint(key, nextStep, "Выплата ожидает решения финансового менеджера", `Выплата ${payout.id} готова к подтверждению в финансовом кабинете.`, payout.merchantId, UserRole.FINANCE_MANAGER);
    }
  }

  if (key === "finance-approve-payout") {
    if (nextStep === 1) await ensureReviewablePayout();
    if (nextStep === 2) {
      const payout = await ensureReviewablePayout();
      await movePayoutToHold(payout.id);
    }
    if (nextStep === 3) {
      const payout = await ensureReviewablePayout();
      await resolvePayout(payout.id, PayoutStatus.COMPLETED);
    }
  }

  if (key === "freeze-disputed") {
    if (nextStep === 1) await ensurePaidOrder();
    if (nextStep === 2) await ensureDisputedOrder();
    if (nextStep === 3) {
      const order = await ensureDisputedOrder();
      await writeScenarioCheckpoint(key, nextStep, "Спор передан в обработку", `По ордеру ${order.externalId} создан операционный контекст для support и финансового контроля.`, order.merchantId, UserRole.SUPPORT);
    }
  }

  if (key === "create-appeal") {
    if (nextStep === 1) await ensureDisputedOrder();
    if (nextStep === 2) await createAppealForOrder();
    if (nextStep === 3) {
      const appeal = await prisma.appeal.findFirst({ where: { status: { in: [AppealStatus.NEW, AppealStatus.OPEN] } }, orderBy: { updatedAt: "desc" } });
      await writeScenarioCheckpoint(key, nextStep, "Апелляция готова к разбору", `Обращение ${appeal?.id ?? "demo"} ожидает действий support-команды.`, appeal?.merchantId, UserRole.SUPPORT);
    }
  }

  if (key === "support-review-appeal") {
    if (nextStep === 1) await ensureOpenAppeal();
    if (nextStep === 2) await addAppealReviewComment("Support проверил комментарии мерчанта и запросил сверку у провайдера.");
    if (nextStep === 3) await addAppealReviewComment("Провайдер прислал предварительный ответ, апелляция готова к финальному решению.");
  }

  if (key === "appeal-resolution-balance") {
    if (nextStep === 1) await ensureOpenAppeal();
    if (nextStep === 2) await addAppealReviewComment("Support подготовил решение: подтверждение оплаты признано достаточным.");
    if (nextStep === 3) {
      const appeal = await ensureOpenAppeal();
      await resolveAppeal(appeal.id, "merchant");
    }
  }

  const updatedState = await prisma.scenarioState.update({
    where: { key },
    data: { step: nextStep }
  });

  await prisma.eventLog.create({
    data: {
      actorRole: scenarioActor.role,
      actorName: scenarioActor.name,
      type: EventType.SCENARIO_STEP,
      entityType: "ScenarioState",
      entityId: updatedState.key,
      title: `Сценарий: ${updatedState.title}`,
      description: `Выполнен шаг ${updatedState.step} из ${updatedState.totalSteps}.`,
      metadata: JSON.stringify({ key, step: updatedState.step })
    }
  });

  return updatedState;
}
