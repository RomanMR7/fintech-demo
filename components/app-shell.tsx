"use client";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-4 py-4 text-ink md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0">
          <Topbar />
          <main className="mt-5 pb-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
