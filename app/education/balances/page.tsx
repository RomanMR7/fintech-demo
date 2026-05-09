import { PageHeader } from "@/components/page-header";

export default function BalancesEducationPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Обучающий режим"
        title="Как работают балансы"
        description="В демо есть три балансовых слоя: доступные средства, замороженные средства и удержанные комиссии."
      />
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Доступный", "Средства, которыми мерчант может распоряжаться."],
          ["Замороженный", "Средства в холде по выплатам и спорным операциям."],
          ["Комиссии", "Удержанные суммы, которые показывают экономику платформы."]
        ].map(([title, description]) => (
          <article key={title} className="card rounded-[1.75rem] p-5">
            <h2 className="font-display text-2xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-graphite/70">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
