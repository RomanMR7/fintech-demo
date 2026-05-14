"use client";

import { MobileNavigation, Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <div className="app-grid">
        <Sidebar />
        <div className="min-w-0">
          <MobileNavigation />
          <Topbar />
          <main className="mt-4 pb-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
