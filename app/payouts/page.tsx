import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";
import { PayoutsClient } from "@/components/payouts-client";
import { toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const payouts = await prisma.payout.findMany({ include: { merchant: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Финансы"
        title="Выплаты"
        description="Модуль показывает вывод средств мерчантом, резервирование суммы в холд и финальное подтверждение финансовым менеджером."
      />
      <PayoutsClient
        payouts={payouts.map((payout) => ({
          id: payout.id,
          merchantId: payout.merchantId,
          merchantName: payout.merchant.displayName,
          amount: toNumber(payout.amount),
          currency: payout.currency,
          status: payout.status,
          recipient: payout.recipient,
          commission: toNumber(payout.commission),
          sourceBalance: payout.sourceBalance,
          createdAt: payout.createdAt.toISOString()
        }))}
      />
      <EducationBlock
        items={[
          "Создание выплаты уменьшает доступный баланс и увеличивает замороженный баланс.",
          "Подтверждение выплаты списывает холд окончательно.",
          "Отмена выплаты возвращает сумму и комиссию обратно в доступный баланс.",
          "Финансовый менеджер отвечает за проверку получателя, суммы и источника средств."
        ]}
      />
    </div>
  );
}
