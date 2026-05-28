"use client";

import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { DashboardShell } from "@/components/dashboard2";
import { StatusChip } from "@/components/ui2";
import { ADMIN_NAV, type AdminDashboardView } from "./admin-nav";
import { COLORS, TRANSITIONS } from "@/lib/design-tokens";

export function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Normalize both /admin/* and /admin-dashboard/* for active detection
  const normalizedPathname = pathname
    .replace(/^\/admin-dashboard/, '/admin')
    .replace(/^\/admin$/, '/admin');
  const sourceRouteMode = pathname === "/admin" || pathname.startsWith("/admin/");
  const activeItem = ADMIN_NAV.find((item) => normalizedPathname === item.href || normalizedPathname.startsWith(`${item.href}/`)) ?? ADMIN_NAV[0];

  return (
    <DashboardShell
      title="Admin Console"
      subtitle="Trust, users, invites, and moderation"
      eyebrow="Admin Console"
      activeLabel={activeItem.label}
      items={[...ADMIN_NAV]}
      activeView={activeItem.id as AdminDashboardView}
      onSelect={(view) => {
        const target = ADMIN_NAV.find((item) => item.id === view);
        if (target) {
          router.push(target.href);
        }
      }}
      role="Admin"
      headerMeta={
        <>
          <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>System operational</span>
          <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]" style={{ borderColor: "#fde68a", background: "#fffbeb", color: "#92400e" }}>19 pending reviews</span>
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
