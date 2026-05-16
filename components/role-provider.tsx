"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DemoRole, defaultMerchantId, roleOptions } from "@/lib/roles";

type RoleContextValue = {
  role: DemoRole;
  merchantId: string;
  merchantName: string | null;
  setRole: (role: DemoRole) => void;
  setMerchantId: (merchantId: string) => void;
  setMerchantContext: (merchant: { id: string; name?: string | null }) => void;
  currentRoleLabel: string;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<DemoRole>("PLATFORM_ADMIN");
  const [merchantId, setMerchantIdState] = useState(defaultMerchantId);
  const [merchantName, setMerchantName] = useState<string | null>(null);

  const syncDemoSession = useCallback((nextRole: DemoRole, nextMerchantId: string) => {
    void fetch("/api/demo-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole, merchantId: nextMerchantId })
    }).catch(() => {
      // The UI remains usable offline; API routes will fall back to safe defaults/body during transition.
    });
  }, []);

  useEffect(() => {
    const savedRole = window.localStorage.getItem("demo-role") as DemoRole | null;
    const savedMerchant = window.localStorage.getItem("demo-merchant-id");
    const savedMerchantName = window.localStorage.getItem("demo-merchant-name");
    if (savedRole && roleOptions.some((item) => item.value === savedRole)) setRoleState(savedRole);
    if (savedMerchant) setMerchantIdState(savedMerchant);
    if (savedMerchantName) setMerchantName(savedMerchantName);
  }, []);

  const setRole = useCallback((nextRole: DemoRole) => {
    setRoleState(nextRole);
    window.localStorage.setItem("demo-role", nextRole);
  }, []);

  const setMerchantId = useCallback((nextMerchantId: string) => {
    const safeMerchantId = nextMerchantId || defaultMerchantId;
    setMerchantIdState(safeMerchantId);
    setMerchantName(null);
    window.localStorage.setItem("demo-merchant-id", safeMerchantId);
    window.localStorage.removeItem("demo-merchant-name");
  }, []);

  const setMerchantContext = useCallback((merchant: { id: string; name?: string | null }) => {
    const safeMerchantId = merchant.id || defaultMerchantId;
    setMerchantIdState(safeMerchantId);
    window.localStorage.setItem("demo-merchant-id", safeMerchantId);

    if (merchant.name) {
      setMerchantName(merchant.name);
      window.localStorage.setItem("demo-merchant-name", merchant.name);
    } else {
      setMerchantName(null);
      window.localStorage.removeItem("demo-merchant-name");
    }
  }, []);

  useEffect(() => {
    syncDemoSession(role, merchantId);
  }, [merchantId, role, syncDemoSession]);

  const value = useMemo(
    () => ({
      role,
      merchantId,
      merchantName,
      setRole,
      setMerchantId,
      setMerchantContext,
      currentRoleLabel: roleOptions.find((item) => item.value === role)?.label ?? role
    }),
    [role, merchantId, merchantName]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used inside RoleProvider");
  return context;
}
