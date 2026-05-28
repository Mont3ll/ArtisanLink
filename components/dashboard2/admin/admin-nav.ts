import { Activity, BarChart3, CreditCard, Database, FileCheck2, FileText, Gauge, Hammer, HardDrive, LayoutDashboard, Mail, MapPinned, ReceiptText, Search, Settings, Shield, UserRound, WalletCards } from "lucide-react";

export type AdminDashboardView = "overview" | "verification" | "artisans" | "users" | "invites" | "moderation" | "analytics" | "monitoring" | "locations" | "settings" | "database" | "earnings" | "payouts" | "reports" | "search" | "subscriptions" | "system" | "help";

export const ADMIN_NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { id: "verification", label: "Verification", icon: FileCheck2, href: "/admin/verification", badge: 19 },
  { id: "artisans", label: "Artisans", icon: Hammer, href: "/admin/artisans" },
  { id: "users", label: "Users", icon: UserRound, href: "/admin/users" },
  { id: "invites", label: "Invites", icon: Mail, href: "/admin/invites", badge: 7 },
  { id: "moderation", label: "Moderation", icon: Shield, href: "/admin/moderation", badge: 3 },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { id: "earnings", label: "Earnings", icon: ReceiptText, href: "/admin/earnings" },
  { id: "payouts", label: "Payouts", icon: WalletCards, href: "/admin/payouts", badge: 5 },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, href: "/admin/subscriptions" },
  { id: "reports", label: "Reports", icon: FileText, href: "/admin/reports" },
  { id: "search", label: "Search", icon: Search, href: "/admin/search" },
  { id: "monitoring", label: "Monitoring", icon: Activity, href: "/admin/monitoring" },
  { id: "system", label: "System", icon: Gauge, href: "/admin/system" },
  { id: "database", label: "Database", icon: Database, href: "/admin/database" },
  { id: "locations", label: "Locations", icon: MapPinned, href: "/admin/locations" },
  { id: "help", label: "Help", icon: HardDrive, href: "/admin/help" },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
] as const;
