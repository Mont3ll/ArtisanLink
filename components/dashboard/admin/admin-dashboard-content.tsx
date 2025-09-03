'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminTasksTable } from "./admin-tasks-table"
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
  Loader2
} from "lucide-react"

// Types for API responses
interface SystemStats {
  totalUsers: number
  totalArtisans: number
  activeArtisans: number
  pendingVerifications: number
  activeSubscriptions: number
  monthlyRevenue: number
  monthlyGrowth: number
  systemUptime: number
  totalReviews: number
}

interface SystemTask {
  pendingVerifications: Array<{
    id: string
    name: string
    email: string
    profession: string
    location: string
    submittedAt: string
    certificateUrl?: string
  }>
  recentActivity: Array<{
    id: string
    type: 'user_joined' | 'subscription_paid' | 'review_submitted' | 'message_sent'
    description: string
    user: string
    timestamp: string
    status: 'completed' | 'pending' | 'failed'
  }>
  systemAlerts: Array<{
    id: string
    title: string
    type: 'error' | 'warning' | 'info'
    description: string
    timestamp: string
    resolved: boolean
  }>
}

interface UserData {
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

export function AdminDashboardContent() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [systemTasks, setSystemTasks] = useState<SystemTask | null>(null)
  const [recentUsers, setRecentUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching admin dashboard data...')
        
        // Fetch all data in parallel
        const [statsRes, tasksRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/tasks'),
          fetch('/api/admin/users')
        ])

        console.log('Response statuses:', {
          stats: statsRes.status,
          tasks: tasksRes.status,
          users: usersRes.status
        })

        // Check each response individually for better error reporting
        if (!statsRes.ok) {
          const errorData = await statsRes.json()
          throw new Error(`Stats API failed: ${errorData.error || statsRes.statusText}`)
        }
        
        if (!tasksRes.ok) {
          const errorData = await tasksRes.json()
          throw new Error(`Tasks API failed: ${errorData.error || tasksRes.statusText}`)
        }
        
        if (!usersRes.ok) {
          const errorData = await usersRes.json()
          throw new Error(`Users API failed: ${errorData.error || usersRes.statusText}`)
        }

        const [statsData, tasksData, usersData] = await Promise.all([
          statsRes.json(),
          tasksRes.json(),
          usersRes.json()
        ])

        console.log('Fetched data:', { statsData, tasksData, usersData })

        setStats(statsData)
        setSystemTasks(tasksData)
        setRecentUsers(usersData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">{error}</p>
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

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              +{stats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Artisans</CardTitle>
            <Hammer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArtisans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions} with active subscriptions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From M-Pesa subscriptions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Real-time platform performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Uptime</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold">{stats.systemUptime}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Response Time</span>
              <span className="text-sm font-bold">245ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Error Rate</span>
              <span className="text-sm font-bold">0.02%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Connections</span>
              <span className="text-sm font-bold">1,847</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events and user actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">New artisan registration</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Recent registrations</span>
                  <Badge variant="outline" className="text-xs">artisan</Badge>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Kenya
                  </div>
                </div>
                <p className="text-xs text-gray-400">Today</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Pending verifications</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{stats.pendingVerifications} pending</span>
                  <Badge variant="outline" className="text-xs">verification</Badge>
                </div>
                <p className="text-xs text-gray-400">Awaiting review</p>
              </div>
            </div>
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
          {systemTasks ? (
            <AdminTasksTable 
              pendingVerifications={systemTasks.pendingVerifications}
              recentActivity={systemTasks.recentActivity}
              systemAlerts={systemTasks.systemAlerts}
            />
          ) : (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
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
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
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
          ))}
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
              <a href="/admin-dashboard/users">
                <Users className="w-6 h-6" />
                User Management
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <a href="/admin-dashboard/verification">
                <Shield className="w-6 h-6" />
                Verify Artisans
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <a href="/admin-dashboard/subscriptions">
                <DollarSign className="w-6 h-6" />
                Subscriptions
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <a href="/admin-dashboard/settings">
                <Settings className="w-6 h-6" />
                System Settings
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
