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
    jade: "tone-teal",
    brass: "tone-amber",
    moss: "tone-green",
    red: "tone-red"
  }[accent];

  return (
    <div className="card kpi-card">
      <div className={`pill ${accentClass}`}>{label}</div>
      <div className="amount mt-4 break-words text-ink">{value}</div>
      <p className="copy-sm mt-3">{hint}</p>
    </div>
  );
}
