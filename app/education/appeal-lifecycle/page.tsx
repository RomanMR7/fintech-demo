import { PageHeader } from "@/components/page-header";

export default function AppealLifecyclePage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Обучающий режим"
        title="Жизненный цикл апелляции"
        description="Апелляция превращает спорную операцию в формальный процесс с причиной, ответственным, комментариями, доказательствами и решением."
      />
      <section className="card rounded-[1.75rem] p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Новая: обращение создано, ордер помечен как спорный.",
            "В работе: support проверяет данные у мерчанта и провайдера.",
            "Решена: холд возвращается мерчанту или списывается по решению."
          ].map((item) => (
            <p key={item} className="rounded-2xl bg-white/60 p-5 text-sm leading-6 text-graphite/75">{item}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
