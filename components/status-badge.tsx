import { appealStatusMeta, orderStatusMeta, payoutStatusMeta, providerStatusMeta, requisiteStatusMeta } from "@/lib/status";

const toneClasses: Record<string, string> = {
  green: "tone-green",
  teal: "tone-teal",
  blue: "tone-blue",
  amber: "tone-amber",
  red: "tone-red",
  slate: "tone-slate",
  neutral: "tone-neutral"
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

  return <span className={`status-chip ${toneClasses[meta.tone] ?? toneClasses.neutral}`}>{meta.label}</span>;
}
