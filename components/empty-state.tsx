export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white/45 p-8 text-center">
      <p className="font-display text-xl font-semibold">{title}</p>
      <p className="mt-2 text-sm text-graphite/65">{description}</p>
    </div>
  );
}
