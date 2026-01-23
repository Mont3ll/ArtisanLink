/**
 * Admin Payouts Hook
 * 
 * React Query hooks for managing artisan payouts in the admin dashboard.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Query keys
export const adminPayoutsKeys = {
  all: ['admin-payouts'] as const,
  list: (filters?: PayoutFilters) => [...adminPayoutsKeys.all, 'list', filters] as const,
  detail: (id: string) => [...adminPayoutsKeys.all, 'detail', id] as const,
}

// Types
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type PayoutType = 'DEPOSIT_SHARE' | 'FINAL_PAYMENT' | 'REFUND' | 'ADJUSTMENT'

export interface PayoutArtisan {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  artisanProfile: {
    businessName: string | null
  } | null
}

export interface PayoutJob {
  id: string
  title: string
  agreedPrice: number | null
}

export interface AdminPayout {
  id: string
  artisanId: string
  jobId: string | null
  type: PayoutType
  grossAmount: number
  commission: number
  netAmount: number
  phoneNumber: string
  status: PayoutStatus
  mpesaConversationId: string | null
  mpesaTransactionId: string | null
  mpesaReceiptNumber: string | null
  resultCode: string | null
  resultDesc: string | null
  failureReason: string | null
  retryCount: number
  maxRetries: number
  nextRetryAt: string | null
  requiresManualReview: boolean
  adminNotes: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  completedAt: string | null
  artisan: PayoutArtisan
  job: PayoutJob | null
}

export interface PayoutStatistics {
  total: number
  byStatus: Record<PayoutStatus, { count: number; amount: number }>
}

export interface PayoutsResponse {
  payouts: AdminPayout[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  statistics: PayoutStatistics
}

export interface PayoutFilters {
  page?: number
  limit?: number
  status?: PayoutStatus
  type?: PayoutType
  requiresReview?: boolean
  artisanId?: string
  search?: string
}

export interface PayoutActionParams {
  id: string
  action: 'retry' | 'cancel' | 'markComplete' | 'addNotes' | 'clearReview'
  adminNotes?: string
  phoneNumber?: string
  transactionId?: string
  receiptNumber?: string
}

export interface PayoutActionResponse {
  success: boolean
  message: string
  payout: AdminPayout
}

/**
 * Fetch admin payouts
 */
async function fetchAdminPayouts(filters: PayoutFilters = {}): Promise<PayoutsResponse> {
  const params = new URLSearchParams()
  
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())
  if (filters.status) params.set('status', filters.status)
  if (filters.type) params.set('type', filters.type)
  if (filters.requiresReview) params.set('requiresReview', 'true')
  if (filters.artisanId) params.set('artisanId', filters.artisanId)
  if (filters.search) params.set('search', filters.search)
  
  const url = `/api/admin/payouts${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch payouts')
  }
  
  return response.json()
}

/**
 * Fetch single payout details
 */
async function fetchPayoutDetail(id: string): Promise<AdminPayout> {
  const response = await fetch(`/api/admin/payouts/${id}`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch payout')
  }
  
  return response.json()
}

/**
 * Execute payout action
 */
async function executePayoutAction(params: PayoutActionParams): Promise<PayoutActionResponse> {
  const { id, ...body } = params
  const response = await fetch(`/api/admin/payouts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to execute action')
  }
  
  return response.json()
}

/**
 * Hook for fetching admin payouts
 */
export function useAdminPayouts(filters: PayoutFilters = {}) {
  return useQuery({
    queryKey: adminPayoutsKeys.list(filters),
    queryFn: () => fetchAdminPayouts(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook for fetching single payout details
 */
export function usePayoutDetail(id: string) {
  return useQuery({
    queryKey: adminPayoutsKeys.detail(id),
    queryFn: () => fetchPayoutDetail(id),
    enabled: !!id,
  })
}

/**
 * Hook for payout actions (retry, cancel, markComplete, addNotes, clearReview)
 */
export function usePayoutAction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: executePayoutAction,
    onSuccess: (data, variables) => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: adminPayoutsKeys.all })
      // Update detail cache
      queryClient.setQueryData(adminPayoutsKeys.detail(variables.id), data.payout)
    },
  })
}

// Utility functions
export function formatPayoutCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPayoutDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getPayoutStatusConfig(status: PayoutStatus): {
  label: string
  color: string
  bgColor: string
} {
  const config: Record<PayoutStatus, { label: string; color: string; bgColor: string }> = {
    PENDING: {
      label: 'Pending',
      color: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    PROCESSING: {
      label: 'Processing',
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    COMPLETED: {
      label: 'Completed',
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    FAILED: {
      label: 'Failed',
      color: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    CANCELLED: {
      label: 'Cancelled',
      color: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    },
  }
  return config[status] || config.PENDING
}

export function getPayoutTypeLabel(type: PayoutType): string {
  const labels: Record<PayoutType, string> = {
    DEPOSIT_SHARE: 'Deposit Share',
    FINAL_PAYMENT: 'Final Payment',
    REFUND: 'Refund',
    ADJUSTMENT: 'Adjustment',
  }
  return labels[type] || type
}

export function getArtisanDisplayName(artisan: PayoutArtisan): string {
  if (artisan.artisanProfile?.businessName) {
    return artisan.artisanProfile.businessName
  }
  return `${artisan.firstName} ${artisan.lastName}`
}
