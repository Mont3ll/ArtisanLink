'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { 
  MessageSquare, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  Heart,
  Search,
  TrendingUp,
  CheckCircle,
  Loader2,
  User
} from "lucide-react"

// Types for API responses
interface ClientStats {
  activeProjects: number
  completedProjects: number
  savedArtisans: number
  unreadMessages: number
  totalSpent: number
}

interface RecentActivity {
  id: number
  type: string
  title: string
  description: string
  timestamp: string
  icon: string
}

interface RecommendedArtisan {
  id: string
  name: string
  profession: string
  location: string
  rating: number
  totalReviews: number
  hourlyRate: number
  featuredWork?: {
    title: string
    imageUrl: string
  }
}

interface ClientData {
  stats: ClientStats
  recentActivity: RecentActivity[]
  recommendedArtisans: RecommendedArtisan[]
}

export function ClientDashboardContent() {
  const [data, setData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        const response = await fetch('/api/client/stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch client data')
        }

        const clientData = await response.json()
        setData(clientData)
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

  const { stats, recentActivity, recommendedArtisans } = data

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-600" />
      case 'user': return <User className="w-4 h-4 text-green-600" />
      case 'heart': return <Heart className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Find Skilled Artisans
          </h1>
          <p className="text-gray-600">
            Connect with verified craftspeople for your projects
          </p>
        </div>
        <Button size="lg" className="mt-4 lg:mt-0">
          <Search className="mr-2 h-4 w-4" />
          Browse Artisans
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Artisans</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savedArtisans}</div>
            <p className="text-xs text-muted-foreground">In favorites</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Unread</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {getActivityIcon(activity.icon)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No recent activity</p>
                <p className="text-xs">Start browsing artisans to see activity here</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Summary</CardTitle>
            <CardDescription>Your project statistics and spending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Spent</span>
              <span className="text-lg font-bold">
                KSh {stats.totalSpent.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Project Cost</span>
              <span className="text-sm">
                KSh {stats.completedProjects > 0 ? 
                  (stats.totalSpent / stats.completedProjects).toLocaleString() : 
                  '0'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Conversations</span>
              <span className="text-sm">{stats.activeProjects}</span>
            </div>
            <div className="pt-2">
              <Button variant="outline" className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Artisans */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Artisans</CardTitle>
          <CardDescription>Top-rated artisans that match your interests</CardDescription>
        </CardHeader>
        <CardContent>
          {recommendedArtisans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedArtisans.map((artisan) => (
                <div key={artisan.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {artisan.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{artisan.name}</h3>
                      <p className="text-sm text-gray-600">{artisan.profession}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {artisan.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{artisan.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({artisan.totalReviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>KSh {artisan.hourlyRate}/hr</span>
                    </div>
                  </div>

                  {artisan.featuredWork && (
                    <div className="mb-3">
                      <Image 
                        src={artisan.featuredWork.imageUrl} 
                        alt={artisan.featuredWork.title}
                        width={300}
                        height={128}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      <p className="text-xs text-gray-600 mt-1">{artisan.featuredWork.title}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Profile
                    </Button>
                    <Button size="sm" className="flex-1">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Contact
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No artisan recommendations yet</p>
              <p className="text-xs">Browse artisans to get personalized recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Search className="w-6 h-6" />
              Find Artisans
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MessageSquare className="w-6 h-6" />
              My Messages
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Heart className="w-6 h-6" />
              Saved Artisans
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Star className="w-6 h-6" />
              Leave Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
