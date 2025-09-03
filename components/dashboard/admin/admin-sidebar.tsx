"use client"

import * as React from "react"
import {
  IconSettings,
  IconShield,
  IconUsers,
  IconDashboard,
  IconChartBar,
  IconCurrencyDollar,
  IconBell,
  IconFileDescription,
  IconHammer,
  IconMapPin,
  IconSearch,
  IconHelp,
  IconInnerShadowTop,
  IconActivity,
  IconAlertTriangle,
  IconDatabase,
} from "@tabler/icons-react"
import { useUser } from "@clerk/nextjs"

import { NavDocuments } from "@/components/shared/nav-documents"
import { NavMain } from "@/components/shared/nav-main"
import { NavSecondary } from "@/components/shared/nav-secondary"
import { NavUser } from "@/components/shared/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const adminNavData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin-dashboard",
      icon: IconDashboard,
    },
    {
      title: "User Management",
      url: "/admin-dashboard/users",
      icon: IconUsers,
    },
    {
      title: "Artisan Verification",
      url: "/admin-dashboard/verification",
      icon: IconShield,
    },
    {
      title: "Analytics",
      url: "/admin-dashboard/analytics",
      icon: IconChartBar,
    },
    {
      title: "Subscriptions",
      url: "/admin-dashboard/subscriptions",
      icon: IconCurrencyDollar,
    },
    {
      title: "System Monitoring",
      url: "/admin-dashboard/monitoring",
      icon: IconBell,
    },
  ],
  navSecondary: [
    {
      title: "Platform Settings",
      url: "/admin-dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/admin-dashboard/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/admin-dashboard/search",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "System Reports",
      url: "/admin-dashboard/reports",
      icon: IconFileDescription,
    },
    {
      name: "Artisan Directory",
      url: "/admin-dashboard/artisans",
      icon: IconHammer,
    },
    {
      name: "System Health",
      url: "/admin-dashboard/system",
      icon: IconActivity,
    },
    {
      name: "Content Moderation",
      url: "/admin-dashboard/moderation",
      icon: IconAlertTriangle,
    },
    {
      name: "Location Analytics",
      url: "/admin-dashboard/locations",
      icon: IconMapPin,
    },
    {
      name: "Database",
      url: "/admin-dashboard/database",
      icon: IconDatabase,
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()

  const userData = {
    name: user?.fullName || "Admin User",
    email: user?.primaryEmailAddress?.emailAddress || "admin@artisanlink.ke",
    avatar: user?.imageUrl || "/avatars/admin.jpg",
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
              <a href="/admin-dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">ArtisanLink Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminNavData.navMain} />
        <NavDocuments items={adminNavData.documents} />
        <NavSecondary items={adminNavData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AdminSidebar
