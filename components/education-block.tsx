export function EducationBlock({
  title = "Что здесь происходит?",
  items
}: {
  title?: string;
  items: string[];
}) {
  return (
    <aside className="card rounded-[1.75rem] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brass">{title}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <p key={item} className="rounded-2xl border border-ink/10 bg-white/55 p-4 text-sm leading-6 text-graphite/75">
            {item}
          </p>
        ))}
      </div>
    </aside>
  );
}
