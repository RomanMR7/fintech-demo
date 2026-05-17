import { AppealsClient } from "@/components/appeals-client";
import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";
import { toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AppealsPage() {
  const appeals = await prisma.appeal.findMany({
    include: {
      merchant: true,
      order: true,
      author: true,
      assignee: true,
      comments: { orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Support"
        title="Апелляции"
        description="Здесь спорные операции превращаются в управляемый процесс: причина, ответственный, комментарии, решение и финансовый эффект."
      />
      <AppealsClient
        appeals={appeals.map((appeal) => ({
          id: appeal.id,
          orderId: appeal.orderId,
          orderExternalId: appeal.order.externalId,
          merchantId: appeal.merchantId,
          merchantName: appeal.merchant.displayName,
          reason: appeal.reason,
          status: appeal.status,
          author: appeal.author?.name ?? "Система",
          assignee: appeal.assignee?.name ?? "Не назначен",
          frozenAmount: toNumber(appeal.frozenAmount),
          currency: appeal.order.currency,
          decision: appeal.decision,
          createdAt: appeal.createdAt.toISOString(),
          comments: appeal.comments.map((comment) => ({
            id: comment.id,
            authorRole: comment.authorRole,
            message: comment.message,
            createdAt: comment.createdAt.toISOString()
          }))
        }))}
      />
      <EducationBlock
        items={[
          "Апелляция всегда связана с конкретным ордером и объясняет, почему операция спорная.",
          "Создание апелляции может заморозить часть баланса, чтобы снизить финансовый риск.",
          "Support фиксирует комментарии, запрашивает подтверждения и принимает решение.",
          "Решение апелляции либо возвращает холд мерчанту, либо списывает спорную сумму."
        ]}
      />
    </div>
  );
}
