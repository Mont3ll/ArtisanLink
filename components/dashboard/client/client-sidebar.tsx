"use client";

import * as React from "react"
import {
  IconDashboard,
  IconSearch,
  IconMapPin,
  IconMessage,
  IconHeart,
  IconSettings,
  IconHelp,
  IconStar,
  IconBriefcase,
  IconChartBar,
} from "@tabler/icons-react"
import { useUser } from "@clerk/nextjs"
import ChapaWorksLogo from "@/components/common/ChapaWorksLogo";

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
    url: "/client-dashboard/settings",
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "/client-dashboard/help",
    icon: IconHelp,
  },
]

const documents = [
  {
    name: "My Reviews",
    url: "/client-dashboard/reviews",
    icon: IconStar,
  },
]

export function ClientSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const { count: unreadCount } = useUnreadCount()

  const userData = {
    name: user?.fullName || "Client",
    email: user?.primaryEmailAddress?.emailAddress || "client@chapaworks.ke",
    avatar: user?.imageUrl || "/avatars/client.jpg",
  }

  // Build nav items with dynamic badge
  const navMain: NavItem[] = [
    {
      title: "Dashboard",
      url: "/client-dashboard",
      icon: IconDashboard,
    },
    {
      title: "Find Artisans",
      url: "/client-dashboard/find-artisans",
      icon: IconSearch,
    },
    {
      title: "My Jobs",
      url: "/client-dashboard/jobs",
      icon: IconBriefcase,
    },
    {
      title: "Map View",
      url: "/client-dashboard/map",
      icon: IconMapPin,
    },
    {
      title: "Messages",
      url: "/client-dashboard/messages",
      icon: IconMessage,
      badge: unreadCount,
    },
    {
      title: "Saved Artisans",
      url: "/client-dashboard/saved",
      icon: IconHeart,
    },
    {
      title: "Analytics",
      url: "/client-dashboard/analytics",
      icon: IconChartBar,
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
              <a href="/client-dashboard">
                <ChapaWorksLogo size={24} className="!size-6 dark:invert" />
                <span className="text-base font-semibold">ChapaWorks Client</span>
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

export default ClientSidebar;
