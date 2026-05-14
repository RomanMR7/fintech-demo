export function MetricCard({
  label,
  value,
  hint,
  accent = "jade"
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  accent?: "jade" | "brass" | "moss" | "red";
}) {
  const accentClass = {
    jade: "from-jade/16 to-jade/5 text-jade",
    brass: "from-brass/20 to-brass/5 text-brass",
    moss: "from-moss/16 to-moss/5 text-moss",
    red: "from-red-500/16 to-red-500/5 text-red-700"
  }[accent];

  return (
    <div className="card rounded-[1.5rem] p-4 sm:rounded-[1.75rem] sm:p-5">
      <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold ${accentClass}`}>{label}</div>
      <div className="mt-4 break-words font-display text-2xl font-semibold tracking-tight sm:mt-5 sm:text-3xl">{value}</div>
      <p className="mt-2 text-sm leading-6 text-graphite/68">{hint}</p>
    </div>
  );
}
