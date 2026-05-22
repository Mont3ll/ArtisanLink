'use client'

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminTasksTable } from "./admin-tasks-table"
import { 
  useAdminStats, 
  useSystemTasks, 
  useRecentUsers,
} from "@/lib/hooks"
import { useAdminMonitoring } from "@/lib/hooks/use-admin-monitoring"
import { 
  Users, 
  Hammer, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Settings,
  Shield,
  MapPin,
  Star,
} from "lucide-react"

// Stat card with skeleton support
function MetricCard({
  title,
  icon: Icon,
  value,
  subtext,
  isLoading,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  value?: string | number
  subtext: React.ReactNode
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <div className="text-xs text-muted-foreground">
          {isLoading ? <Skeleton className="h-3 w-32" /> : subtext}
        </div>
      </CardContent>
    </Card>
  )
}

// System health row
function HealthRow({ 
  label, 
  value, 
  icon, 
  isLoading 
}: { 
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  isLoading: boolean 
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      {isLoading ? (
        <Skeleton className="h-4 w-16" />
      ) : (
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-bold">{value}</span>
        </div>
      )}
    </div>
  )
}

// Recent user row
function UserRow({
  user,
}: {
  user: {
    id: string
    user: string
    email: string
    role: string
    status: string
    location: string
    joinDate: string
    profession: string | null
    portfolioItems: number
  }
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{user.user}</h4>
          <Badge variant={user.status === "verified" ? "default" : "secondary"}>
            {user.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {user.location} • {user.role}
          {user.profession && ` • ${user.profession}`}
        </div>
      </div>
      <div className="text-right text-sm text-muted-foreground">
        <div>Joined {user.joinDate}</div>
        {user.portfolioItems > 0 && (
          <div className="text-xs">{user.portfolioItems} portfolio items</div>
        )}
      </div>
    </div>
  )
}

function UserRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="text-right space-y-1">
        <Skeleton className="h-4 w-24 ml-auto" />
        <Skeleton className="h-3 w-20 ml-auto" />
      </div>
    </div>
  )
}

export function AdminDashboardContent() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats()
  const { data: systemTasks, isLoading: tasksLoading } = useSystemTasks()
  const { data: recentUsers, isLoading: usersLoading } = useRecentUsers()
  const { data: monitoring, isLoading: monitoringLoading } = useAdminMonitoring()

  // Show error state if stats failed (critical data)
  if (statsError) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">
              {statsError instanceof Error ? statsError.message : 'An error occurred'}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Retry
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/health')
                    const data = await response.json()
                    console.log('Health check:', data)
                    alert(`Health Check:\nDatabase: ${data.database}\nTotal Users: ${data.totalUsers}\nAdmin Users: ${data.adminUsers}`)
                  } catch (err) {
                    console.error('Health check failed:', err)
                    alert('Health check failed')
                  }
                }}
                variant="outline"
              >
                Check Database Health
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/user/me')
                    const data = await response.json()
                    console.log('Current user info:', data)
                    alert(`User info: ${JSON.stringify(data, null, 2)}`)
                  } catch (err) {
                    console.error('Error checking user:', err)
                    alert('Error checking user info')
                  }
                }}
                variant="outline"
              >
                Check User Info
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/user/sync', { method: 'POST' })
                    const data = await response.json()
                    console.log('User sync result:', data)
                    if (data.success) {
                      alert('User synced successfully. Please refresh the page.')
                      window.location.reload()
                    } else {
                      alert(`User sync failed: ${data.error}`)
                    }
                  } catch (err) {
                    console.error('Error syncing user:', err)
                    alert('Error syncing user')
                  }
                }}
                variant="outline"
              >
                Sync User with Database
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/user/promote-admin', { method: 'POST' })
                    const data = await response.json()
                    console.log('Admin promotion result:', data)
                    if (data.success) {
                      alert('User promoted to admin successfully. Please refresh the page.')
                      window.location.reload()
                    } else {
                      alert(`Admin promotion failed: ${data.error}`)
                    }
                  } catch (err) {
                    console.error('Error promoting to admin:', err)
                    alert('Error promoting to admin')
                  }
                }}
                variant="outline"
              >
                Promote to Admin (Dev)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          icon={Users}
          value={stats?.totalUsers.toLocaleString()}
          subtext={
            stats ? (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                +{stats.monthlyGrowth}% from last month
              </span>
            ) : null
          }
          isLoading={statsLoading}
        />
        <MetricCard
          title="Active Artisans"
          icon={Hammer}
          value={stats?.totalArtisans.toLocaleString()}
          subtext={stats ? `${stats.activeSubscriptions} with active subscriptions` : null}
          isLoading={statsLoading}
        />
        <MetricCard
          title="Monthly Revenue"
          icon={DollarSign}
          value={stats ? `KSh ${stats.monthlyRevenue.toLocaleString()}` : undefined}
          subtext="From M-Pesa subscriptions"
          isLoading={statsLoading}
        />
        <MetricCard
          title="Pending Approvals"
          icon={AlertTriangle}
          value={stats?.pendingVerifications}
          subtext="Require immediate attention"
          isLoading={statsLoading}
        />
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Real-time platform performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <HealthRow
              label="System Uptime"
              value={stats ? `${stats.systemUptime}%` : '-'}
              icon={<CheckCircle className="w-4 h-4 text-green-500" />}
              isLoading={statsLoading}
            />
            <HealthRow
              label="Average Response Time"
              value={monitoring ? `${monitoring.systemHealth.api.responseTime}ms` : '-'}
              isLoading={monitoringLoading}
            />
            <HealthRow
              label="Error Rate"
              value={monitoring ? `${(monitoring.systemHealth.server.cpuUsage ?? 0).toFixed(1)}% CPU` : '-'}
              isLoading={monitoringLoading}
            />
            <HealthRow
              label="Server Memory"
              value={monitoring ? `${monitoring.systemHealth.server.memoryUsage}%` : '-'}
              isLoading={monitoringLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events and user actions</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {/* New artisans — link to artisans page */}
            <Link
              href="/admin-dashboard/artisans"
              className="flex items-center gap-3 py-3 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">New artisan registrations</p>
                <p className="text-xs text-muted-foreground">Review and manage new joiners</p>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">artisans</Badge>
            </Link>

            {/* Pending verifications — link to verification page */}
            <Link
              href="/admin-dashboard/artisans?tab=pending"
              className="flex items-center gap-3 py-3 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium leading-tight">
                  {statsLoading ? (
                    <Skeleton className="h-3.5 w-32 inline-block" />
                  ) : (
                    <>{stats?.pendingVerifications ?? 0} pending verifications</>
                  )}
                </span>
                <p className="text-xs text-muted-foreground">Awaiting your review</p>
              </div>
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 flex-shrink-0">verify</Badge>
            </Link>

            {/* Subscriptions — link to subscriptions page */}
            <Link
              href="/admin-dashboard/subscriptions"
              className="flex items-center gap-3 py-3 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">Subscription activity</p>
                <p className="text-xs text-muted-foreground">Active plans and renewals</p>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">subscriptions</Badge>
            </Link>

            {/* Users — link to users page */}
            <Link
              href="/admin-dashboard/users"
              className="flex items-center gap-3 py-3 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">Platform users</p>
                <p className="text-xs text-muted-foreground">Clients, artisans, and admins</p>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">users</Badge>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Tasks</CardTitle>
          <CardDescription>Administrative tasks and reviews requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : systemTasks ? (
            <AdminTasksTable 
              pendingVerifications={systemTasks.pendingVerifications}
              recentActivity={systemTasks.recentActivity}
              systemAlerts={systemTasks.systemAlerts}
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">No tasks available</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Latest 5 user registrations and activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usersLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <UserRowSkeleton key={i} />
            ))
          ) : recentUsers && recentUsers.length > 0 ? (
            recentUsers.map((user) => (
              <UserRow key={user.id} user={user} />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent users</p>
          )}
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>Platform management and oversight tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/admin-dashboard/users">
                <Users className="w-6 h-6" />
                User Management
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/admin-dashboard/verification">
                <Shield className="w-6 h-6" />
                Verify Artisans
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/admin-dashboard/subscriptions">
                <DollarSign className="w-6 h-6" />
                Subscriptions
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/admin-dashboard/settings">
                <Settings className="w-6 h-6" />
                System Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
