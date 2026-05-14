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
    <div className="card kpi-card">
      <div className={`pill border-transparent bg-gradient-to-r ${accentClass}`}>{label}</div>
      <div className="amount mt-4 break-words text-ink">{value}</div>
      <p className="copy-sm mt-3">{hint}</p>
    </div>
  );
}
