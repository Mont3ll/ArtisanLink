import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { clientJobsKeys } from './use-client-jobs'

// Types
export interface InitiateJobPaymentData {
  jobId: string
  paymentType: 'DEPOSIT' | 'FINAL'
  phoneNumber: string
}

export interface InitiateJobPaymentResponse {
  message: string
  checkoutRequestId: string
  merchantRequestId: string
  responseCode: string
  responseDescription: string
  customerMessage: string
  payment: {
    id: string
    amount: number
    type: string
    status: string
  }
}

export interface JobPaymentStatus {
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  payment?: {
    id: string
    amount: number
    type: string
    status: string
    mpesaReceiptNumber?: string
    paidAt?: string
  }
  job?: {
    id: string
    status: string
  }
  message?: string
  error?: string
}

// Query keys
export const jobPaymentKeys = {
  all: ['job-payments'] as const,
  status: (checkoutRequestId: string) => [...jobPaymentKeys.all, 'status', checkoutRequestId] as const,
}

// API functions
async function initiateJobPayment(data: InitiateJobPaymentData): Promise<InitiateJobPaymentResponse> {
  const response = await fetch('/api/payments/job/initiate', {
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

async function fetchJobPaymentStatus(checkoutRequestId: string): Promise<JobPaymentStatus> {
  const response = await fetch(
    `/api/payments/job/initiate?checkoutRequestId=${checkoutRequestId}&query=true`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch payment status')
  }

  return response.json()
}

/**
 * Hook for initiating M-Pesa job payments (deposit or final)
 */
export function useInitiateJobPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: initiateJobPayment,
    onSuccess: (_, { jobId }) => {
      // Invalidate job queries to refresh data after payment
      queryClient.invalidateQueries({ queryKey: clientJobsKeys.all })
      queryClient.invalidateQueries({ queryKey: clientJobsKeys.detail(jobId) })
    },
  })
}

/**
 * Hook for polling job payment status
 * Polls every 3 seconds until payment is completed or failed
 */
export function useJobPaymentStatus(checkoutRequestId: string | null) {
  const queryClient = useQueryClient()
  const [paymentStatus, setPaymentStatus] = useState<JobPaymentStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  const startPolling = useCallback(() => {
    setIsPolling(true)
  }, [])

  const stopPolling = useCallback(() => {
    setIsPolling(false)
  }, [])

  const reset = useCallback(() => {
    setPaymentStatus(null)
    setIsPolling(false)
  }, [])

  useEffect(() => {
    if (!checkoutRequestId || !isPolling) return
    if (paymentStatus?.status === 'COMPLETED' || paymentStatus?.status === 'FAILED') {
      setIsPolling(false)
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await fetchJobPaymentStatus(checkoutRequestId)
        setPaymentStatus(status)

        // Stop polling if payment completed or failed
        if (status.status === 'COMPLETED' || status.status === 'FAILED') {
          setIsPolling(false)
          // Invalidate queries to refresh job data
          queryClient.invalidateQueries({ queryKey: clientJobsKeys.all })
        }
      } catch (err) {
        console.error('Failed to poll payment status:', err)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [checkoutRequestId, isPolling, paymentStatus?.status, queryClient])

  return { 
    paymentStatus, 
    isPolling,
    startPolling,
    stopPolling,
    reset 
  }
}

/**
 * Combined hook for the full payment flow
 * Handles initiation and status polling in one hook
 */
export function useJobPaymentFlow() {
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  
  const initiateMutation = useInitiateJobPayment()
  const { paymentStatus, isPolling, startPolling, reset: resetStatus } = useJobPaymentStatus(checkoutRequestId)

  const initiatePayment = useCallback(async (data: InitiateJobPaymentData) => {
    try {
      const result = await initiateMutation.mutateAsync(data)
      setCheckoutRequestId(result.checkoutRequestId)
      setJobId(data.jobId)
      startPolling()
      return result
    } catch (error) {
      throw error
    }
  }, [initiateMutation, startPolling])

  const reset = useCallback(() => {
    setCheckoutRequestId(null)
    setJobId(null)
    resetStatus()
    initiateMutation.reset()
  }, [resetStatus, initiateMutation])

  return {
    initiatePayment,
    isInitiating: initiateMutation.isPending,
    initiateError: initiateMutation.error,
    checkoutRequestId,
    jobId,
    paymentStatus,
    isPolling,
    isComplete: paymentStatus?.status === 'COMPLETED',
    isFailed: paymentStatus?.status === 'FAILED',
    reset,
  }
}
