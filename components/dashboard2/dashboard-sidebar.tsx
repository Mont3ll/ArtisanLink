"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";

import { COLORS, SHADOWS, TRANSITIONS } from "@/lib/design-tokens";

export type DashboardNavItem<View extends string> = {
  id: View;
  label: string;
  icon: LucideIcon;
  badge?: number;
  href: string;
};

export function DashboardSidebar<View extends string>({
  title,
  subtitle,
  items,
  activeView,
  onSelect,
  collapsed,
  onToggle,
  role,
}: {
  title: string;
  subtitle: string;
  items: Array<DashboardNavItem<View>>;
  activeView: View;
  onSelect: (view: View) => void;
  collapsed: boolean;
  onToggle?: () => void;
  role: "Artisan" | "Client" | "Admin" | "Studio";
}) {
  return (
    <motion.aside
      layout
      initial={false}
      transition={TRANSITIONS.dashboard}
      className={
        collapsed
          ? "sticky top-0 hidden h-screen min-h-0 overflow-hidden border-r bg-[#f7f7f7] p-3 lg:flex lg:flex-col"
          : "sticky top-0 hidden h-screen min-h-0 overflow-hidden border-r bg-[#f7f7f7] p-4 lg:flex lg:flex-col"
      }
      style={{ borderColor: COLORS.hairlineSoft }}
    >
      {/* Header: Logo + collapse toggle */}
      <motion.div
        layout
        className={
          collapsed
            ? "mb-6 flex flex-col items-center gap-3"
            : "mb-6 flex items-center justify-between gap-3"
        }
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {collapsed ? (
            <motion.span
              key="collapsed-logo"
              layout
              initial={{ opacity: 0, scale: 0.9, x: -6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -6 }}
              transition={TRANSITIONS.dashboard}
              className="grid h-10 w-10 place-items-center rounded-xl border"
              style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}
            >
              <Image
                src="/logo.svg"
                alt="ChapaWorks"
                width={24}
                height={24}
                className="h-6 w-6 object-contain opacity-90"
              />
            </motion.span>
          ) : (
            <motion.div
              key="expanded-logo"
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={TRANSITIONS.dashboard}
              className="flex items-center gap-2 font-semibold tracking-tight"
              style={{ color: COLORS.primary }}
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl border" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}>
                <Image src="/logo.svg" alt="ChapaWorks" width={24} height={24} className="h-6 w-6 object-contain opacity-90" />
              </span>
              <span className="text-[20px] font-bold leading-none">ChapaWorks</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <motion.button
          layout
          onClick={onToggle}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]"
          style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          whileTap={{ scale: 0.94 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={collapsed ? "expand" : "collapse"}
              initial={{ opacity: 0, rotate: collapsed ? -90 : 90, x: collapsed ? -3 : 3 }}
              animate={{ opacity: 1, rotate: 0, x: 0 }}
              exit={{ opacity: 0, rotate: collapsed ? 90 : -90, x: collapsed ? 3 : -3 }}
              transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.46 }}
              className="grid place-items-center"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Title/subtitle */}
      {!collapsed && (
        <div className="mb-4 px-2">
          <p className="text-[13px] font-semibold leading-[1.23]" style={{ color: COLORS.ink }}>{title}</p>
          <p className="mt-1 text-[12px] leading-[1.33]" style={{ color: COLORS.muted }}>{subtitle}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex min-h-0 flex-1 flex-col justify-start gap-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              title={collapsed ? item.label : undefined}
              className={
                collapsed
                  ? "relative flex h-11 cursor-pointer items-center justify-center rounded-[12px] text-left text-[14px] font-medium transition-colors hover:bg-white"
                  : "flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[14px] font-medium transition-colors hover:bg-white"
              }
              style={{
                color: active ? COLORS.ink : COLORS.body,
                background: active ? COLORS.canvas : "transparent",
                boxShadow: active ? SHADOWS.soft : "none",
              }}
            >
              <Icon size={17} style={{ color: active ? COLORS.primary : COLORS.muted }} />
              {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
              {item.badge !== undefined && (
                <span
                  className={
                    collapsed
                      ? "absolute right-1.5 top-1 grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-semibold text-white"
                      : "ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold text-white"
                  }
                  style={{ background: COLORS.primary }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Artisan upgrade CTA */}
      {role === "Artisan" && !collapsed && (
        <div className="mt-auto rounded-[18px] border p-4" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white" style={{ color: COLORS.primary }}>
              <Sparkles size={17} />
            </span>
            <span>
              <p className="text-[13px] font-semibold leading-[1.23]" style={{ color: COLORS.ink }}>Premium Artisan</p>
              <p className="text-[12px] leading-[1.33]" style={{ color: COLORS.primaryActive }}>Boost visibility</p>
            </span>
          </div>
          <p className="text-[12px] leading-[1.33]" style={{ color: COLORS.body }}>
            Priority placement, premium badge, more portfolio slots, and lower commission.
          </p>
          <button
            onClick={() => onSelect("subscription" as View)}
            className="mt-3 h-9 w-full cursor-pointer rounded-lg text-[13px] font-medium text-white transition-colors hover:bg-emerald-800"
            style={{ background: COLORS.primary }}
          >
            Manage plan
          </button>
        </div>
      )}
    </motion.aside>
  );
}
