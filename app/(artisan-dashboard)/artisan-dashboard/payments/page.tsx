'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreditCard,
  Download,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useArtisanPayments,
  usePaymentReceipt,
  useExportPayments,
  PAYMENT_STATUS_CONFIG,
  formatPaymentDateShort,
  formatPaymentDate,
  downloadReceipt,
  type Payment,
  type PaymentSummary,
  type ReceiptData,
} from '@/lib/hooks/use-artisan-payments'

const STATUS_ICONS = {
  PENDING: Clock,
  COMPLETED: CheckCircle2,
  FAILED: XCircle,
  REFUNDED: RefreshCw,
}

// Summary cards component
function SummaryCards({ summary, isLoading }: { summary: PaymentSummary | undefined; isLoading: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-12" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{summary?.totalPayments || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-28 mb-1" />
              <Skeleton className="h-3 w-32" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">
                KES {(summary?.completedAmount || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.completedPayments || 0} successful payments
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-28" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{summary?.pendingPayments || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-32" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{summary?.failedPayments || 0}</div>
              <p className="text-xs text-muted-foreground">Unsuccessful payments</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Payment row skeleton
function PaymentRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
    </TableRow>
  )
}

// Receipt modal component
function ReceiptModal({
  open,
  onOpenChange,
  receiptData,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: ReceiptData | null | undefined
  isLoading: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment Receipt
          </DialogTitle>
          <DialogDescription>
            {receiptData?.receiptNumber || 'Loading...'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : receiptData ? (
          <div className="space-y-6 py-4">
            {/* Amount */}
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="text-3xl font-bold">
                {receiptData.payment.currency} {receiptData.payment.amount.toLocaleString()}
              </p>
              <Badge
                variant="secondary"
                className={cn(
                  'mt-2',
                  PAYMENT_STATUS_CONFIG[receiptData.payment.status as keyof typeof PAYMENT_STATUS_CONFIG]?.className
                )}
              >
                {receiptData.payment.status}
              </Badge>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{formatPaymentDate(receiptData.transactionDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="flex items-center gap-1">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  M-Pesa
                </span>
              </div>
              {receiptData.payment.mpesaReceiptNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">M-Pesa Receipt</span>
                  <span className="font-mono">
                    {receiptData.payment.mpesaReceiptNumber}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscription</span>
                <span>{receiptData.subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid Until</span>
                <span>{formatPaymentDateShort(receiptData.subscription.endDate)}</span>
              </div>
            </div>

            {/* Download Button */}
            <Button onClick={() => downloadReceipt(receiptData)} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Failed to load receipt
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)

  // Queries
  const { data, isLoading, error, refetch } = useArtisanPayments({
    page,
    limit: 10,
    status: statusFilter,
  })

  const { data: receiptData, isLoading: loadingReceipt } = usePaymentReceipt(selectedPaymentId)
  const exportMutation = useExportPayments()

  const payments = data?.items || []
  const summary = data?.summary
  const totalPages = data?.pagination?.totalPages || 1

  const handleViewReceipt = (paymentId: string) => {
    setSelectedPaymentId(paymentId)
    setReceiptOpen(true)
  }

  const handleCloseReceipt = () => {
    setReceiptOpen(false)
    setSelectedPaymentId(null)
  }

  const handleExport = () => {
    exportMutation.mutate(statusFilter !== 'all' ? statusFilter : undefined)
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6 space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700 text-sm">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">
            View your subscription payments and download receipts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportMutation.isPending || payments.length === 0}
          >
            <Download className={cn('mr-2 h-4 w-4', exportMutation.isPending && 'animate-pulse')} />
            {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} isLoading={isLoading} />

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Your payment transaction history</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map(i => (
                  <PaymentRowSkeleton key={i} />
                ))}
              </TableBody>
            </Table>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No payments yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your payment history will appear here once you subscribe.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const statusConfig = PAYMENT_STATUS_CONFIG[payment.status]
                    const StatusIcon = STATUS_ICONS[payment.status]
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {formatPaymentDateShort(payment.createdAt)}
                        </TableCell>
                        <TableCell>
                          {payment.description || 'Subscription Payment'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-green-600" />
                            M-Pesa
                          </div>
                        </TableCell>
                        <TableCell>
                          KES {payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn('gap-1', statusConfig.className)}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReceipt(payment.id)}
                          >
                            <Receipt className="mr-1 h-4 w-4" />
                            Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
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
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      <ReceiptModal
        open={receiptOpen}
        onOpenChange={handleCloseReceipt}
        receiptData={receiptData}
        isLoading={loadingReceipt}
      />
    </div>
  )
}
