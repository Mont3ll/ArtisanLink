'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Star, 
  MessageSquare, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Hammer,
  Loader2
} from "lucide-react"

// Types for API responses
interface ArtisanStats {
  profileViews: number
  totalProjects: number
  totalReviews: number
  averageRating: number
  unreadMessages: number
  subscriptionStatus: string
  subscriptionEndDate?: string
  isVerified: boolean
  isAvailable: boolean
}

interface RecentActivity {
  id: number
  type: string
  title: string
  description: string
  timestamp: string
  icon: string
}

interface ArtisanData {
  stats: ArtisanStats
  recentActivity: RecentActivity[]
  profile: object
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

export function ArtisanDashboardContent() {
  const [data, setData] = useState<ArtisanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch('/api/artisan/stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch artisan data')
        }

        const artisanData = await response.json()
        setData(artisanData)
      } catch (err) {
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
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>No data available</p>
      </div>
    )
  }

  const { stats, recentActivity, user } = data

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.firstName}!</h1>
          <p className="text-muted-foreground">
            Here&apos;s your artisan dashboard overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.isVerified ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Pending Verification
            </Badge>
          )}
          <Badge variant={stats.isAvailable ? "default" : "secondary"}>
            {stats.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.profileViews}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Hammer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Portfolio items</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.averageRating.toFixed(1)}
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your current subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={stats.subscriptionStatus === 'ACTIVE' ? "default" : "destructive"}>
                {stats.subscriptionStatus}
              </Badge>
            </div>
            {stats.subscriptionEndDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expires</span>
                <span className="text-sm">
                  {new Date(stats.subscriptionEndDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <Button className="w-full">
              <DollarSign className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your artisan profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              View Messages
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Hammer className="mr-2 h-4 w-4" />
              Add Portfolio Item
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="mr-2 h-4 w-4" />
              Preview Profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Update Availability
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest platform activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                {activity.icon === 'message' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                {activity.icon === 'star' && <Star className="w-4 h-4 text-yellow-600" />}
                {activity.icon === 'eye' && <Eye className="w-4 h-4 text-green-600" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.description}</p>
                <p className="text-xs text-gray-400">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
