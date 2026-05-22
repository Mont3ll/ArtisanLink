'use client'

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileCompletion } from "./profile-completion"
import { useArtisanDashboard } from "@/lib/hooks"
import { 
  Star, 
  MessageSquare, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Hammer,
  Briefcase,
  Clock,
  XCircle,
  Shield,
  ArrowRight
} from "lucide-react"

// Metric card with skeleton support
function MetricCard({
  title,
  icon: Icon,
  value,
  subtext,
  isLoading,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  value?: React.ReactNode
  subtext: string
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
          <Skeleton className="h-8 w-20 mb-1" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <div className="text-xs text-muted-foreground">
          {isLoading ? <Skeleton className="h-3 w-24" /> : subtext}
        </div>
      </CardContent>
    </Card>
  )
}

// Verification status banner
function VerificationBanner({ status, rejectionReason }: { status: string | null | undefined; rejectionReason?: string | null }) {
  if (status === 'VERIFIED') return null

  if (status === 'REJECTED') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-red-800 dark:text-red-200">Verification Rejected</h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              Your profile verification was not approved. You will not appear in search results
              or receive job requests until you are verified.
            </p>
            {rejectionReason && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                <span className="font-medium">Reason:</span> {rejectionReason}
              </p>
            )}
            <div className="pt-2">
              <Link href="/artisan-dashboard/settings">
                <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900">
                  <Shield className="mr-2 h-4 w-4" />
                  Update & Resubmit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // PENDING or null (not yet submitted)
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200">Verification Pending</h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {status === 'PENDING'
              ? 'Your profile is under review by our team. You will not appear in search results or receive job requests until your verification is approved.'
              : 'Please upload your certificate and ID document to start the verification process. You will not appear in search results until verified.'}
          </p>
          <div className="pt-2">
            <Link href="/artisan-dashboard/settings?tab=verification">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900">
                <Shield className="mr-2 h-4 w-4" />
                {status === 'PENDING' ? 'View Verification Status' : 'Start Verification'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Activity item skeleton
function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

export function ArtisanDashboardContent() {
  const { data, isLoading, error } = useArtisanDashboard()

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Error: {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const stats = data?.stats
  const recentActivity = data?.recentActivity ?? []
  const profile = data?.profile
  const user = data?.user

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
              <p className="text-muted-foreground">
                Here&apos;s your artisan dashboard overview
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </>
          ) : (
            <>
              {stats?.isVerified ? (
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
              <Badge variant={stats?.isAvailable ? "default" : "secondary"}>
                {stats?.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Verification Status Banner */}
      {!isLoading && (
        <VerificationBanner 
          status={profile?.artisanStatus} 
          rejectionReason={profile?.rejectionReason} 
        />
      )}

      {/* Profile Completion */}
      {profile && <ProfileCompletion profile={profile} />}
      {isLoading && !profile && <Skeleton className="h-24 w-full" />}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Profile Views"
          icon={Eye}
          value={stats?.profileViews}
          subtext="This month"
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Projects"
          icon={Hammer}
          value={stats?.totalProjects}
          subtext="Portfolio items"
          isLoading={isLoading}
        />
        <MetricCard
          title="Average Rating"
          icon={Star}
          value={
            stats ? (
              <span className="flex items-center gap-1">
                {stats.averageRating.toFixed(1)}
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </span>
            ) : undefined
          }
          subtext={stats ? `${stats.totalReviews} reviews` : "Loading..."}
          isLoading={isLoading}
        />
        <MetricCard
          title="Messages"
          icon={MessageSquare}
          value={stats?.unreadMessages}
          subtext="Unread messages"
          isLoading={isLoading}
        />
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
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <Badge variant={stats?.subscriptionStatus === 'ACTIVE' ? "default" : "destructive"}>
                  {stats?.subscriptionStatus ?? 'Unknown'}
                </Badge>
              )}
            </div>
            {(isLoading || stats?.subscriptionEndDate) && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expires</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <span className="text-sm">
                    {stats?.subscriptionEndDate 
                      ? new Date(stats.subscriptionEndDate).toLocaleDateString() 
                      : '-'}
                  </span>
                )}
              </div>
            )}
            <Button className="w-full" disabled={isLoading}>
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
            <Link href="/artisan-dashboard/messages">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                View Messages
                {!isLoading && stats && stats.unreadMessages > 0 && (
                  <Badge className="ml-auto">{stats.unreadMessages}</Badge>
                )}
                {isLoading && <Skeleton className="ml-auto h-5 w-8" />}
              </Button>
            </Link>
            <Link href="/artisan-dashboard/portfolio/new">
              <Button variant="outline" className="w-full justify-start">
                <Hammer className="mr-2 h-4 w-4" />
                Add Portfolio Item
              </Button>
            </Link>
            <Link href="/artisan-dashboard/portfolio">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="mr-2 h-4 w-4" />
                View Portfolio
              </Button>
            </Link>
            <Link href="/artisan-dashboard/settings">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Update Settings
              </Button>
            </Link>
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
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <ActivitySkeleton key={i} />
            ))
          ) : recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  {activity.icon === 'message' && <MessageSquare className="w-4 h-4 text-emerald-600" />}
                  {activity.icon === 'star' && <Star className="w-4 h-4 text-yellow-600" />}
                  {activity.icon === 'eye' && <Eye className="w-4 h-4 text-green-600" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
