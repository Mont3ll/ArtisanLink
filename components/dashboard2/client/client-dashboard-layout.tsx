"use client";

import { usePathname, useRouter } from "next/navigation";

import { DashboardShell } from "@/components/dashboard2";
import { CLIENT_NAV, type ClientDashboardView } from "./client-nav";

export function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeItem = CLIENT_NAV.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? CLIENT_NAV[0];

  return (
    <DashboardShell
      title="Client Dashboard"
      subtitle="Hire trusted artisans"
      eyebrow="Client workspace"
      activeLabel={activeItem.label}
      items={[...CLIENT_NAV]}
      activeView={activeItem.id as ClientDashboardView}
      onSelect={(view) => {
        const target = CLIENT_NAV.find((item) => item.id === view);
        if (target) router.push(target.href);
      }}
      role="Client"
    >
      {children}
    </DashboardShell>
  );
}
