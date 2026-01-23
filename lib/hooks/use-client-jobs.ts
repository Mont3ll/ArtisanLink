import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { QuoteLineItem } from './use-artisan-jobs'

// Types
export interface ClientJob {
  id: string
  title: string
  description: string
  category: string | null
  location: string | null
  status: string
  clientBudget: number | null
  agreedPrice: number | null
  depositAmount: number | null
  depositPercent: number
  depositPaid: boolean
  depositPaidAt: string | null
  finalPaid: boolean
  finalPaidAt: string | null
  startedAt: string | null
  requestedStartDate: string | null
  requestedEndDate: string | null
  scheduledStartDate: string | null
  scheduledEndDate: string | null
  completedAt: string | null
  declineReason: string | null
  cancelReason: string | null
  createdAt: string
  updatedAt: string
  artisan: {
    id: string
    name: string
    email: string
    profileImage: string | null
    profession: string | null
    phone?: string | null
    location?: string | null
    rating: number
    isAvailable: boolean
  }
  latestQuote: {
    id: string
    amount: number
    description: string
    estimatedDuration: string | null
    paymentTerms: string | null
    status: string
    round: number
    validUntil: string | null
    clientResponse: string | null
    requestedDepositPercent: number | null
    lineItems: QuoteLineItem[]
    createdAt: string
  } | null
  payments: Array<{
    id: string
    amount: number
    type: string
    mpesaReceiptNumber: string | null
    status: string
    paidAt: string | null
    createdAt: string
  }>
  conversationId: string | null
}

export interface ClientJobsResponse {
  jobs: ClientJob[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ClientJobDetails extends ClientJob {
  quotes: Array<{
    id: string
    amount: number
    description: string
    estimatedDuration: string | null
    paymentTerms: string | null
    status: string
    round: number
    validUntil: string | null
    clientResponse: string | null
    requestedDepositPercent: number | null
    lineItems: QuoteLineItem[]
    createdAt: string
    updatedAt: string
  }>
}

// Query keys
export const clientJobsKeys = {
  all: ['client-jobs'] as const,
  list: (status?: string | null) => [...clientJobsKeys.all, 'list', status || 'all'] as const,
  detail: (id: string) => [...clientJobsKeys.all, 'detail', id] as const,
}

// Fetch functions
async function fetchClientJobs(status: string | null): Promise<ClientJobsResponse> {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  
  const response = await fetch(`/api/client/jobs?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch jobs')
  }
  return response.json()
}

async function fetchClientJobDetails(id: string): Promise<{ job: ClientJobDetails }> {
  const response = await fetch(`/api/client/jobs/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch job details')
  }
  return response.json()
}

// Hooks
export function useClientJobs(status: string | null = null) {
  return useQuery({
    queryKey: clientJobsKeys.list(status),
    queryFn: () => fetchClientJobs(status),
  })
}

export function useClientJobDetails(id: string) {
  return useQuery({
    queryKey: clientJobsKeys.detail(id),
    queryFn: () => fetchClientJobDetails(id),
    enabled: !!id,
  })
}

// Mutations
interface AcceptQuoteParams {
  jobId: string
  quoteId: string
}

interface DeclineQuoteParams {
  jobId: string
  quoteId: string
  clientNotes?: string
}

interface CancelJobParams {
  jobId: string
  cancelReason?: string
}

export function useAcceptQuote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ jobId, quoteId }: AcceptQuoteParams) => {
      const response = await fetch(`/api/client/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept_quote', quoteId }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to accept quote')
      }
      return response.json()
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: clientJobsKeys.all })
      queryClient.invalidateQueries({ queryKey: clientJobsKeys.detail(jobId) })
    },
  })
}

export function useDeclineQuote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ jobId, quoteId, clientNotes }: DeclineQuoteParams) => {
      const response = await fetch(`/api/client/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline_quote', quoteId, clientNotes }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to decline quote')
      }
      return response.json()
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: clientJobsKeys.all })
      queryClient.invalidateQueries({ queryKey: clientJobsKeys.detail(jobId) })
    },
  })
}

export function useCancelJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ jobId, cancelReason }: CancelJobParams) => {
      const response = await fetch(`/api/client/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', cancelReason }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel job')
      }
      return response.json()
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: clientJobsKeys.all })
      queryClient.invalidateQueries({ queryKey: clientJobsKeys.detail(jobId) })
    },
  })
}

export function useCreateJobRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      artisanId: string
      conversationId?: string
      title: string
      description: string
      category?: string
      location?: string
      clientBudget?: number
      requestedStartDate?: string
      requestedEndDate?: string
      depositPercent?: number
    }) => {
      const response = await fetch('/api/client/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create job request')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientJobsKeys.all })
    },
  })
}
