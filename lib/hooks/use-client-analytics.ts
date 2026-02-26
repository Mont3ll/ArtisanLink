'use client'

import { useQuery } from '@tanstack/react-query'

// Types
export interface ClientAnalyticsStats {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  cancelledJobs: number
  totalSpent: number
  averageJobValue: number
  reviewsGiven: number
  savedArtisans: number
  conversationsStarted: number
}

export interface SpendingTrendItem {
  month: string
  amount: number
}

export interface ClientAnalyticsData {
  stats: ClientAnalyticsStats
  statusBreakdown: Record<string, number>
  categorySpending: Record<string, number>
  spendingTrend: SpendingTrendItem[]
}

// Query keys
export const clientAnalyticsKeys = {
  all: ['client-analytics'] as const,
  data: (range?: string) => [...clientAnalyticsKeys.all, 'data', range ?? '30d'] as const,
}

// Fetch function
async function fetchClientAnalytics(range: string): Promise<ClientAnalyticsData> {
  const response = await fetch(`/api/client/analytics?range=${encodeURIComponent(range)}`)

  if (!response.ok) {
    throw new Error('Failed to fetch client analytics')
  }

  return response.json()
}

/**
 * Hook for fetching client analytics data
 * @param range - Time range: '7d', '30d', '90d', '1y' (default: '30d')
 */
export function useClientAnalytics(range: string = '30d') {
  return useQuery({
    queryKey: clientAnalyticsKeys.data(range),
    queryFn: () => fetchClientAnalytics(range),
  })
}

/**
 * Format a KES currency amount
 */
export function formatClientCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Human-readable labels for job statuses
 */
export const JOB_STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Requested',
  QUOTED: 'Quoted',
  ACCEPTED: 'Accepted',
  DEPOSIT_PAID: 'Deposit Paid',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  DECLINED: 'Declined',
  DISPUTED: 'Disputed',
}

/**
 * Color classes for job statuses (Tailwind bg colors)
 */
export const JOB_STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'bg-blue-500',
  QUOTED: 'bg-indigo-500',
  ACCEPTED: 'bg-emerald-500',
  DEPOSIT_PAID: 'bg-teal-500',
  IN_PROGRESS: 'bg-amber-500',
  COMPLETED: 'bg-green-600',
  PAID: 'bg-green-700',
  CANCELLED: 'bg-red-500',
  DECLINED: 'bg-gray-500',
  DISPUTED: 'bg-orange-600',
}
