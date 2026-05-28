import { Bookmark, ClipboardList, LayoutDashboard, MessageCircle, Search, Settings, Star } from "lucide-react";

export type ClientDashboardView = "overview" | "find" | "saved" | "jobs" | "messages" | "reviews" | "settings";

export const CLIENT_NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/client/dashboard" },
  { id: "find", label: "Find artisans", icon: Search, href: "/client/find-artisans" },
  { id: "saved", label: "Saved", icon: Bookmark, href: "/client/saved" },
  { id: "jobs", label: "Jobs", icon: ClipboardList, href: "/client/jobs" },
  { id: "messages", label: "Messages", icon: MessageCircle, href: "/client/messages" },
  { id: "reviews", label: "Reviews", icon: Star, href: "/client/reviews" },
  { id: "settings", label: "Settings", icon: Settings, href: "/client/settings" },
] as const;
