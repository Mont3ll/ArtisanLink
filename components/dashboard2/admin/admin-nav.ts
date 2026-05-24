import { Activity, BarChart3, FileCheck2, Hammer, LayoutDashboard, Mail, MapPinned, Settings, Shield, UserRound } from "lucide-react";

export type AdminDashboardView = "overview" | "verification" | "artisans" | "users" | "invites" | "moderation" | "analytics" | "monitoring" | "locations" | "settings";

export const ADMIN_NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/admin-dashboard" },
  { id: "verification", label: "Verification", icon: FileCheck2, href: "/admin-dashboard/verification" },
  { id: "artisans", label: "Artisans", icon: Hammer, href: "/admin-dashboard/artisans" },
  { id: "users", label: "Users", icon: UserRound, href: "/admin-dashboard/users" },
  { id: "invites", label: "Invites", icon: Mail, href: "/admin-dashboard/invites" },
  { id: "moderation", label: "Moderation", icon: Shield, href: "/admin-dashboard/moderation" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin-dashboard/analytics" },
  { id: "monitoring", label: "Monitoring", icon: Activity, href: "/admin-dashboard/monitoring" },
  { id: "locations", label: "Locations", icon: MapPinned, href: "/admin-dashboard/locations" },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin-dashboard/settings" },
] as const;
