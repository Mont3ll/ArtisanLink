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
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/artisan/dashboard" },
  { id: "jobs", label: "Jobs", icon: ClipboardList, href: "/artisan/jobs" },
  { id: "messages", label: "Messages", icon: MessageCircle, href: "/artisan/messages" },
  { id: "portfolio", label: "Portfolio", icon: Images, href: "/artisan/portfolio" },
  { id: "earnings", label: "Earnings", icon: WalletCards, href: "/artisan/earnings" },
  { id: "subscription", label: "Subscription", icon: Star, href: "/artisan/subscription" },
  { id: "settings", label: "Settings", icon: Settings, href: "/artisan/settings" },
] as const;
