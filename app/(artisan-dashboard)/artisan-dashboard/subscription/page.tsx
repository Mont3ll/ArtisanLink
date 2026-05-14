'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Crown,
  Check,
  Smartphone,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useArtisanSubscription,
  useInitiatePayment,
  usePaymentStatusPolling,
  SUBSCRIPTION_PLANS,
  formatSubscriptionDate,
  getDaysRemaining,
  type PlanType,
  type PaymentStatus,
} from '@/lib/hooks/use-artisan-subscription'

// Current subscription status card
function CurrentSubscriptionCard({
  subscription,
  isLoading,
}: {
  subscription: { plan: string; status: string; endDate: string } | null | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <Card className="border-border bg-muted">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (subscription?.status === 'ACTIVE') {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-5 w-5" />
            Active Subscription
          </CardTitle>
          <CardDescription className="text-green-600 dark:text-green-400">
            You have an active {subscription.plan.toLowerCase()} subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Plan</p>
            <p className="text-lg font-semibold">{subscription.plan}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Valid Until</p>
            <p className="text-lg font-semibold">{formatSubscriptionDate(subscription.endDate)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Days Remaining</p>
            <p className="text-lg font-semibold">{getDaysRemaining(subscription.endDate)} days</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (subscription?.status === 'EXPIRED') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Subscription Expired</h3>
              <p className="text-red-700 text-sm">
                Your subscription expired on {formatSubscriptionDate(subscription.endDate)}.
                Renew now to keep your boosted search ranking and reduced commission rate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}

// Plan card skeleton
function PlanCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-32 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}

// Plan card component
function PlanCard({
  planKey,
  plan,
  isCurrentPlan,
  onSelect,
}: {
  planKey: PlanType
  plan: typeof SUBSCRIPTION_PLANS.MONTHLY
  isCurrentPlan: boolean
  onSelect: (plan: PlanType) => void
}) {
  const isAnnual = planKey === 'ANNUAL'

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all',
        isAnnual && 'border-primary ring-1 ring-primary',
        isCurrentPlan && 'border-green-500'
      )}
    >
      {isAnnual && (
        <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Best Value
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute left-0 top-0 rounded-br-lg bg-green-600 px-3 py-1 text-xs font-medium text-white">
          Current Plan
        </div>
      )}
      <CardHeader className={cn((isAnnual || isCurrentPlan) && 'pt-8')}>
        <CardTitle className="flex items-center gap-2">
          <Crown className={cn('h-5 w-5', isAnnual && 'text-primary')} />
          {plan.name}
        </CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold text-foreground">
            KES {plan.price.toLocaleString()}
          </span>
          <span className="text-muted-foreground">
            /{planKey === 'MONTHLY' ? 'month' : 'year'}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isAnnual ? 'default' : 'outline'}
          disabled={isCurrentPlan}
          onClick={() => onSelect(planKey)}
        >
          {isCurrentPlan ? 'Current Plan' : `Subscribe to ${plan.name}`}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Payment status display
function PaymentStatusDisplay({ status }: { status: PaymentStatus | null }) {
  if (!status) return null

  if (status.status === 'PENDING') {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
        </div>
        <div className="text-center">
          <p className="font-medium">Waiting for Payment</p>
          <p className="text-sm text-muted-foreground">
            Check your phone for the M-Pesa prompt
          </p>
        </div>
      </div>
    )
  }

  if (status.status === 'PROCESSING') {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
        <div className="text-center">
          <p className="font-medium">Processing Payment</p>
          <p className="text-sm text-muted-foreground">
            Confirming your payment...
          </p>
        </div>
      </div>
    )
  }

  if (status.status === 'COMPLETED') {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-center">
          <p className="font-medium text-green-600">Payment Successful!</p>
          <p className="text-sm text-muted-foreground">
            Your subscription is now active
          </p>
          {status.receiptNumber && (
            <p className="mt-2 text-xs text-muted-foreground">
              Receipt: {status.receiptNumber}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (status.status === 'FAILED') {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="text-center">
          <p className="font-medium text-red-600">Payment Failed</p>
          <p className="text-sm text-muted-foreground">
            {status.failureReason || 'Please try again'}
          </p>
        </div>
      </div>
    )
  }

  return null
}

// Checkout dialog
function CheckoutDialog({
  open,
  onOpenChange,
  selectedPlan,
  onInitiate,
  isProcessing,
  checkoutRequestId,
  paymentStatus,
  error,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPlan: PlanType | null
  onInitiate: (phoneNumber: string) => void
  isProcessing: boolean
  checkoutRequestId: string | null
  paymentStatus: PaymentStatus | null
  error: string | null
}) {
  const [phoneNumber, setPhoneNumber] = useState('')

  const handleClose = () => {
    setPhoneNumber('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            {selectedPlan && `Subscribe to ${SUBSCRIPTION_PLANS[selectedPlan].name}`}
          </DialogTitle>
          <DialogDescription>
            {selectedPlan && (
              <>
                KES {SUBSCRIPTION_PLANS[selectedPlan].price.toLocaleString()} / 
                {selectedPlan === 'MONTHLY' ? 'month' : 'year'}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!checkoutRequestId ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="07XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Enter the M-Pesa registered phone number
              </p>
            </div>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                onClick={() => onInitiate(phoneNumber)}
                disabled={isProcessing || !phoneNumber}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Pay with M-Pesa
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <PaymentStatusDisplay status={paymentStatus} />
            <DialogFooter>
              <Button onClick={handleClose} variant="outline" className="w-full">
                {paymentStatus?.status === 'COMPLETED' ? 'Done' : 'Close'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Queries and mutations
  const { data, isLoading, error, refetch } = useArtisanSubscription()
  const initiatePayment = useInitiatePayment()
  const { paymentStatus, setPaymentStatus, reset: resetPaymentStatus } = usePaymentStatusPolling(checkoutRequestId)

  const subscription = data?.subscription

  const handleSelectPlan = (plan: PlanType) => {
    setSelectedPlan(plan)
    setCheckoutOpen(true)
    setCheckoutError(null)
    setCheckoutRequestId(null)
    resetPaymentStatus()
  }

  const handleInitiatePayment = async (phoneNumber: string) => {
    if (!selectedPlan) return

    setCheckoutError(null)

    try {
      const result = await initiatePayment.mutateAsync({
        plan: selectedPlan,
        phoneNumber,
      })
      
      setCheckoutRequestId(result.checkoutRequestId)
      setPaymentStatus({
        paymentId: result.paymentId,
        status: 'PENDING',
        statusMessage: 'Check your phone for the M-Pesa prompt',
        amount: result.amount,
        currency: result.currency,
        subscription: {
          id: result.subscriptionId,
          status: 'INACTIVE',
          plan: result.plan,
        },
      })
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Payment initiation failed')
    }
  }

  const handleCloseCheckout = () => {
    setCheckoutOpen(false)
    setSelectedPlan(null)
    setCheckoutRequestId(null)
    setCheckoutError(null)
    resetPaymentStatus()
    // Refresh subscription if payment was successful
    if (paymentStatus?.status === 'COMPLETED') {
      refetch()
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground">
            Boost your profile and reduce your commission rate
          </p>
        </div>
        {subscription?.status === 'ACTIVE' && (
          <Badge variant="default" className="bg-green-600">
            <Crown className="mr-1 h-3 w-3" />
            Premium Active
          </Badge>
        )}
      </div>

      {/* Current Subscription Status */}
      <CurrentSubscriptionCard subscription={subscription} isLoading={isLoading} />

      {/* Subscription Plans */}
      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <>
            <PlanCardSkeleton />
            <PlanCardSkeleton />
          </>
        ) : (
          (Object.entries(SUBSCRIPTION_PLANS) as [PlanType, typeof SUBSCRIPTION_PLANS.MONTHLY][]).map(
            ([planKey, plan]) => {
              const isCurrentPlan = subscription?.plan === planKey && subscription?.status === 'ACTIVE'
              return (
                <PlanCard
                  key={planKey}
                  planKey={planKey}
                  plan={plan}
                  isCurrentPlan={isCurrentPlan}
                  onSelect={handleSelectPlan}
                />
              )
            }
          )
        )}
      </div>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Smartphone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">M-Pesa</p>
              <p className="text-sm text-muted-foreground">
                Pay securely using Safaricom M-Pesa
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            All payments are processed securely via M-Pesa. You will receive an STK push 
            notification on your phone to complete the payment.
          </p>
        </CardContent>
      </Card>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={handleCloseCheckout}
        selectedPlan={selectedPlan}
        onInitiate={handleInitiatePayment}
        isProcessing={initiatePayment.isPending}
        checkoutRequestId={checkoutRequestId}
        paymentStatus={paymentStatus}
        error={checkoutError}
      />
    </div>
  )
}
