import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Quote Line Item Types
export interface QuoteLineItemInput {
  category: string
  name: string
  description?: string
  quantity: number
  unit?: string
  unitPrice: number
  total: number
}

export interface QuoteLineItem extends QuoteLineItemInput {
  id: string
  isSystemGenerated: boolean
  sortOrder: number
  createdAt: string
}

// Types
export interface ArtisanJob {
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
  client: {
    id: string
    name: string
    email: string
    profileImage: string | null
    phone?: string | null
    location?: string | null
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

export interface ArtisanJobsResponse {
  jobs: ArtisanJob[]
  statusCounts: {
    REQUESTED: number
    QUOTED: number
    ACCEPTED: number
    DEPOSIT_PAID: number
    IN_PROGRESS: number
    COMPLETED: number
    PAID: number
    CANCELLED: number
    DECLINED: number
    total: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ArtisanJobDetails extends ArtisanJob {
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
export const artisanJobsKeys = {
  all: ['artisan-jobs'] as const,
  list: (status?: string | null) => [...artisanJobsKeys.all, 'list', status || 'all'] as const,
  detail: (id: string) => [...artisanJobsKeys.all, 'detail', id] as const,
}

// Fetch functions
async function fetchArtisanJobs(status: string | null): Promise<ArtisanJobsResponse> {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  
  const response = await fetch(`/api/artisan/jobs?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch jobs')
  }
  return response.json()
}

async function fetchArtisanJobDetails(id: string): Promise<{ job: ArtisanJobDetails }> {
  const response = await fetch(`/api/artisan/jobs/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch job details')
  }
  return response.json()
}

// Hooks
export function useArtisanJobs(status: string | null = null) {
  return useQuery({
    queryKey: artisanJobsKeys.list(status),
    queryFn: () => fetchArtisanJobs(status),
  })
}

export function useArtisanJobDetails(id: string) {
  return useQuery({
    queryKey: artisanJobsKeys.detail(id),
    queryFn: () => fetchArtisanJobDetails(id),
    enabled: !!id,
  })
}

// Mutations
interface CreateQuoteParams {
  jobId: string
  amount: number
  description: string
  lineItems: QuoteLineItemInput[]  // Required - itemized breakdown
  requestedDepositPercent?: number // Artisan can request different deposit %
  estimatedDuration?: string
  paymentTerms?: string
  validDays?: number
}

interface DeclineJobParams {
  jobId: string
  declineReason?: string
}

interface StartJobParams {
  jobId: string
  scheduledStartDate?: string
  scheduledEndDate?: string
}

interface CompleteJobParams {
  jobId: string
}

export function useCreateQuote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ jobId, ...data }: CreateQuoteParams) => {
      const response = await fetch(`/api/artisan/jobs/${jobId}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create quote')
      }
      return response.json()
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: artisanJobsKeys.all })
      queryClient.invalidateQueries({ queryKey: artisanJobsKeys.detail(jobId) })
    },
  })
}

export function useDeclineJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ jobId, declineReason }: DeclineJobParams) => {
      const response = await fetch(`/api/artisan/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', declineReason }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to decline job')
      }
      return response.json()
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: artisanJobsKeys.all })
      queryClient.invalidateQueries({ queryKey: artisanJobsKeys.detail(jobId) })
    },
  })
}

export function useStartJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ jobId, ...data }: StartJobParams) => {
      const response = await fetch(`/api/artisan/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_job', ...data }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start job')
      }
      return response.json()
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: artisanJobsKeys.all })
      queryClient.invalidateQueries({ queryKey: artisanJobsKeys.detail(jobId) })
    },
  })
}

export function useCompleteJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ jobId }: CompleteJobParams) => {
      const response = await fetch(`/api/artisan/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete_job' }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete job')
      }
      return response.json()
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: artisanJobsKeys.all })
      queryClient.invalidateQueries({ queryKey: artisanJobsKeys.detail(jobId) })
    },
  })
}
