"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlobalSearch } from "@/components/global-search";
import { useRole } from "@/components/role-provider";
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
    <header className="card grid min-h-[4.75rem] gap-3 rounded-[var(--radius-xl)] p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="grid min-w-0 gap-3 xl:grid-cols-[auto_minmax(18rem,1fr)] xl:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="pill bg-white/60 text-ink">
            <span className="status-dot" />
            Sandbox
          </span>
          <span className="pill border-emerald-500/20 bg-emerald-500/10 text-emerald-700">API 99.4%</span>
          <span className="pill hidden bg-white/45 text-graphite/70 2xl:inline-flex">Demo без реальных финансовых операций</span>
        </div>
        <GlobalSearch />
      </div>

      <div className="grid gap-2 sm:grid-cols-3 xl:flex xl:items-center xl:justify-end">
        <select value={role} onChange={(event) => setRole(event.target.value as DemoRole)} className="field focus-ring min-w-0 xl:w-[220px]" aria-label="Переключатель роли">
          {roleOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={role === "MERCHANT" ? merchantId : merchants[0]?.id ?? defaultMerchantId}
          onChange={(event) => setMerchantId(event.target.value)}
          className="field focus-ring min-w-0 xl:w-[170px]"
          aria-label="Текущий мерчант"
        >
          {merchants.map((merchant) => (
            <option key={merchant.id} value={merchant.id}>
              {merchant.label}
            </option>
          ))}
        </select>
        <Link href="/scenarios" className="btn btn-primary focus-ring whitespace-nowrap">
          Запустить сценарий
        </Link>
      </div>
    </header>
  );
}
