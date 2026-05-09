"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DemoRole, defaultMerchantId, roleOptions } from "@/lib/roles";

type RoleContextValue = {
  role: DemoRole;
  merchantId: string;
  setRole: (role: DemoRole) => void;
  setMerchantId: (merchantId: string) => void;
  currentRoleLabel: string;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<DemoRole>("PLATFORM_ADMIN");
  const [merchantId, setMerchantIdState] = useState(defaultMerchantId);

  useEffect(() => {
    const savedRole = window.localStorage.getItem("demo-role") as DemoRole | null;
    const savedMerchant = window.localStorage.getItem("demo-merchant-id");
    if (savedRole && roleOptions.some((item) => item.value === savedRole)) setRoleState(savedRole);
    if (savedMerchant) setMerchantIdState(savedMerchant);
  }, []);

  const setRole = (nextRole: DemoRole) => {
    setRoleState(nextRole);
    window.localStorage.setItem("demo-role", nextRole);
  };

  const setMerchantId = (nextMerchantId: string) => {
    setMerchantIdState(nextMerchantId);
    window.localStorage.setItem("demo-merchant-id", nextMerchantId);
  };

  const value = useMemo(
    () => ({
      role,
      merchantId,
      setRole,
      setMerchantId,
      currentRoleLabel: roleOptions.find((item) => item.value === role)?.label ?? role
    }),
    [role, merchantId]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used inside RoleProvider");
  return context;
}
