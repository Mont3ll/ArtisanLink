'use client'

import { ReactNode } from 'react'
import { UserRole, isAdminRole } from '@/lib/roles'
import { RouteGuard } from '@/components/role/route-guard'
import { useUser } from '@clerk/nextjs'

// Dashboard Layout Components
import { AdminSidebar } from '@/components/dashboard/admin/admin-sidebar'
import { AdminHeader } from '@/components/dashboard/admin/admin-header'

// Artisan Layout Components  
import ArtisanSidebar from '@/components/dashboard/artisan/artisan-sidebar'
import { ArtisanHeader } from '@/components/dashboard/artisan/artisan-header'

// Client Layout Components
import ClientSidebar from '@/components/dashboard/client/client-sidebar'
import { ClientHeader } from '@/components/dashboard/client/client-header'

import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

interface RoleBasedLayoutProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  requiredRole?: UserRole
}

export function RoleBasedLayout({ 
  children, 
  allowedRoles, 
  requiredRole 
}: RoleBasedLayoutProps) {
  const { user } = useUser()
  const userRole = user?.publicMetadata?.role as UserRole | undefined
  
  const getSidebarComponent = () => {
    if (!userRole) {
      return <AdminSidebar variant="inset" /> // Default fallback
    }
    if (isAdminRole(userRole)) {
      return <AdminSidebar variant="inset" />
    } else if (userRole === 'artisan') {
      return <ArtisanSidebar variant="inset" />
    } else if (userRole === 'client') {
      return <ClientSidebar variant="inset" />
    }
    return <AdminSidebar variant="inset" /> // Default fallback
  }
  
  const getHeaderComponent = () => {
    if (!userRole) {
      return <AdminHeader /> // Default fallback
    }
    if (isAdminRole(userRole)) {
      return <AdminHeader />
    } else if (userRole === 'artisan') {
      return <ArtisanHeader />
    } else if (userRole === 'client') {
      return <ClientHeader />
    }
    return <AdminHeader /> // Default fallback
  }

  return (
    <RouteGuard allowedRoles={allowedRoles} requiredRole={requiredRole}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        {getSidebarComponent()}
        <SidebarInset>
          {getHeaderComponent()}
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RouteGuard>
  )
}

// Convenience components for specific roles
export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleBasedLayout requiredRole="admin">
      {children}
    </RoleBasedLayout>
  )
}

export function ArtisanLayout({ children }: { children: ReactNode }) {
  return (
    <RoleBasedLayout requiredRole="artisan">
      {children}
    </RoleBasedLayout>
  )
}

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <RoleBasedLayout requiredRole="client">
      {children}
    </RoleBasedLayout>
  )
}
