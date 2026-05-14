"use client";

import { useVisualMode, type VisualMode } from "@/components/visual-mode-provider";

const options: Array<{ value: VisualMode; label: string; shortLabel: string }> = [
  { value: "light", label: "Светлая тема", shortLabel: "Свет" },
  { value: "dark", label: "Темная тема", shortLabel: "Темная" },
  { value: "cosmic", label: "Космическая тема", shortLabel: "Космос" }
];

export function VisualModeSwitcher() {
  const { mode, setMode } = useVisualMode();

  return (
    <div className="field p-1" aria-label="Переключатель визуального режима">
      <div className="grid grid-cols-3 gap-1">
        {options.map((option) => {
          const active = option.value === mode;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value)}
              className={`focus-ring min-h-8 rounded-[0.75rem] px-3 text-xs font-semibold transition ${
                active ? "bg-ink text-white shadow-soft" : "text-graphite/70 hover:bg-white/80 hover:text-ink"
              }`}
              aria-pressed={active}
              title={option.label}
            >
              {option.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
