"use client";

import type { LucideIcon } from "lucide-react";
import { PanelLeft } from "lucide-react";

import { COLORS } from "@/lib/design-tokens";

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
    <aside className="hidden h-screen border-r bg-white lg:block" style={{ borderColor: COLORS.hairlineSoft }}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b p-4" style={{ borderColor: COLORS.hairlineSoft }}>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold" style={{ color: COLORS.ink }}>{title}</p>
              <p className="truncate text-[12px]" style={{ color: COLORS.muted }}>{subtitle}</p>
            </div>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="grid h-10 w-10 place-items-center rounded-xl border transition-colors hover:bg-[#f7f7f7]"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeView;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                style={{
                  background: active ? COLORS.primaryTint : "transparent",
                  color: active ? COLORS.primaryActive : COLORS.body,
                }}
              >
                <Icon size={18} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.badge ? (
                  <span className="rounded-full px-2 py-0.5 text-[11px] text-white" style={{ background: COLORS.primary }}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
