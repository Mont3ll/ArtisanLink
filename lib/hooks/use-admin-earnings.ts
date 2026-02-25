/**
 * Admin Earnings Hook
 * 
 * React Query hook for fetching platform earnings data in the admin dashboard.
 */

import { useQuery } from '@tanstack/react-query'

// Query keys
export const adminEarningsKeys = {
  all: ['admin-earnings'] as const,
  list: (filters?: EarningsFilters) => [...adminEarningsKeys.all, 'list', filters] as const,
}

// Types
export interface EarningJob {
  id: string
  title: string
  agreedPrice: number | null
  client: {
    firstName: string
    lastName: string
  }
  artisan: {
    firstName: string
    lastName: string
    artisanProfile: {
      businessName: string | null
    } | null
  }
}

export interface PlatformEarning {
  id: string
  jobId: string
  artisanId: string
  jobValue: number
  commissionRate: number
  commissionAmount: number
  isPromotional: boolean
  createdAt: string
  job: EarningJob
}

export interface DailyEarning {
  total: number
  promotional: number
  standard: number
}

export interface EarningsStatistics {
  total: {
    commissionAmount: number
    jobValue: number
    count: number
    effectiveRate: number
  }
  promotional: {
    commissionAmount: number
    count: number
  }
  standard: {
    commissionAmount: number
    count: number
  }
  daily: Record<string, DailyEarning>
}

export interface EarningsResponse {
  earnings: PlatformEarning[]
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
  startDate?: string
  endDate?: string
  artisanId?: string
}

/**
 * Fetch admin earnings data
 */
async function fetchAdminEarnings(filters: EarningsFilters = {}): Promise<EarningsResponse> {
  const params = new URLSearchParams()
  
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.artisanId) params.set('artisanId', filters.artisanId)
  
  const url = `/api/admin/earnings${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch earnings')
  }
  
  return response.json()
}

/**
 * Hook for fetching admin earnings
 */
export function useAdminEarnings(filters: EarningsFilters = {}) {
  return useQuery({
    queryKey: adminEarningsKeys.list(filters),
    queryFn: () => fetchAdminEarnings(filters),
    staleTime: 60 * 1000, // 1 minute
  })
}

// Utility functions
export function formatEarningsCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatEarningsDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatEarningsDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

export function getEarningArtisanName(earning: PlatformEarning): string {
  const { artisan } = earning.job
  if (artisan.artisanProfile?.businessName) {
    return artisan.artisanProfile.businessName
  }
  return `${artisan.firstName} ${artisan.lastName}`
}

export function getEarningClientName(earning: PlatformEarning): string {
  const { client } = earning.job
  return `${client.firstName} ${client.lastName}`
}

/**
 * Get daily earnings as sorted array for charts
 */
export function getDailyEarningsArray(daily: Record<string, DailyEarning>): Array<{
  date: string
  total: number
  promotional: number
  standard: number
}> {
  return Object.entries(daily)
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate period comparison
 */
export function calculateGrowth(current: number, previous: number): {
  value: number
  isPositive: boolean
  formatted: string
} {
  if (previous === 0) {
    return {
      value: current > 0 ? 100 : 0,
      isPositive: current > 0,
      formatted: current > 0 ? '+100%' : '0%',
    }
  }
  
  const growth = ((current - previous) / previous) * 100
  return {
    value: Math.abs(growth),
    isPositive: growth >= 0,
    formatted: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
  }
}
