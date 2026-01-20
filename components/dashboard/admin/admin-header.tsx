'use client'

import { usePathname } from "next/navigation"
import { Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { NotificationBell } from "@/components/shared/notification-bell"
import { ThemeToggle } from "@/components/theme-toggle"
import React from "react"

// Map of route segments to display names
const routeLabels: Record<string, string> = {
  "admin-dashboard": "Dashboard",
  "analytics": "Analytics",
  "artisans": "Artisans",
  "database": "Database",
  "help": "Help",
  "locations": "Locations",
  "moderation": "Moderation",
  "monitoring": "Monitoring",
  "reports": "Reports",
  "search": "Search",
  "settings": "Settings",
  "subscriptions": "Subscriptions",
  "system": "System",
  "users": "Users",
  "verification": "Verification",
}

function getBreadcrumbs(pathname: string) {
  // Remove leading slash and split into segments
  const segments = pathname.split('/').filter(Boolean)
  
  // Build breadcrumb items
  const breadcrumbs: { label: string; href: string; isLast: boolean }[] = []
  let currentPath = ''
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isLast: i === segments.length - 1,
    })
  }
  
  return breadcrumbs
}

export function AdminHeader() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)
  
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/admin-dashboard">
                Admin
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href} className="hidden md:block">
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search platform..."
            className="w-[300px] pl-8"
          />
        </div>
        <NotificationBell />
        <ThemeToggle />
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
