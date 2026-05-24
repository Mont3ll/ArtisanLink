import {
  ClipboardList,
  Images,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Star,
  WalletCards,
} from "lucide-react";

export type ArtisanDashboardView =
  | "overview"
  | "jobs"
  | "messages"
  | "portfolio"
  | "earnings"
  | "subscription"
  | "settings";

export const ARTISAN_NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/artisan-dashboard" },
  { id: "jobs", label: "Jobs", icon: ClipboardList, href: "/artisan-dashboard/jobs" },
  { id: "messages", label: "Messages", icon: MessageCircle, href: "/artisan-dashboard/messages" },
  { id: "portfolio", label: "Portfolio", icon: Images, href: "/artisan-dashboard/portfolio" },
  { id: "earnings", label: "Earnings", icon: WalletCards, href: "/artisan-dashboard/earnings" },
  { id: "subscription", label: "Subscription", icon: Star, href: "/artisan-dashboard/subscription" },
  { id: "settings", label: "Settings", icon: Settings, href: "/artisan-dashboard/settings" },
] as const;
