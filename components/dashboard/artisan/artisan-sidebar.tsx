"use client";

import * as React from "react"
import {
  IconDashboard,
  IconMessage,
  IconStar,
  IconChartBar,
  IconSettings,
  IconHelp,
  IconFileDescription,
  IconCrown,
  IconReceipt,
  IconInnerShadowTop,
  IconBriefcase,
  IconWallet,
} from "@tabler/icons-react"
import { useUser } from "@clerk/nextjs"

import { NavMain, type NavItem } from "@/components/shared/nav-main";
import { NavDocuments } from "@/components/shared/nav-documents";
import { NavSecondary } from "@/components/shared/nav-secondary";
import { NavUser } from "@/components/shared/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUnreadCount } from "@/lib/hooks";

// Static navigation data
const navSecondary = [
  {
    title: "Settings",
    url: "/artisan-dashboard/settings",
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "/artisan-dashboard/help",
    icon: IconHelp,
  },
]

const documents = [
  {
    name: "Earnings",
    url: "/artisan-dashboard/earnings",
    icon: IconWallet,
  },
  {
    name: "Profile Analytics",
    url: "/artisan-dashboard/analytics",
    icon: IconChartBar,
  },
  {
    name: "Payment History",
    url: "/artisan-dashboard/payments", 
    icon: IconReceipt,
  },
]

export function ArtisanSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const { count: unreadCount } = useUnreadCount()

  const userData = {
    name: user?.fullName || "Artisan",
    email: user?.primaryEmailAddress?.emailAddress || "artisan@chapaworks.ke",
    avatar: user?.imageUrl || "/avatars/artisan.jpg",
  }

  // Build nav items with dynamic badge
  const navMain: NavItem[] = [
    {
      title: "Dashboard",
      url: "/artisan-dashboard",
      icon: IconDashboard,
    },
    {
      title: "Jobs",
      url: "/artisan-dashboard/jobs",
      icon: IconBriefcase,
    },
    {
      title: "Portfolio",
      url: "/artisan-dashboard/portfolio",
      icon: IconFileDescription,
    },
    {
      title: "Messages",
      url: "/artisan-dashboard/messages",
      icon: IconMessage,
      badge: unreadCount,
    },
    {
      title: "Reviews",
      url: "/artisan-dashboard/reviews",
      icon: IconStar,
    },
    {
      title: "Subscription",
      url: "/artisan-dashboard/subscription",
      icon: IconCrown,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/artisan-dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">ChapaWorks Studio</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default ArtisanSidebar;
