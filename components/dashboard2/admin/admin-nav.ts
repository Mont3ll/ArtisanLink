import { Activity, BarChart3, CreditCard, Database, FileCheck2, FileText, Gauge, Hammer, HardDrive, LayoutDashboard, Mail, MapPinned, ReceiptText, Search, Settings, Shield, UserRound, WalletCards } from "lucide-react";

export type AdminDashboardView = "overview" | "verification" | "artisans" | "users" | "invites" | "moderation" | "analytics" | "monitoring" | "locations" | "settings" | "database" | "earnings" | "payouts" | "reports" | "search" | "subscriptions" | "system" | "help";

export const ADMIN_NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/admin-dashboard" },
  { id: "verification", label: "Verification", icon: FileCheck2, href: "/admin-dashboard/verification", badge: 19 },
  { id: "artisans", label: "Artisans", icon: Hammer, href: "/admin-dashboard/artisans" },
  { id: "users", label: "Users", icon: UserRound, href: "/admin-dashboard/users" },
  { id: "invites", label: "Invites", icon: Mail, href: "/admin-dashboard/invites", badge: 7 },
  { id: "moderation", label: "Moderation", icon: Shield, href: "/admin-dashboard/moderation", badge: 3 },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin-dashboard/analytics" },
  { id: "earnings", label: "Earnings", icon: ReceiptText, href: "/admin-dashboard/earnings" },
  { id: "payouts", label: "Payouts", icon: WalletCards, href: "/admin-dashboard/payouts", badge: 5 },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, href: "/admin-dashboard/subscriptions" },
  { id: "reports", label: "Reports", icon: FileText, href: "/admin-dashboard/reports" },
  { id: "search", label: "Search", icon: Search, href: "/admin-dashboard/search" },
  { id: "monitoring", label: "Monitoring", icon: Activity, href: "/admin-dashboard/monitoring" },
  { id: "system", label: "System", icon: Gauge, href: "/admin-dashboard/system" },
  { id: "database", label: "Database", icon: Database, href: "/admin-dashboard/database" },
  { id: "locations", label: "Locations", icon: MapPinned, href: "/admin-dashboard/locations" },
  { id: "help", label: "Help", icon: HardDrive, href: "/admin-dashboard/help" },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin-dashboard/settings" },
] as const;
