export function PageHeader({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="page-card mesh-bg overflow-hidden">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="page-title">{title}</h1>
          {description ? <p className="copy mt-3 max-w-3xl">{description}</p> : null}
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </section>
  );
}
