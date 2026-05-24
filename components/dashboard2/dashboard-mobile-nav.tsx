"use client";

import type { DashboardNavItem } from "./dashboard-sidebar";
import { COLORS } from "@/lib/design-tokens";

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
    <div className="border-b bg-white px-4 py-3 lg:hidden" style={{ borderColor: COLORS.hairlineSoft }}>
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeView;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className="flex min-w-fit items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium"
              style={{ background: active ? COLORS.primaryTint : COLORS.surfaceSoft, color: active ? COLORS.primaryActive : COLORS.body }}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
