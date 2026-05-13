"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type VisualMode = "light" | "dark" | "cosmic";

type VisualModeContextValue = {
  mode: VisualMode;
  setMode: (mode: VisualMode) => void;
};

const storageKey = "fintech-demo-visual-mode";
const visualModes: VisualMode[] = ["light", "dark", "cosmic"];
const VisualModeContext = createContext<VisualModeContextValue | null>(null);

function isVisualMode(value: unknown): value is VisualMode {
  return typeof value === "string" && visualModes.includes(value as VisualMode);
}

function applyVisualMode(mode: VisualMode) {
  const root = document.documentElement;
  root.dataset.visualMode = mode;
  root.classList.remove("theme-light", "theme-dark", "theme-cosmic");
  root.classList.add(`theme-${mode}`);
  root.style.colorScheme = mode === "light" ? "light" : "dark";
}

export function VisualModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<VisualMode>("light");

  useEffect(() => {
    const storedMode = window.localStorage.getItem(storageKey);
    const nextMode = isVisualMode(storedMode) ? storedMode : "light";
    setModeState(nextMode);
    applyVisualMode(nextMode);
  }, []);

  const value = useMemo<VisualModeContextValue>(
    () => ({
      mode,
      setMode: (nextMode) => {
        setModeState(nextMode);
        window.localStorage.setItem(storageKey, nextMode);
        applyVisualMode(nextMode);
      }
    }),
    [mode]
  );

  return <VisualModeContext.Provider value={value}>{children}</VisualModeContext.Provider>;
}

export function useVisualMode() {
  const context = useContext(VisualModeContext);
  if (!context) throw new Error("useVisualMode must be used inside VisualModeProvider");
  return context;
}
