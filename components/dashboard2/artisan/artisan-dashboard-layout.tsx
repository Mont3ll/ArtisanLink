"use client";

import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { DashboardShell } from "@/components/dashboard2";
import { StatusChip } from "@/components/ui2";
import { ARTISAN_NAV, type ArtisanDashboardView } from "./artisan-nav";
import { COLORS, TRANSITIONS } from "@/lib/design-tokens";

export function ArtisanDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const activeItem =
    ARTISAN_NAV.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? ARTISAN_NAV[0];

  return (
    <DashboardShell
      title="Artisan Studio"
      subtitle="Jobs, messages, portfolio, earnings, and subscription"
      eyebrow="ChapaWorks Studio"
      activeLabel={activeItem.label}
      items={[...ARTISAN_NAV]}
      activeView={activeItem.id as ArtisanDashboardView}
      onSelect={(view) => {
        const target = ARTISAN_NAV.find((item) => item.id === view);
        if (target) router.push(target.href);
      }}
      role="Artisan"
      headerMeta={
        <>
          <StatusChip status="PENDING" />
          <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>82% profile complete</span>
        </>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeItem.id}
          layout="position"
          initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(1.5px)" }}
          transition={TRANSITIONS.route}
          className="min-h-0"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </DashboardShell>
  );
}
