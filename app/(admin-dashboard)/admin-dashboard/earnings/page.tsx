'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TrendingUp,
  DollarSign,
  Percent,
  Sparkles,
  Award,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useAdminEarnings,
  formatEarningsCurrency,
  formatEarningsDate,
  formatEarningsDateShort,
  formatPercentage,
  getEarningArtisanName,
  getEarningClientName,
  getDailyEarningsArray,
  type EarningsFilters,
  type EarningsStatistics,
} from '@/lib/hooks/use-admin-earnings'

// Skeleton components
function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-28 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

function ChartBarSkeleton() {
  return (
    <div className="flex items-end gap-1 h-32">
      {[...Array(14)].map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1"
          style={{ height: `${Math.random() * 80 + 20}%` }}
        />
      ))}
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
    </TableRow>
  )
}

// Summary cards component
function EarningsSummary({
  statistics,
  isLoading,
}: {
  statistics: EarningsStatistics | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const total = statistics?.total || { commissionAmount: 0, jobValue: 0, count: 0, effectiveRate: 0 }
  const promotional = statistics?.promotional || { commissionAmount: 0, count: 0 }
  const standard = statistics?.standard || { commissionAmount: 0, count: 0 }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatEarningsCurrency(total.commissionAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            From {total.count} completed jobs
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Job Value Processed</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatEarningsCurrency(total.jobValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total transaction volume
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Effective Rate</CardTitle>
          <Percent className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {total.effectiveRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Average commission rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rate Distribution</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-600" />
              <span className="text-sm font-medium">{promotional.count}</span>
              <span className="text-xs text-muted-foreground">promo</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3 text-green-600" />
              <span className="text-sm font-medium">{standard.count}</span>
              <span className="text-xs text-muted-foreground">standard</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            5% vs 10% commission jobs
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Daily earnings chart
function DailyEarningsChart({
  daily,
  isLoading,
}: {
  daily: Record<string, { total: number; promotional: number; standard: number }> | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Earnings (Last 30 Days)</CardTitle>
          <CardDescription>Commission earned per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartBarSkeleton />
        </CardContent>
      </Card>
    )
  }

  const dailyArray = daily ? getDailyEarningsArray(daily) : []
  
  if (dailyArray.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Earnings (Last 30 Days)</CardTitle>
          <CardDescription>Commission earned per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No earnings data</h3>
            <p className="text-sm text-muted-foreground">
              Earnings will appear here as jobs are completed
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...dailyArray.map(d => d.total), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Earnings (Last 30 Days)</CardTitle>
        <CardDescription>Commission earned per day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple bar chart */}
          <div className="flex items-end gap-1 h-40">
            {dailyArray.slice(-14).map((day) => {
              const heightPercent = (day.total / maxValue) * 100
              const promotionalPercent = day.total > 0 ? (day.promotional / day.total) * 100 : 0
              
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
                  title={`${formatEarningsDateShort(day.date)}: ${formatEarningsCurrency(day.total)}`}
                >
                  <div
                    className="w-full rounded-t relative overflow-hidden bg-green-500/20"
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  >
                    {/* Standard portion */}
                    <div
                      className="absolute bottom-0 w-full bg-green-500"
                      style={{ height: `${100 - promotionalPercent}%` }}
                    />
                    {/* Promotional portion */}
                    <div
                      className="absolute top-0 w-full bg-purple-500"
                      style={{ height: `${promotionalPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-2 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-xs text-muted-foreground">Standard (10%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-xs text-muted-foreground">Promotional (5%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Commission breakdown cards
function CommissionBreakdown({
  promotional,
  standard,
  isLoading,
}: {
  promotional: { commissionAmount: number; count: number } | undefined
  standard: { commissionAmount: number; count: number } | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const promoData = promotional || { commissionAmount: 0, count: 0 }
  const stdData = standard || { commissionAmount: 0, count: 0 }
  const totalJobs = promoData.count + stdData.count
  const promoPercent = totalJobs > 0 ? (promoData.count / totalJobs) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Promotional Rate (5%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatEarningsCurrency(promoData.commissionAmount)}
          </div>
          <p className="text-sm text-muted-foreground">
            {promoData.count} jobs ({promoPercent.toFixed(1)}% of total)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            New artisans (first 5 jobs)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Award className="h-4 w-4 text-green-600" />
            Standard Rate (10%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatEarningsCurrency(stdData.commissionAmount)}
          </div>
          <p className="text-sm text-muted-foreground">
            {stdData.count} jobs ({(100 - promoPercent).toFixed(1)}% of total)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Established artisans
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Main page component
export default function EarningsPage() {
  const [page, setPage] = useState(1)
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date()
    let startDate: string | undefined

    switch (dateFilter) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
        break
      default:
        startDate = undefined
    }

    return { startDate }
  }, [dateFilter])

  // Build filters
  const filters: EarningsFilters = useMemo(() => ({
    page,
    limit: 20,
    startDate: dateRange.startDate,
  }), [page, dateRange.startDate])

  const { data, isLoading, error, refetch } = useAdminEarnings(filters)

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Failed to load earnings</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Please try again'}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Earnings</h1>
          <p className="text-muted-foreground">
            Commission revenue from completed jobs
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date filter */}
          <div className="flex items-center rounded-lg border p-1">
            {(['7d', '30d', '90d', 'all'] as const).map((period) => (
              <Button
                key={period}
                variant={dateFilter === period ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setDateFilter(period)
                  setPage(1)
                }}
                className="px-3"
              >
                {period === 'all' ? 'All Time' : period}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <EarningsSummary statistics={data?.statistics} isLoading={isLoading} />

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyEarningsChart daily={data?.statistics?.daily} isLoading={isLoading} />
        </div>
        <div>
          <CommissionBreakdown
            promotional={data?.statistics?.promotional}
            standard={data?.statistics?.standard}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Earnings table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>Commission from completed jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Artisan</TableHead>
                <TableHead className="text-right">Job Value</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : !data?.earnings || data.earnings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No earnings yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Earnings will appear here when jobs are completed
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                data.earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell className="font-medium">
                      {formatEarningsDate(earning.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{earning.job.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {getEarningClientName(earning)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getEarningArtisanName(earning)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatEarningsCurrency(earning.jobValue)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      +{formatEarningsCurrency(earning.commissionAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          earning.isPromotional
                            ? 'border-purple-500 text-purple-600'
                            : 'border-green-500 text-green-600'
                        )}
                      >
                        {earning.isPromotional ? (
                          <Sparkles className="h-3 w-3 mr-1" />
                        ) : (
                          <Award className="h-3 w-3 mr-1" />
                        )}
                        {formatPercentage(earning.commissionRate)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} earnings
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
