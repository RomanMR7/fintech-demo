import { EducationBlock } from "@/components/education-block";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";
import { roleLabel, DemoRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({ include: { merchant: true }, orderBy: { createdAt: "desc" }, take: 300 });

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Сигналы"
        title="Уведомления"
        description="Уведомления показывают, кто должен обратить внимание на событие: мерчант, оператор, финансы, support или администратор."
      />
      <section className="grid gap-3">
        {notifications.map((notification) => (
          <article key={notification.id} className="card rounded-[1.5rem] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-display text-xl font-semibold">{notification.title}</p>
                <p className="mt-2 text-sm leading-6 text-graphite/70">{notification.message}</p>
              </div>
              <div className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-graphite/45 md:text-right">
                <p>{roleLabel(notification.role as DemoRole)}</p>
                <p className="mt-1">{formatDate(notification.createdAt)}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
      <EducationBlock
        items={[
          "Уведомление создается вместе с событием, если действие требует внимания конкретной роли.",
          "Мерчант получает бизнес-важные статусы по своим операциям.",
          "Support получает новые апелляции, финансы получают выплаты и холды.",
          "В демо уведомления не отправляются наружу, а сохраняются локально в SQLite."
        ]}
      />
    </div>
  );
}
