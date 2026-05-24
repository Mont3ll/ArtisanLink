"use client";

import { usePathname, useRouter } from "next/navigation";

import { DashboardShell } from "@/components/dashboard2";
import { ADMIN_NAV, type AdminDashboardView } from "./admin-nav";

export function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeItem = ADMIN_NAV.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? ADMIN_NAV[0];

  return (
    <DashboardShell
      title="Admin Console"
      subtitle="Operate ChapaWorks"
      eyebrow="Admin workspace"
      activeLabel={activeItem.label}
      items={[...ADMIN_NAV]}
      activeView={activeItem.id as AdminDashboardView}
      onSelect={(view) => {
        const target = ADMIN_NAV.find((item) => item.id === view);
        if (target) router.push(target.href);
      }}
      role="Admin"
    >
      {children}
    </DashboardShell>
  );
}
