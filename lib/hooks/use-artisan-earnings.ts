/**
 * Artisan Earnings Hook
 * 
 * React Query hook for fetching artisan earnings and payout data.
 */

import { useQuery } from '@tanstack/react-query'

// Query keys
export const artisanEarningsKeys = {
  all: ['artisan-earnings'] as const,
  list: (filters?: EarningsFilters) => [...artisanEarningsKeys.all, 'list', filters] as const,
}

// Types
export interface EarningsPayout {
  id: string
  type: 'DEPOSIT_SHARE' | 'FINAL_PAYMENT' | 'REFUND' | 'ADJUSTMENT'
  grossAmount: number
  commission: number
  netAmount: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  phoneNumber: string
  mpesaReceiptNumber: string | null
  mpesaTransactionId: string | null
  failureReason: string | null
  createdAt: string
  completedAt: string | null
  job: {
    id: string
    title: string
    agreedPrice: number | null
    client: {
      firstName: string
      lastName: string
    }
  } | null
}

export interface RecentPayout {
  id: string
  netAmount: number
  type: 'DEPOSIT_SHARE' | 'FINAL_PAYMENT' | 'REFUND' | 'ADJUSTMENT'
  completedAt: string | null
  mpesaReceiptNumber: string | null
  job: {
    title: string
  } | null
}

export interface EarningsStatistics {
  totalEarnings: {
    amount: number
    count: number
  }
  pendingPayouts: {
    amount: number
    count: number
  }
  thisMonth: {
    amount: number
    count: number
  }
  commission: {
    currentRate: number
    isPromotional: boolean
    remainingPromotionalJobs: number
    completedJobCount: number
  }
}

export interface EarningsResponse {
  payouts: EarningsPayout[]
  recentPayouts: RecentPayout[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  statistics: EarningsStatistics
}

export interface EarningsFilters {
  page?: number
  limit?: number
  status?: string
}

/**
 * Fetch artisan earnings data
 */
async function fetchArtisanEarnings(filters: EarningsFilters = {}): Promise<EarningsResponse> {
  const params = new URLSearchParams()
  
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())
  if (filters.status) params.set('status', filters.status)
  
  const url = `/api/artisan/earnings${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch earnings')
  }
  
  return response.json()
}

/**
 * Hook for fetching artisan earnings
 */
export function useArtisanEarnings(filters: EarningsFilters = {}) {
  return useQuery({
    queryKey: artisanEarningsKeys.list(filters),
    queryFn: () => fetchArtisanEarnings(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Utility functions
export function formatCurrency(amount: number): string {
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
  })
}

export function getPayoutStatusColor(status: EarningsPayout['status']): string {
  const colors: Record<EarningsPayout['status'], string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  }
  return colors[status] || colors.PENDING
}

export function getPayoutTypeLabel(type: EarningsPayout['type']): string {
  const labels: Record<EarningsPayout['type'], string> = {
    DEPOSIT_SHARE: 'Deposit',
    FINAL_PAYMENT: 'Final Payment',
    REFUND: 'Refund',
    ADJUSTMENT: 'Adjustment',
  }
  return labels[type] || type
}
