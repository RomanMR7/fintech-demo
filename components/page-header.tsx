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
    <section className="card mesh-bg rounded-[2rem] p-6 md:p-8">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-jade">{eyebrow}</p> : null}
      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-graphite/72">{description}</p>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </section>
  );
}
