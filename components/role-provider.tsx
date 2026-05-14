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
    setMerchantIdState(nextMerchantId);
    window.localStorage.setItem("demo-merchant-id", nextMerchantId);
  }, []);

  const setMerchantContext = useCallback((merchant: { id: string; name?: string | null }) => {
    setMerchantIdState(merchant.id);
    window.localStorage.setItem("demo-merchant-id", merchant.id);

    if (merchant.name) {
      setMerchantName(merchant.name);
      window.localStorage.setItem("demo-merchant-name", merchant.name);
    }
  }, []);

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
