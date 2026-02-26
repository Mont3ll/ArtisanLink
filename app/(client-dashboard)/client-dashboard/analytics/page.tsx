'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Briefcase,
  DollarSign,
  CheckCircle2,
  XCircle,
  Star,
  Heart,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Calendar,
  BarChart3,
} from 'lucide-react'
import {
  useClientAnalytics,
  formatClientCurrency,
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
} from '@/lib/hooks/use-client-analytics'

// Stat card component
function StatCard({
  title,
  icon: Icon,
  value,
  subtitle,
  isLoading,
}: {
  title: string
  icon: React.ElementType
  value: React.ReactNode
  subtitle?: React.ReactNode
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
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Job status breakdown component
function StatusBreakdown({
  breakdown,
  totalJobs,
  isLoading,
}: {
  breakdown: Record<string, number> | undefined
  totalJobs: number
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Status Breakdown</CardTitle>
        <CardDescription>Distribution of your jobs by status</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : breakdown && Object.keys(breakdown).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(breakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => {
                const percentage = totalJobs > 0 ? (count / totalJobs) * 100 : 0
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-28 text-sm font-medium truncate">
                      {JOB_STATUS_LABELS[status] || status}
                    </div>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${JOB_STATUS_COLORS[status] || 'bg-gray-400'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm text-muted-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No jobs yet</p>
            <p className="text-sm">Create a job request to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Spending by category component
function CategorySpending({
  spending,
  isLoading,
}: {
  spending: Record<string, number> | undefined
  isLoading: boolean
}) {
  const entries = spending ? Object.entries(spending).sort(([, a], [, b]) => b - a) : []
  const maxAmount = entries.length > 0 ? entries[0][1] : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Where your budget goes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map(([category, amount]) => {
              const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0
              return (
                <div key={category} className="flex items-center gap-3">
                  <div className="w-28 text-sm font-medium truncate" title={category}>
                    {category}
                  </div>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-24 text-right text-sm font-medium">
                    {formatClientCurrency(amount)}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No spending data yet</p>
            <p className="text-sm">Completed jobs will show spending breakdown</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Spending trend component
function SpendingTrend({
  trend,
  isLoading,
}: {
  trend: { month: string; amount: number }[] | undefined
  isLoading: boolean
}) {
  const maxAmount = trend
    ? Math.max(...trend.map(t => t.amount), 1)
    : 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trend</CardTitle>
        <CardDescription>Monthly spending over time</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-end gap-4 h-40">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="flex-1 h-full" />
            ))}
          </div>
        ) : trend && trend.length > 0 ? (
          <div className="flex items-end gap-3 h-40">
            {trend.map((item, idx) => {
              const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.amount > 0 ? formatClientCurrency(item.amount) : '-'}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-emerald-500 rounded-t-md transition-all duration-500 min-h-[4px]"
                      style={{ height: `${Math.max(height, 3)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No spending data</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ClientAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const { data, isLoading, error, refetch } = useClientAnalytics(timeRange)

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

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Analytics</h1>
          <p className="text-muted-foreground">
            Track your jobs, spending, and activity
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
          title="Total Jobs"
          icon={Briefcase}
          value={stats?.totalJobs ?? 0}
          subtitle={`${stats?.activeJobs ?? 0} active`}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Spent"
          icon={DollarSign}
          value={formatClientCurrency(stats?.totalSpent ?? 0)}
          subtitle={`Avg ${formatClientCurrency(stats?.averageJobValue ?? 0)} per job`}
          isLoading={isLoading}
        />
        <StatCard
          title="Completed"
          icon={CheckCircle2}
          value={stats?.completedJobs ?? 0}
          subtitle={
            stats && stats.totalJobs > 0
              ? `${((stats.completedJobs / stats.totalJobs) * 100).toFixed(0)}% completion rate`
              : 'No jobs yet'
          }
          isLoading={isLoading}
        />
        <StatCard
          title="Reviews Given"
          icon={Star}
          value={stats?.reviewsGiven ?? 0}
          subtitle={`${stats?.savedArtisans ?? 0} saved artisans`}
          isLoading={isLoading}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Conversations"
          icon={MessageSquare}
          value={stats?.conversationsStarted ?? 0}
          subtitle="Started in this period"
          isLoading={isLoading}
        />
        <StatCard
          title="Saved Artisans"
          icon={Heart}
          value={stats?.savedArtisans ?? 0}
          subtitle="Across all time"
          isLoading={isLoading}
        />
        <StatCard
          title="Cancelled / Declined"
          icon={XCircle}
          value={stats?.cancelledJobs ?? 0}
          subtitle={
            stats && stats.totalJobs > 0
              ? `${((stats.cancelledJobs / stats.totalJobs) * 100).toFixed(0)}% of jobs`
              : 'No cancelled jobs'
          }
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusBreakdown
          breakdown={data?.statusBreakdown}
          totalJobs={stats?.totalJobs ?? 0}
          isLoading={isLoading}
        />
        <CategorySpending
          spending={data?.categorySpending}
          isLoading={isLoading}
        />
      </div>

      {/* Spending Trend */}
      <SpendingTrend
        trend={data?.spendingTrend}
        isLoading={isLoading}
      />
    </div>
  )
}
