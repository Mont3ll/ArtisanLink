"use client";

import { usePathname, useRouter } from "next/navigation";

import { DashboardShell } from "@/components/dashboard2";
import { ARTISAN_NAV, type ArtisanDashboardView } from "./artisan-nav";

export function ArtisanDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const activeItem =
    ARTISAN_NAV.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? ARTISAN_NAV[0];

  return (
    <DashboardShell
      title="Artisan Dashboard"
      subtitle="Manage your craft"
      eyebrow="Artisan workspace"
      activeLabel={activeItem.label}
      items={[...ARTISAN_NAV]}
      activeView={activeItem.id as ArtisanDashboardView}
      onSelect={(view) => {
        const target = ARTISAN_NAV.find((item) => item.id === view);
        if (target) router.push(target.href);
      }}
      role="Artisan"
    >
      {children}
    </DashboardShell>
  );
}
