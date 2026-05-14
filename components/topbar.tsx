"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlobalSearch } from "@/components/global-search";
import { useRole } from "@/components/role-provider";
import { VisualModeSwitcher } from "@/components/visual-mode-switcher";
import { defaultMerchantId, roleOptions, type DemoRole } from "@/lib/roles";

type MerchantOption = {
  id: string;
  label: string;
};

const fallbackMerchants: MerchantOption[] = [
  { id: "merchant-orbita", label: "Орбита" },
  { id: "merchant-nova", label: "Nova Games" },
  { id: "merchant-sigma", label: "Sigma Travel" }
];

export function Topbar() {
  const { role, setRole, merchantId, setMerchantId } = useRole();
  const [merchants, setMerchants] = useState<MerchantOption[]>(fallbackMerchants);

  useEffect(() => {
    let active = true;

    async function loadMerchants() {
      try {
        const response = await fetch("/api/merchants", { cache: "no-store" });
        if (!response.ok) return;

        const payload = (await response.json()) as Array<{ id: string; displayName: string }>;
        if (!active || payload.length === 0) return;

        const nextMerchants = payload.map((merchant) => ({ id: merchant.id, label: merchant.displayName }));
        setMerchants(nextMerchants);

        if (!nextMerchants.some((merchant) => merchant.id === merchantId)) {
          setMerchantId(nextMerchants[0]?.id ?? defaultMerchantId);
        }
      } catch {
        setMerchants(fallbackMerchants);
      }
    }

    loadMerchants();

    return () => {
      active = false;
    };
  }, [merchantId, setMerchantId]);

  return (
    <header className="card grid gap-3 rounded-[1.35rem] p-3 sm:p-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
      <div className="grid min-w-0 gap-3 md:grid-cols-[auto_minmax(16rem,1fr)] md:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-ink">
            <span className="status-dot" />
            Sandbox
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            API health 99.4%
          </span>
          <span className="hidden rounded-full border border-ink/10 bg-white/45 px-3 py-1.5 text-xs font-semibold text-graphite/70 sm:inline-flex">
            Demo без реальных финансовых операций
          </span>
        </div>
        <GlobalSearch />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:items-center xl:gap-3">
        <div className="sm:col-span-2 xl:col-span-1">
          <VisualModeSwitcher />
        </div>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as DemoRole)}
          className="control focus-ring min-w-0 rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink sm:py-3"
          aria-label="Переключатель роли"
        >
          {roleOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={role === "MERCHANT" ? merchantId : merchants[0]?.id ?? defaultMerchantId}
          onChange={(event) => setMerchantId(event.target.value)}
          className="control focus-ring min-w-0 rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink sm:py-3"
          aria-label="Текущий мерчант"
        >
          {merchants.map((merchant) => (
            <option key={merchant.id} value={merchant.id}>
              {merchant.label}
            </option>
          ))}
        </select>
        <Link href="/scenarios" className="focus-ring rounded-2xl bg-ink px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-moss sm:py-3">
          Запустить сценарий
        </Link>
      </div>
    </header>
  );
}
