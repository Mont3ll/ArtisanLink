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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Ban,
  FileCheck,
  MessageSquarePlus,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useAdminPayouts,
  usePayoutAction,
  formatPayoutCurrency,
  formatPayoutDate,
  getPayoutStatusConfig,
  getPayoutTypeLabel,
  getArtisanDisplayName,
  type AdminPayout,
  type PayoutStatus,
  type PayoutFilters,
  type PayoutStatistics,
} from '@/lib/hooks/use-admin-payouts'

const STATUS_ICONS: Record<PayoutStatus, React.ElementType> = {
  PENDING: Clock,
  PROCESSING: RefreshCw,
  COMPLETED: CheckCircle2,
  FAILED: XCircle,
  CANCELLED: AlertCircle,
}

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

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell>
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
    </TableRow>
  )
}

// Summary cards component
function PayoutsSummary({
  statistics,
  isLoading,
  requiresReviewCount,
}: {
  statistics: PayoutStatistics | undefined
  isLoading: boolean
  requiresReviewCount: number
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

  const byStatus = statistics?.byStatus || {} as Record<PayoutStatus, { count: number; amount: number }>
  const pending = byStatus.PENDING || { count: 0, amount: 0 }
  const processing = byStatus.PROCESSING || { count: 0, amount: 0 }
  const completed = byStatus.COMPLETED || { count: 0, amount: 0 }
  const failed = byStatus.FAILED || { count: 0, amount: 0 }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
          <Wallet className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatPayoutCurrency(completed.amount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {completed.count} completed payouts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPayoutCurrency(pending.amount + processing.amount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {pending.count + processing.count} awaiting processing
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatPayoutCurrency(failed.amount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {failed.count} failed payouts
          </p>
        </CardContent>
      </Card>

      <Card className={cn(requiresReviewCount > 0 && 'border-orange-500')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requires Review</CardTitle>
          <AlertTriangle className={cn(
            'h-4 w-4',
            requiresReviewCount > 0 ? 'text-orange-600' : 'text-muted-foreground'
          )} />
        </CardHeader>
        <CardContent>
          <div className={cn(
            'text-2xl font-bold',
            requiresReviewCount > 0 ? 'text-orange-600' : ''
          )}>
            {requiresReviewCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Manual intervention needed
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Action dialog component
function PayoutActionDialog({
  open,
  onOpenChange,
  payout,
  action,
  onSubmit,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  payout: AdminPayout | null
  action: 'retry' | 'cancel' | 'markComplete' | 'addNotes' | null
  onSubmit: (data: {
    adminNotes?: string
    phoneNumber?: string
    transactionId?: string
    receiptNumber?: string
  }) => void
  isLoading: boolean
}) {
  const [notes, setNotes] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [receiptNumber, setReceiptNumber] = useState('')

  const handleSubmit = () => {
    onSubmit({
      adminNotes: notes || undefined,
      phoneNumber: action === 'retry' && phoneNumber ? phoneNumber : undefined,
      transactionId: action === 'markComplete' ? transactionId : undefined,
      receiptNumber: action === 'markComplete' ? receiptNumber : undefined,
    })
  }

  const getTitle = () => {
    switch (action) {
      case 'retry': return 'Retry Payout'
      case 'cancel': return 'Cancel Payout'
      case 'markComplete': return 'Mark as Complete'
      case 'addNotes': return 'Add Admin Notes'
      default: return ''
    }
  }

  const getDescription = () => {
    switch (action) {
      case 'retry':
        return `This will reset the payout for ${getArtisanDisplayName(payout!.artisan)} and attempt to send ${formatPayoutCurrency(payout!.netAmount)} again.`
      case 'cancel':
        return `This will cancel the payout of ${formatPayoutCurrency(payout!.netAmount)} for ${getArtisanDisplayName(payout!.artisan)}. This action cannot be undone.`
      case 'markComplete':
        return `Mark this payout as manually completed. Use this when payment was made outside the system.`
      case 'addNotes':
        return `Add notes to this payout for record keeping.`
      default:
        return ''
    }
  }

  if (!payout || !action) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payout summary */}
          <div className="rounded-lg border p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Artisan</span>
              <span className="font-medium">{getArtisanDisplayName(payout.artisan)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{formatPayoutCurrency(payout.netAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-mono text-xs">{payout.phoneNumber}</span>
            </div>
          </div>

          {/* Action-specific fields */}
          {action === 'retry' && (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (optional update)</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={payout.phoneNumber}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use existing number
              </p>
            </div>
          )}

          {action === 'markComplete' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g., AGR7XXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptNumber">M-Pesa Receipt Number</Label>
                <Input
                  id="receiptNumber"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="e.g., RGI7XXXXXXXX"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">
              Admin Notes {action !== 'addNotes' && '(optional)'}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this action..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (action === 'addNotes' && !notes) || (action === 'markComplete' && !transactionId && !receiptNumber)}
            variant={action === 'cancel' ? 'destructive' : 'default'}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              getTitle()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Payout detail dialog
function PayoutDetailDialog({
  open,
  onOpenChange,
  payout,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  payout: AdminPayout | null
}) {
  if (!payout) return null

  const statusConfig = getPayoutStatusConfig(payout.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Payout Details</DialogTitle>
          <DialogDescription>
            {payout.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status and type */}
          <div className="flex items-center gap-2">
            <Badge className={cn(statusConfig.bgColor, statusConfig.color)}>
              {statusConfig.label}
            </Badge>
            <Badge variant="outline">{getPayoutTypeLabel(payout.type)}</Badge>
            {payout.requiresManualReview && (
              <Badge variant="destructive">Requires Review</Badge>
            )}
          </div>

          {/* Artisan info */}
          <div className="rounded-lg border p-3 space-y-2">
            <h4 className="font-medium text-sm">Artisan</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{getArtisanDisplayName(payout.artisan)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-xs">{payout.artisan.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-mono text-xs">{payout.phoneNumber}</span>
              </div>
            </div>
          </div>

          {/* Amount breakdown */}
          <div className="rounded-lg border p-3 space-y-2">
            <h4 className="font-medium text-sm">Amount</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross</span>
                <span>{formatPayoutCurrency(payout.grossAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission</span>
                <span className="text-red-600">-{formatPayoutCurrency(payout.commission)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Net Payout</span>
                <span className="text-green-600">{formatPayoutCurrency(payout.netAmount)}</span>
              </div>
            </div>
          </div>

          {/* Job info */}
          {payout.job && (
            <div className="rounded-lg border p-3 space-y-2">
              <h4 className="font-medium text-sm">Job</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span>{payout.job.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agreed Price</span>
                  <span>{payout.job.agreedPrice ? formatPayoutCurrency(payout.job.agreedPrice) : 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* M-Pesa details */}
          <div className="rounded-lg border p-3 space-y-2">
            <h4 className="font-medium text-sm">M-Pesa Details</h4>
            <div className="text-sm space-y-1">
              {payout.mpesaReceiptNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt</span>
                  <span className="font-mono text-xs">{payout.mpesaReceiptNumber}</span>
                </div>
              )}
              {payout.mpesaTransactionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs">{payout.mpesaTransactionId}</span>
                </div>
              )}
              {payout.resultCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Result Code</span>
                  <span className="font-mono text-xs">{payout.resultCode}</span>
                </div>
              )}
              {payout.failureReason && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failure Reason</span>
                  <span className="text-red-600 text-xs">{payout.failureReason}</span>
                </div>
              )}
            </div>
          </div>

          {/* Retry info */}
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Retry Count</span>
              <span>{payout.retryCount} / {payout.maxRetries}</span>
            </div>
            <div className="flex justify-between">
              <span>Created</span>
              <span>{formatPayoutDate(payout.createdAt)}</span>
            </div>
            {payout.completedAt && (
              <div className="flex justify-between">
                <span>Completed</span>
                <span>{formatPayoutDate(payout.completedAt)}</span>
              </div>
            )}
          </div>

          {/* Admin notes */}
          {payout.adminNotes && (
            <div className="rounded-lg bg-muted p-3">
              <h4 className="font-medium text-sm mb-1">Admin Notes</h4>
              <p className="text-sm whitespace-pre-wrap">{payout.adminNotes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main page component
export default function PayoutsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [requiresReviewFilter, setRequiresReviewFilter] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Action dialog state
  const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null)
  const [currentAction, setCurrentAction] = useState<'retry' | 'cancel' | 'markComplete' | 'addNotes' | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Build filters
  const filters: PayoutFilters = useMemo(() => ({
    page,
    limit: 20,
    status: statusFilter === 'all' ? undefined : statusFilter as PayoutStatus,
    requiresReview: requiresReviewFilter || undefined,
    search: searchTerm || undefined,
  }), [page, statusFilter, requiresReviewFilter, searchTerm])

  const { data, isLoading, error, refetch } = useAdminPayouts(filters)
  const payoutAction = usePayoutAction()

  // Count payouts requiring review
  const requiresReviewCount = useMemo(() => {
    if (!data?.payouts) return 0
    return data.payouts.filter(p => p.requiresManualReview).length
  }, [data?.payouts])

  // Handle action
  const handleAction = (payout: AdminPayout, action: 'retry' | 'cancel' | 'markComplete' | 'addNotes') => {
    setSelectedPayout(payout)
    setCurrentAction(action)
    setActionDialogOpen(true)
  }

  // Handle action submit
  const handleActionSubmit = async (actionData: {
    adminNotes?: string
    phoneNumber?: string
    transactionId?: string
    receiptNumber?: string
  }) => {
    if (!selectedPayout || !currentAction) return

    try {
      await payoutAction.mutateAsync({
        id: selectedPayout.id,
        action: currentAction,
        ...actionData,
      })
      setActionDialogOpen(false)
      setSelectedPayout(null)
      setCurrentAction(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  // Handle view details
  const handleViewDetails = (payout: AdminPayout) => {
    setSelectedPayout(payout)
    setDetailDialogOpen(true)
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Failed to load payouts</h2>
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
          <h1 className="text-3xl font-bold tracking-tight">Payout Management</h1>
          <p className="text-muted-foreground">
            Manage artisan payouts and monitor B2C transactions
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <PayoutsSummary
        statistics={data?.statistics}
        isLoading={isLoading}
        requiresReviewCount={requiresReviewCount}
      />

      {/* Payouts table */}
      <Card>
        <CardHeader>
          <CardTitle>Payouts</CardTitle>
          <CardDescription>All artisan payout transactions</CardDescription>
          
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artisan or receipt..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={requiresReviewFilter ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setRequiresReviewFilter(!requiresReviewFilter)
                setPage(1)
              }}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Requires Review
              {requiresReviewCount > 0 && !requiresReviewFilter && (
                <Badge variant="destructive" className="ml-1">
                  {requiresReviewCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Artisan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : !data?.payouts || data.payouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No payouts found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' || requiresReviewFilter
                        ? 'Try adjusting your filters'
                        : 'Payouts will appear here when jobs are completed'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                data.payouts.map((payout) => {
                  const statusConfig = getPayoutStatusConfig(payout.status)
                  const StatusIcon = STATUS_ICONS[payout.status]
                  
                  return (
                    <TableRow
                      key={payout.id}
                      className={cn(payout.requiresManualReview && 'bg-orange-50 dark:bg-orange-950/20')}
                    >
                      <TableCell className="font-medium">
                        {formatPayoutDate(payout.createdAt).split(',')[0]}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getArtisanDisplayName(payout.artisan)}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {payout.phoneNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getPayoutTypeLabel(payout.type)}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPayoutCurrency(payout.netAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={cn('gap-1', statusConfig.bgColor, statusConfig.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                          {payout.requiresManualReview && (
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(payout)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {(payout.status === 'PENDING' || payout.status === 'FAILED') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAction(payout, 'retry')}
                              title="Retry payout"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {payout.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAction(payout, 'cancel')}
                              title="Cancel payout"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {payout.status !== 'COMPLETED' && payout.status !== 'CANCELLED' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAction(payout, 'markComplete')}
                              title="Mark as complete"
                            >
                              <FileCheck className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAction(payout, 'addNotes')}
                            title="Add notes"
                          >
                            <MessageSquarePlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} payouts
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

      {/* Action dialog */}
      <PayoutActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        payout={selectedPayout}
        action={currentAction}
        onSubmit={handleActionSubmit}
        isLoading={payoutAction.isPending}
      />

      {/* Detail dialog */}
      <PayoutDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        payout={selectedPayout}
      />
    </div>
  )
}
