export default function Loading() {
  return (
    <div className="card rounded-[2rem] p-8">
      <div className="h-3 w-40 animate-pulse rounded-full bg-ink/10" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-3xl bg-white/55" />
        <div className="h-28 animate-pulse rounded-3xl bg-white/55" />
        <div className="h-28 animate-pulse rounded-3xl bg-white/55" />
      </div>
    </div>
  );
}
