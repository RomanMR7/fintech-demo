"use client";

import Link from "next/link";
import { useRole } from "@/components/role-provider";
import { defaultMerchantId, roleOptions, DemoRole } from "@/lib/roles";

const merchants = [
  { id: "merchant-orbita", label: "Орбита" },
  { id: "merchant-nova", label: "Nova Games" },
  { id: "merchant-sigma", label: "Sigma Travel" }
];

export function Topbar() {
  const { role, setRole, merchantId, setMerchantId } = useRole();

  return (
    <header className="card flex flex-col gap-4 rounded-[2rem] p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-jade">Демо-режим без реальных операций</p>
        <p className="mt-1 text-sm text-graphite/70">Данные моковые, роли переключаются без авторизации.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as DemoRole)}
          className="focus-ring rounded-2xl border border-ink/10 bg-white/75 px-4 py-3 text-sm font-semibold text-ink shadow-insetSoft"
          aria-label="Переключатель роли"
        >
          {roleOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={role === "MERCHANT" ? merchantId : defaultMerchantId}
          onChange={(event) => setMerchantId(event.target.value)}
          className="focus-ring rounded-2xl border border-ink/10 bg-white/75 px-4 py-3 text-sm font-semibold text-ink shadow-insetSoft"
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
          className="focus-ring rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-moss"
        >
          Запустить сценарии
        </Link>
      </div>
    </header>
  );
}
