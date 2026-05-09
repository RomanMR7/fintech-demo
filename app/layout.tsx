import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { RoleProvider } from "@/components/role-provider";

export const metadata: Metadata = {
  title: "Fintech Demo Prototype",
  description: "Локальный интерактивный прототип платежной платформы"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <RoleProvider>
          <AppShell>{children}</AppShell>
        </RoleProvider>
      </body>
    </html>
  );
}
