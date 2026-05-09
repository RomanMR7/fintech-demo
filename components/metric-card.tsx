export function MetricCard({
  label,
  value,
  hint,
  accent = "jade"
}: {
  label: string;
  value: string;
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
    <div className="card rounded-[1.75rem] p-5">
      <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold ${accentClass}`}>{label}</div>
      <p className="mt-5 font-display text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-6 text-graphite/68">{hint}</p>
    </div>
  );
}
