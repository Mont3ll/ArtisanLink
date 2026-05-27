"use client";

import { useState } from "react";

import { DashboardMobileNav } from "./dashboard-mobile-nav";
import { DashboardSidebar, type DashboardNavItem } from "./dashboard-sidebar";
import { DashboardTopBar } from "./dashboard-topbar";

export function DashboardShell<View extends string>({
  title,
  subtitle,
  eyebrow,
  activeLabel,
  items,
  activeView,
  onSelect,
  role,
  headerMeta,
  children,
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  activeLabel?: string;
  items: Array<DashboardNavItem<View>>;
  activeView: View;
  onSelect: (view: View) => void;
  role: "Artisan" | "Client" | "Admin" | "Studio";
  headerMeta?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <section className="h-screen w-full overflow-hidden bg-white">
      <div
        className="grid h-screen transition-[grid-template-columns] duration-300 ease-out lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
        style={{ ["--sidebar-width" as string]: sidebarCollapsed ? "88px" : "260px" }}
      >
        <DashboardSidebar
          title={title}
          subtitle={subtitle}
          items={items}
          activeView={activeView}
          onSelect={onSelect}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((value) => !value)}
          role={role}
        />
        <div className="min-h-0 min-w-0 overflow-y-auto bg-white">
          <DashboardMobileNav items={items} activeView={activeView} onSelect={onSelect} />
          <DashboardTopBar eyebrow={eyebrow} title={activeLabel ?? title} role={role} meta={headerMeta} />
          {children}
        </div>
      </div>
    </section>
  );
}
