import { appealStatusMeta, orderStatusMeta, payoutStatusMeta, providerStatusMeta, requisiteStatusMeta } from "@/lib/status";

const toneClasses: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  teal: "bg-teal-100 text-teal-800 ring-teal-200",
  blue: "bg-sky-100 text-sky-800 ring-sky-200",
  amber: "bg-amber-100 text-amber-800 ring-amber-200",
  red: "bg-rose-100 text-rose-800 ring-rose-200",
  slate: "bg-slate-100 text-slate-800 ring-slate-200",
  neutral: "bg-stone-100 text-stone-700 ring-stone-200"
};

const maps = {
  order: orderStatusMeta,
  payout: payoutStatusMeta,
  appeal: appealStatusMeta,
  provider: providerStatusMeta,
  requisite: requisiteStatusMeta
} as const;

export function StatusBadge({
  status,
  type = "order"
}: {
  status: string;
  type?: keyof typeof maps;
}) {
  const meta = (maps[type] as Record<string, { label: string; tone: string }>)[status] ?? {
    label: status,
    tone: "neutral"
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${toneClasses[meta.tone] ?? toneClasses.neutral}`}>
      {meta.label}
    </span>
  );
}
