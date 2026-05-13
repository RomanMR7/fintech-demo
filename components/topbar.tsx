"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRole } from "@/components/role-provider";
import { defaultMerchantId, roleOptions, DemoRole } from "@/lib/roles";

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
    <header className="card flex flex-col gap-3 rounded-[1.5rem] p-4 sm:gap-4 sm:rounded-[2rem] md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-jade sm:text-xs sm:tracking-[0.28em]">Демо-режим без реальных операций</p>
        <p className="mt-1 text-sm leading-6 text-graphite/70">Данные моковые, роли переключаются без авторизации.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:items-center xl:gap-3">
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as DemoRole)}
          className="focus-ring min-w-0 rounded-2xl border border-ink/10 bg-white/75 px-4 py-2.5 text-sm font-semibold text-ink shadow-insetSoft sm:py-3"
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
          className="focus-ring min-w-0 rounded-2xl border border-ink/10 bg-white/75 px-4 py-2.5 text-sm font-semibold text-ink shadow-insetSoft sm:py-3"
          aria-label="Текущий мерчант"
        >
          {merchants.map((merchant) => (
            <option key={merchant.id} value={merchant.id}>
              {merchant.label}
            </option>
          ))}
        </select>
        <Link
          href="/scenarios"
          className="focus-ring rounded-2xl bg-ink px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-moss sm:py-3"
        >
          Запустить сценарии
        </Link>
        <Link
          href="/commercial"
          className="focus-ring rounded-2xl bg-jade px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-moss sm:py-3"
        >
          Экономика
        </Link>
      </div>
    </header>
  );
}
