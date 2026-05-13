"use client";

import { MobileNavigation, Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-screen px-3 py-3 text-ink sm:px-4 sm:py-4 md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-3 sm:gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0">
          <MobileNavigation />
          <Topbar />
          <main className="mt-3 pb-12 sm:mt-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
