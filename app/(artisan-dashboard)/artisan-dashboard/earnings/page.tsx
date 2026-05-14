'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useArtisanEarnings,
  formatCurrency as formatEarningsCurrency,
  formatPayoutDate,
  getPayoutStatusColor,
  getPayoutTypeLabel,
  type EarningsPayout,
  type EarningsStatistics,
  type RecentPayout,
} from '@/lib/hooks/use-artisan-earnings'

const STATUS_ICONS = {
  PENDING: Clock,
  PROCESSING: RefreshCw,
  COMPLETED: CheckCircle2,
  FAILED: XCircle,
  CANCELLED: AlertCircle,
}

// Format currency for display
function formatKES(amount: number): string {
  return formatEarningsCurrency(amount)
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
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cash-only mode notice */}
      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
        <div className="flex items-start gap-2">
          <span className="text-amber-600 text-lg">ℹ️</span>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Cash-Only Payments During Testing Phase</p>
            <p className="text-amber-700 dark:text-amber-300 text-sm mt-0.5">
              All client payments are currently handled in cash directly. This earnings dashboard tracks your recorded earnings history.
              Automated M-Pesa payouts will be re-enabled after the testing phase.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatKES(statistics?.totalEarnings?.amount || 0)}</div>
          <p className="text-xs text-muted-foreground">
            {statistics?.totalEarnings?.count || 0} payouts completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatKES(statistics?.thisMonth?.amount || 0)}</div>
          <p className="text-xs text-muted-foreground">
            {statistics?.thisMonth?.count || 0} jobs this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatKES(statistics?.pendingPayouts?.amount || 0)}</div>
          <p className="text-xs text-muted-foreground">
            {statistics?.pendingPayouts?.count || 0} awaiting processing
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
          {statistics?.commission?.isPromotional ? (
            <Sparkles className="h-4 w-4 text-purple-600" />
          ) : (
            <Award className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {((statistics?.commission?.currentRate || 0.10) * 100).toFixed(0)}%
          </div>
          {statistics?.commission?.isPromotional ? (
            <p className="text-xs text-purple-600">
              Promotional rate! {statistics.commission.remainingPromotionalJobs} jobs left
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Standard rate</p>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  )
}

// Commission progress card
function CommissionProgress({
  commission,
  isLoading,
}: {
  commission: {
    currentRate: number
    isPromotional: boolean
    remainingPromotionalJobs: number
    completedJobCount: number
  } | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    )
  }

  const completedJobs = commission?.completedJobCount || 0
  const promotionalThreshold = 5
  const progress = Math.min((completedJobs / promotionalThreshold) * 100, 100)
  const isPromotional = commission?.isPromotional ?? true

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPromotional ? (
            <>
              <Sparkles className="h-5 w-5 text-purple-600" />
              Promotional Rate Active
            </>
          ) : (
            <>
              <Award className="h-5 w-5 text-green-600" />
              Standard Rate Achieved
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isPromotional ? (
            <>
              You&apos;re enjoying our 5% promotional commission rate! Complete{' '}
              {commission?.remainingPromotionalJobs || 0} more jobs to reach the standard 10% rate.
            </>
          ) : (
            <>
              Congratulations! You&apos;ve completed {completedJobs} jobs. Your commission rate is now 10%.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to standard rate</span>
            <span>{completedJobs} / {promotionalThreshold} jobs</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5% commission</span>
            <span>10% commission</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Payouts table
function PayoutsTable({
  payouts,
  isLoading,
}: {
  payouts: EarningsPayout[] | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!payouts || payouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No payouts yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete jobs to start receiving payouts
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Job</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Receipt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payouts.map((payout) => {
          const StatusIcon = STATUS_ICONS[payout.status]
          return (
            <TableRow key={payout.id}>
              <TableCell className="font-medium">
                {formatPayoutDate(payout.createdAt)}
              </TableCell>
              <TableCell>
                {payout.job ? (
                  <div>
                    <div className="font-medium">{payout.job.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {payout.job.client.firstName} {payout.job.client.lastName}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getPayoutTypeLabel(payout.type)}</Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatKES(payout.netAmount)}
              </TableCell>
              <TableCell>
                <Badge className={cn('gap-1', getPayoutStatusColor(payout.status))}>
                  <StatusIcon className="h-3 w-3" />
                  {payout.status}
                </Badge>
              </TableCell>
              <TableCell>
                {payout.mpesaReceiptNumber ? (
                  <span className="text-xs font-mono">{payout.mpesaReceiptNumber}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// Recent payouts card
function RecentPayouts({
  recentPayouts,
  isLoading,
}: {
  recentPayouts: RecentPayout[] | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!recentPayouts || recentPayouts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Completed Payouts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentPayouts.map((payout) => (
            <div key={payout.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{payout.job?.title || 'Payout'}</div>
                <div className="text-xs text-muted-foreground">
                  {formatPayoutDate(payout.completedAt)} • {payout.mpesaReceiptNumber || 'Processing'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">+{formatKES(payout.netAmount)}</div>
                <Badge variant="outline" className="text-xs">
                  {getPayoutTypeLabel(payout.type)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Main page component
export default function EarningsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { data, isLoading, error, refetch } = useArtisanEarnings({
    page,
    limit: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground">
            Track your earnings and payout history
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium">Failed to load earnings</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Please try again'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <EarningsSummary statistics={data?.statistics} isLoading={isLoading} />

      {/* Commission progress */}
      <CommissionProgress commission={data?.statistics?.commission} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payouts table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Payout History</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <PayoutsTable payouts={data?.payouts} isLoading={isLoading} />

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {data.pagination.page} of {data.pagination.totalPages}
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

        {/* Recent payouts sidebar */}
        <div>
          <RecentPayouts recentPayouts={data?.recentPayouts} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
