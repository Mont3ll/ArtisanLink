'use client'

import { usePathname } from "next/navigation"
import { Search, Plus, Calendar } from "lucide-react"
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
  "artisan-dashboard": "Dashboard",
  "portfolio": "Portfolio",
  "projects": "Projects",
  "messages": "Messages",
  "reviews": "Reviews",
  "earnings": "Earnings",
  "schedule": "Schedule",
  "settings": "Settings",
  "help": "Help",
  "profile": "Profile",
  "subscription": "Subscription",
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
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

export function ArtisanHeader() {
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
              <BreadcrumbLink href="/artisan-dashboard">
                Artisan
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
            placeholder="Search projects, clients..."
            className="w-[300px] pl-8"
          />
        </div>
        <Button size="sm" className="hidden md:flex">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
        <Button variant="outline" size="icon">
          <Calendar className="h-4 w-4" />
        </Button>
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  )
}
