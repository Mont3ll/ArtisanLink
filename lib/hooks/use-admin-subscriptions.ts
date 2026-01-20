import { useQuery } from '@tanstack/react-query'

// Types
export interface SubscriptionStat {
  status: string
  plan: string
  count: number
  revenue: number
}

export interface SubscriptionUser {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
}

export interface SubscriptionProfile {
  user: SubscriptionUser
}

export interface Subscription {
  id: string
  plan: string
  status: string
  amount: number
  createdAt: string
  profile: SubscriptionProfile
}

export interface SubscriptionMetrics {
  totalRevenue: number
  activeSubscriptions: number
  totalSubscriptions: number
}

export interface AdminSubscriptionsData {
  stats: SubscriptionStat[]
  recentSubscriptions: Subscription[]
  metrics: SubscriptionMetrics
}

// Query keys
export const adminSubscriptionsKeys = {
  all: ['admin-subscriptions'] as const,
  data: () => [...adminSubscriptionsKeys.all, 'data'] as const,
}

// Fetch subscription data
async function fetchSubscriptionData(): Promise<AdminSubscriptionsData> {
  const response = await fetch('/api/admin/subscriptions')
  
  if (!response.ok) {
    throw new Error('Failed to fetch subscription data')
  }
  
  return response.json()
}

/**
 * Hook to fetch admin subscription data including stats, recent subscriptions, and metrics
 */
export function useAdminSubscriptions() {
  return useQuery({
    queryKey: adminSubscriptionsKeys.data(),
    queryFn: fetchSubscriptionData,
  })
}

// Helper functions for formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function getStatusBadgeVariant(
  status: string
): 'default' | 'destructive' | 'secondary' | 'outline' {
  switch (status) {
    case 'ACTIVE':
      return 'default'
    case 'CANCELLED':
      return 'destructive'
    case 'PAST_DUE':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function getPlanBadgeVariant(
  plan: string
): 'default' | 'secondary' | 'outline' {
  switch (plan) {
    case 'PREMIUM':
      return 'default'
    case 'BASIC':
      return 'secondary'
    case 'PRO':
      return 'outline'
    default:
      return 'outline'
  }
}
