"use client";

import type { DashboardNavItem } from "./dashboard-sidebar";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

export function DashboardMobileNav<View extends string>({
  items,
  activeView,
  onSelect,
}: {
  items: Array<DashboardNavItem<View>>;
  activeView: View;
  onSelect: (view: View) => void;
}) {
  return (
    <div
      className="border-b p-3 lg:hidden"
      style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}
    >
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className="flex min-w-fit cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-[14px] font-medium transition-colors hover:bg-white"
              style={{
                borderColor: active ? COLORS.ink : COLORS.hairline,
                color: active ? COLORS.ink : COLORS.body,
                background: active ? COLORS.canvas : "transparent",
                boxShadow: active ? SHADOWS.soft : "none",
              }}
            >
              <Icon size={16} style={{ color: active ? COLORS.primary : COLORS.muted }} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className="ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold text-white"
                  style={{ background: COLORS.primary }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
