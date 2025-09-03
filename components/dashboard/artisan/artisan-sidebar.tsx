"use client";

import * as React from "react"
import {
  IconCalendar,
  IconDashboard,
  IconMessage,
  IconUsers,
  IconStar,
  IconCurrencyDollar,
  IconChartBar,
  IconSettings,
  IconHelp,
  IconSearch,
  IconInnerShadowTop,
  IconBriefcase,
  IconFileDescription,
  IconEye,
} from "@tabler/icons-react"
import { useUser } from "@clerk/nextjs"

import { NavMain } from "@/components/shared/nav-main";
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

// Artisan navigation data
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/artisan-dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Projects",
      url: "/artisan-dashboard/projects",
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
    },
    {
      title: "Inquiries",
      url: "/artisan-dashboard/inquiries",
      icon: IconUsers,
    },
    {
      title: "Calendar",
      url: "/artisan-dashboard/calendar",
      icon: IconCalendar,
    },
    {
      title: "Reviews",
      url: "/artisan-dashboard/reviews",
      icon: IconStar,
    },
    {
      title: "Earnings",
      url: "/artisan-dashboard/earnings",
      icon: IconCurrencyDollar,
    },
  ],
  navSecondary: [
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
    {
      title: "Search",
      url: "/artisan-dashboard/search",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Profile Analytics",
      url: "/artisan-dashboard/analytics",
      icon: IconChartBar,
    },
    {
      name: "Profile Views",
      url: "/artisan-dashboard/views", 
      icon: IconEye,
    },
    {
      name: "Certificates",
      url: "/artisan-dashboard/certificates",
      icon: IconFileDescription,
    },
  ],
}

export function ArtisanSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()

  const userData = {
    name: user?.fullName || "Artisan",
    email: user?.primaryEmailAddress?.emailAddress || "artisan@artisanlink.ke",
    avatar: user?.imageUrl || "/avatars/artisan.jpg",
  }

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
                <span className="text-base font-semibold">ArtisanLink Studio</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default ArtisanSidebar;
