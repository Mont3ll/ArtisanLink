"use client";

import * as React from "react"
import {
  IconDashboard,
  IconSearch,
  IconMapPin,
  IconMessage,
  IconCalendar,
  IconHeart,
  IconHistory,
  IconSettings,
  IconHelp,
  IconInnerShadowTop,
  IconFolder,
  IconFileDescription,
  IconUsers,
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

// Client navigation data
const data = {
  navMain: [
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
      title: "Map View",
      url: "/client-dashboard/map",
      icon: IconMapPin,
    },
    {
      title: "Messages",
      url: "/client-dashboard/messages",
      icon: IconMessage,
    },
    {
      title: "My Projects",
      url: "/client-dashboard/projects",
      icon: IconCalendar,
    },
    {
      title: "Saved Artisans",
      url: "/client-dashboard/saved",
      icon: IconHeart,
    },
    {
      title: "History",
      url: "/client-dashboard/history",
      icon: IconHistory,
    },
  ],
  navSecondary: [
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
  ],
  documents: [
    {
      name: "Project Requests",
      url: "/client-dashboard/requests",
      icon: IconFolder,
    },
    {
      name: "Contracts",
      url: "/client-dashboard/contracts",
      icon: IconFileDescription,
    },
    {
      name: "Reviews Given",
      url: "/client-dashboard/reviews",
      icon: IconUsers,
    },
  ],
};

export function ClientSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()

  const userData = {
    name: user?.fullName || "Client",
    email: user?.primaryEmailAddress?.emailAddress || "client@artisanlink.ke",
    avatar: user?.imageUrl || "/avatars/client.jpg",
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
              <a href="/client-dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">ArtisanLink Client</span>
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

export default ClientSidebar;
