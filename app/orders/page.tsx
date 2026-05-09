import { EducationBlock } from "@/components/education-block";
import { OrdersClient } from "@/components/orders-client";
import { PageHeader } from "@/components/page-header";
import { toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.paymentOrder.findMany({
    include: { merchant: true, provider: true, requisite: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Операции"
        title="Заказы / платежные ордера"
        description="Здесь создаются платежные ордера, назначаются провайдеры и реквизиты, меняются статусы и запускается финансовая логика."
      />
      <OrdersClient
        orders={orders.map((order) => ({
          id: order.id,
          externalId: order.externalId,
          merchantId: order.merchantId,
          merchantName: order.merchant.displayName,
          providerName: order.providerName ?? order.provider?.displayName ?? "Не назначен",
          requisite: order.requisite?.maskedNumber,
          amount: toNumber(order.amount),
          currency: order.currency,
          status: order.status,
          commission: toNumber(order.commission),
          merchantNet: toNumber(order.merchantNet),
          createdAt: order.createdAt.toISOString()
        }))}
      />
      <EducationBlock
        items={[
          "Ордер начинается в статусе “Создан” и проходит цепочку до “Завершен”.",
          "При завершении ордера доступный баланс мерчанта увеличивается на сумму за вычетом комиссии.",
          "Если операция спорная, часть баланса замораживается и создается контекст для апелляции.",
          "Оператор и администратор видят все ордера, мерчант в демо-фильтре видит только свои."
        ]}
      />
    </div>
  );
}
