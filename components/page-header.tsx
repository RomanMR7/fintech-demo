export function PageHeader({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="card mesh-bg overflow-hidden rounded-[1.5rem] p-5 sm:rounded-[2rem] md:p-8">
      {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-jade sm:text-xs sm:tracking-[0.28em]">{eyebrow}</p> : null}
      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-graphite/72 sm:text-base sm:leading-7">{description}</p>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </section>
  );
}
