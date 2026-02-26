'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Eye, 
  MessageSquare, 
  Star, 
  TrendingUp,
  Users,
  Briefcase,
  RefreshCw,
  AlertTriangle,
  Calendar
} from 'lucide-react'
import {
  useArtisanAnalytics,
  getRatingDistribution,
  type ArtisanAnalyticsReview,
} from '@/lib/hooks/use-artisan-analytics'

// Star rating renderer
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

// Stats card with skeleton
function StatCard({
  title,
  icon: Icon,
  value,
  subtitle,
  isLoading,
  trend,
}: {
  title: string
  icon: React.ElementType
  value: React.ReactNode
  subtitle?: React.ReactNode
  isLoading: boolean
  trend?: 'up' | 'down' | null
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold flex items-center gap-2">
              {value}
            </div>
            {subtitle && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                {subtitle}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Rating distribution component
function RatingDistribution({ 
  reviews, 
  isLoading 
}: { 
  reviews: ArtisanAnalyticsReview[] | undefined
  isLoading: boolean 
}) {
  const distribution = getRatingDistribution(reviews)
  const total = reviews?.length || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Distribution</CardTitle>
        <CardDescription>Breakdown of your client ratings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </>
        ) : (
          <>
            {[5, 4, 3, 2, 1].map(rating => {
              const count = distribution[rating - 1]
              const percentage = total > 0 ? (count / total) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-24">
                    <RatingStars rating={rating} />
                  </div>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm text-muted-foreground">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              )
            })}
            
            {total === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No reviews yet</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Recent reviews component
function RecentReviews({ 
  reviews, 
  isLoading 
}: { 
  reviews: ArtisanAnalyticsReview[] | undefined
  isLoading: boolean 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
        <CardDescription>Latest feedback from your clients</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20 mt-2" />
              </div>
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.slice(0, 5).map(review => (
              <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm">
                      {review.client.firstName} {review.client.lastName}
                    </span>
                  </div>
                  <RatingStars rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No reviews yet</p>
            <p className="text-sm">Complete projects to receive client reviews</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Performance tips component
function PerformanceTips({ 
  stats, 
  isLoading 
}: { 
  stats: { 
    totalProjects: number
    totalSpecializations: number
    averageRating: number
    totalReviews: number
    unreadMessages: number
  } | undefined
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
          <CardDescription>Suggestions to improve your profile visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const tips = []

  if (stats.totalProjects < 5) {
    tips.push(
      <div key="portfolio" className="p-4 bg-emerald-50 rounded-lg">
        <Briefcase className="h-6 w-6 text-emerald-600 mb-2" />
        <h4 className="font-medium text-emerald-900">Add More Portfolio Items</h4>
        <p className="text-sm text-emerald-700">
          Profiles with 5+ portfolio items get 40% more inquiries
        </p>
      </div>
    )
  }
  
  if (stats.totalSpecializations < 3) {
    tips.push(
      <div key="specializations" className="p-4 bg-green-50 rounded-lg">
        <Star className="h-6 w-6 text-green-600 mb-2" />
        <h4 className="font-medium text-green-900">Add Specializations</h4>
        <p className="text-sm text-green-700">
          List at least 3 skills to appear in more search results
        </p>
      </div>
    )
  }
  
  if (stats.averageRating < 4 && stats.totalReviews > 0) {
    tips.push(
      <div key="rating" className="p-4 bg-yellow-50 rounded-lg">
        <TrendingUp className="h-6 w-6 text-yellow-600 mb-2" />
        <h4 className="font-medium text-yellow-900">Improve Your Rating</h4>
        <p className="text-sm text-yellow-700">
          Respond quickly to inquiries to boost client satisfaction
        </p>
      </div>
    )
  }

  if (stats.unreadMessages > 0) {
    tips.push(
      <div key="messages" className="p-4 bg-orange-50 rounded-lg">
        <MessageSquare className="h-6 w-6 text-orange-600 mb-2" />
        <h4 className="font-medium text-orange-900">Respond to Messages</h4>
        <p className="text-sm text-orange-700">
          You have {stats.unreadMessages} unread message{stats.unreadMessages > 1 ? 's' : ''}
        </p>
      </div>
    )
  }

  if (stats.totalProjects >= 5 && stats.totalSpecializations >= 3 && stats.averageRating >= 4) {
    tips.push(
      <div key="great" className="p-4 bg-purple-50 rounded-lg col-span-full">
        <Badge className="bg-purple-500 mb-2">Great Progress!</Badge>
        <h4 className="font-medium text-purple-900">Your Profile is Performing Well</h4>
        <p className="text-sm text-purple-700">
          Keep up the good work! Consider asking satisfied clients for reviews.
        </p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Tips</CardTitle>
        <CardDescription>Suggestions to improve your profile visibility</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.length > 0 ? tips : (
            <p className="text-muted-foreground col-span-full text-center py-4">
              No tips at the moment. Keep up the great work!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const { data, isLoading, error, refetch } = useArtisanAnalytics()

  if (error) {
    return (
      <div className="flex-1 p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <div>
                <h2 className="text-lg font-semibold text-red-800">Error Loading Analytics</h2>
                <p className="text-red-700">{error.message}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = data?.stats
  const profile = data?.profile

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance and client engagement
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Profile Views"
          icon={Eye}
          value={stats?.profileViews || 0}
          subtitle="This month"
          trend="up"
          isLoading={isLoading}
        />
        <StatCard
          title="Client Inquiries"
          icon={MessageSquare}
          value={stats?.totalConversations || 0}
          subtitle={`${stats?.newConversationsThisMonth || 0} new this month`}
          isLoading={isLoading}
        />
        <StatCard
          title="Average Rating"
          icon={Star}
          value={
            <>
              {(stats?.averageRating || 0).toFixed(1)}
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </>
          }
          subtitle={`Based on ${stats?.totalReviews || 0} reviews`}
          isLoading={isLoading}
        />
        <StatCard
          title="Portfolio Items"
          icon={Briefcase}
          value={stats?.totalProjects || 0}
          subtitle={`${stats?.totalSpecializations || 0} specializations`}
          isLoading={isLoading}
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RatingDistribution reviews={profile?.reviews} isLoading={isLoading} />
        <RecentReviews reviews={profile?.reviews} isLoading={isLoading} />
      </div>

      {/* Performance Tips */}
      <PerformanceTips stats={stats} isLoading={isLoading} />
    </div>
  )
}
