import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";
import { RequisitesClient } from "@/components/requisites-client";
import { toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RequisitesPage() {
  const requisites = await prisma.paymentRequisite.findMany({
    include: { merchant: true, provider: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Операционный контур"
        title="Реквизиты"
        description="Реквизиты связывают ордер с конкретным способом оплаты: карта, телефон, счет, банк, лимиты и доступность."
      />
      <RequisitesClient
        requisites={requisites.map((item) => ({
          id: item.id,
          type: item.type,
          bank: item.bank,
          maskedNumber: item.maskedNumber,
          holder: item.holder,
          status: item.status,
          dailyLimit: toNumber(item.dailyLimit),
          dailyUsed: toNumber(item.dailyUsed),
          currency: item.currency,
          linkedOrders: item.linkedOrders,
          merchantName: item.merchant?.displayName ?? "Пул платформы"
        }))}
      />
      <EducationBlock
        items={[
          "Реквизит определяет, куда плательщик должен отправить деньги.",
          "Лимиты защищают от перегруза одного банка, карты или устройства.",
          "Оператор может поставить реквизит на паузу, если лимит почти исчерпан или есть риск.",
          "Ордер получает реквизит на этапе назначения и переходит в ожидание оплаты."
        ]}
      />
    </div>
  );
}
