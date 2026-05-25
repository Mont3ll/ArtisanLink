"use client";

import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { DashboardShell } from "@/components/dashboard2";
import { CLIENT_NAV, type ClientDashboardView } from "./client-nav";
import { COLORS, TRANSITIONS } from "@/lib/design-tokens";

export function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeItem = CLIENT_NAV.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? CLIENT_NAV[0];

  return (
    <DashboardShell
      title="Client Workspace"
      subtitle="Find, save, message, hire, and review artisans"
      eyebrow="Client Dashboard"
      activeLabel={activeItem.label}
      items={[...CLIENT_NAV]}
      activeView={activeItem.id as ClientDashboardView}
      onSelect={(view) => {
        const target = CLIENT_NAV.find((item) => item.id === view);
        if (target) router.push(target.href);
      }}
      role="Client"
      headerMeta={
        <>
          <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>3 active jobs</span>
          <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]" style={{ borderColor: COLORS.hairline, background: COLORS.canvas, color: COLORS.body }}>Cash-only job payments</span>
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
