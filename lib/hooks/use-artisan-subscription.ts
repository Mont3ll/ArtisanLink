'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'

// Types
export interface SubscriptionData {
  id: string
  plan: 'MONTHLY' | 'ANNUAL'
  status: 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
  startDate: string
  endDate: string
  amount: number
  currency: string
}

export interface PaymentStatus {
  paymentId: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PROCESSING'
  statusMessage?: string
  amount: number
  currency: string
  receiptNumber?: string
  paidAt?: string
  failureReason?: string
  subscription: {
    id: string
    status: string
    plan: string
    startDate?: string
    endDate?: string
  }
}

export interface InitiatePaymentData {
  plan: 'MONTHLY' | 'ANNUAL'
  phoneNumber: string
}

export interface InitiatePaymentResponse {
  checkoutRequestId: string
  paymentId: string
  amount: number
  currency: string
  subscriptionId: string
  plan: string
}

// Plan definitions (matching lib/mpesa.ts)
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    name: 'Monthly',
    price: 150,
    durationDays: 30,
    features: [
      'Priority listing in search results',
      'Premium profile badge',
      'Reduced commission rate (5%)',
      'Portfolio showcase (up to 20 items)',
      'Priority support',
    ],
  },
  ANNUAL: {
    name: 'Annual',
    price: 1500,
    durationDays: 365,
    features: [
      'All Monthly features',
      'Save KES 300 per year',
      'Featured on homepage',
      'Analytics dashboard',
      'Priority support',
    ],
  },
} as const

export type PlanType = keyof typeof SUBSCRIPTION_PLANS

// Query keys
export const artisanSubscriptionKeys = {
  all: ['artisan-subscription'] as const,
  data: () => [...artisanSubscriptionKeys.all, 'data'] as const,
  paymentStatus: (checkoutRequestId: string) => 
    [...artisanSubscriptionKeys.all, 'payment-status', checkoutRequestId] as const,
}

// Default value
const defaultSubscriptionData: { subscription: SubscriptionData | null } = { subscription: null }

// Fetch functions
async function fetchSubscription(): Promise<{ subscription: SubscriptionData | null }> {
  try {
    const response = await fetch('/api/artisan/stats')
    
    // Handle 403/404 gracefully - user may not be synced yet or not an artisan
    if (response.status === 403 || response.status === 404) {
      console.warn('[useArtisanSubscription] User not authorized or not found, returning null subscription')
      return defaultSubscriptionData
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscription status')
    }
    
    const data = await response.json()
    return { subscription: data.profile?.subscription || null }
  } catch (error) {
    console.error('[useArtisanSubscription] Error fetching subscription:', error)
    return defaultSubscriptionData
  }
}

async function initiatePayment(data: InitiatePaymentData): Promise<InitiatePaymentResponse> {
  const response = await fetch('/api/payments/mpesa/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to initiate payment')
  }
  
  return result
}

async function fetchPaymentStatus(checkoutRequestId: string): Promise<PaymentStatus> {
  const response = await fetch(
    `/api/payments/mpesa/status?checkoutRequestId=${checkoutRequestId}&query=true`
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch payment status')
  }
  
  return response.json()
}

/**
 * Hook for fetching artisan subscription data
 */
export function useArtisanSubscription() {
  return useQuery({
    queryKey: artisanSubscriptionKeys.data(),
    queryFn: fetchSubscription,
    staleTime: 30000,
    retry: 2, // Retry a couple times in case sync is still in progress
    retryDelay: 1000, // Wait 1 second between retries
  })
}

/**
 * Hook for initiating M-Pesa payment
 */
export function useInitiatePayment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: initiatePayment,
    onSuccess: () => {
      // Invalidate subscription data to get fresh status
      queryClient.invalidateQueries({ queryKey: artisanSubscriptionKeys.data() })
    },
  })
}

/**
 * Hook for polling payment status
 * Returns payment status and handles automatic polling
 */
export function usePaymentStatusPolling(checkoutRequestId: string | null) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!checkoutRequestId || paymentStatus?.status === 'COMPLETED' || paymentStatus?.status === 'FAILED') {
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await fetchPaymentStatus(checkoutRequestId)
        setPaymentStatus(status)

        // Stop polling if payment completed or failed
        if (status.status === 'COMPLETED' || status.status === 'FAILED') {
          clearInterval(pollInterval)
          if (status.status === 'COMPLETED') {
            // Refresh subscription data
            queryClient.invalidateQueries({ queryKey: artisanSubscriptionKeys.data() })
          }
        }
      } catch (err) {
        console.error('Failed to poll payment status:', err)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [checkoutRequestId, paymentStatus?.status, queryClient])

  const reset = useCallback(() => {
    setPaymentStatus(null)
  }, [])

  return { paymentStatus, setPaymentStatus, reset }
}

// Utility functions
export function formatSubscriptionDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function isSubscriptionActive(subscription: SubscriptionData | null): boolean {
  return subscription?.status === 'ACTIVE'
}

export function isSubscriptionExpired(subscription: SubscriptionData | null): boolean {
  return subscription?.status === 'EXPIRED'
}
