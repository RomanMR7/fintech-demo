"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

const merchantScopedPaths = new Set(["/dashboard", "/merchant", "/orders", "/payouts", "/balances", "/requisites", "/appeals"]);

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, merchantId, setMerchantContext } = useRole();
  const [merchants, setMerchants] = useState<MerchantOption[]>(fallbackMerchants);
  const [merchantCatalogVersion, setMerchantCatalogVersion] = useState(0);
  const merchantIdRef = useRef(merchantId);

  useEffect(() => {
    merchantIdRef.current = merchantId;
  }, [merchantId]);

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

        const currentMerchant = nextMerchants.find((merchant) => merchant.id === merchantId);
        if (currentMerchant) {
          setMerchantContext({ id: currentMerchant.id, name: currentMerchant.label });
        } else {
          const fallbackMerchant = nextMerchants[0] ?? fallbackMerchants[0];
          setMerchantContext({ id: fallbackMerchant?.id ?? defaultMerchantId, name: fallbackMerchant?.label ?? "Орбита" });
        }
      } catch {
        setMerchants(fallbackMerchants);
        const fallbackMerchant = fallbackMerchants[0];
        setMerchantContext({ id: fallbackMerchant.id, name: fallbackMerchant.label });
      }
    }

    loadMerchants();

    return () => {
      active = false;
    };
  }, [merchantId, merchantCatalogVersion, setMerchantContext]);

  useEffect(() => {
    const refreshMerchants = (event: Event) => {
      const detail = (event as CustomEvent<{ merchant?: { id?: string; displayName?: string } }>).detail;
      if (detail?.merchant?.id && detail.merchant.displayName) {
        setMerchants((current) => {
          const nextMerchant = { id: detail.merchant!.id!, label: detail.merchant!.displayName! };
          const next = current.some((merchant) => merchant.id === nextMerchant.id)
            ? current.map((merchant) => (merchant.id === nextMerchant.id ? nextMerchant : merchant))
            : [...current, nextMerchant];

          return next.sort((a, b) => a.label.localeCompare(b.label, "ru"));
        });
      }

      setMerchantCatalogVersion((version) => version + 1);
    };

    window.addEventListener("demo-merchants-updated", refreshMerchants);

    return () => {
      window.removeEventListener("demo-merchants-updated", refreshMerchants);
    };
  }, []);

  useEffect(() => {
    if (!merchantScopedPaths.has(pathname)) return;

    const params = new URLSearchParams(window.location.search);
    const urlMerchantId = params.get("merchantId");
    const selectedMerchant = merchants.find((merchant) => merchant.id === merchantId) ?? merchants[0] ?? fallbackMerchants[0];

    if (pathname !== "/merchant" && !urlMerchantId) return;

    if (urlMerchantId) {
      const urlMerchant = merchants.find((merchant) => merchant.id === urlMerchantId);
      if (urlMerchant) {
        if (urlMerchant.id !== merchantIdRef.current) {
          setMerchantContext({ id: urlMerchant.id, name: urlMerchant.label });
        }
        return;
      }

      if (pathname !== "/merchant") {
        params.delete("merchantId");
        const nextQuery = params.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
      } else {
        router.replace(`/merchant?merchantId=${encodeURIComponent(selectedMerchant?.id ?? defaultMerchantId)}`);
      }
      return;
    }

    router.replace(`/merchant?merchantId=${encodeURIComponent(selectedMerchant?.id ?? defaultMerchantId)}`);
  }, [merchantId, merchants, pathname, router, setMerchantContext]);

  const selectedMerchantId = merchants.some((merchant) => merchant.id === merchantId) ? merchantId : merchants[0]?.id ?? defaultMerchantId;
  const handleMerchantChange = (nextMerchantId: string) => {
    const nextMerchant = merchants.find((merchant) => merchant.id === nextMerchantId);
    setMerchantContext({ id: nextMerchantId, name: nextMerchant?.label ?? nextMerchantId });

    if (merchantScopedPaths.has(pathname)) {
      const params = new URLSearchParams(window.location.search);
      params.set("merchantId", nextMerchantId);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <header className="card grid min-h-[4.75rem] gap-3 rounded-[var(--radius-xl)] p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="grid min-w-0 gap-3 2xl:grid-cols-[auto_minmax(18rem,1fr)] 2xl:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="pill bg-white/60 text-ink">
            <span className="status-dot" />
            Sandbox
          </span>
          <span className="pill tone-green">API 99.4%</span>
        </div>
        <GlobalSearch />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:items-center xl:justify-end">
        <select value={role} onChange={(event) => setRole(event.target.value as DemoRole)} className="field focus-ring min-w-0 xl:w-[220px]" aria-label="Переключатель роли">
          {roleOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={selectedMerchantId}
          onChange={(event) => handleMerchantChange(event.target.value)}
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
