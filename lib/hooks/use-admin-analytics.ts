import { useQuery } from '@tanstack/react-query'

// Types
export interface UserGrowth {
  role: string
  count: number
}

export interface ProjectStats {
  total: number
  averageBudget: number
}

export interface RevenueData {
  month: string
  revenue: number
}

export interface AnalyticsMetrics {
  totalUsers: number
  totalProjects: number
  activeProjects: number
  completionRate: number
}

export interface AdminAnalyticsData {
  userGrowth: UserGrowth[]
  projectStats: ProjectStats
  revenueData: RevenueData[]
  metrics: AnalyticsMetrics
}

// Query keys
export const adminAnalyticsKeys = {
  all: ['admin-analytics'] as const,
  overview: () => [...adminAnalyticsKeys.all, 'overview'] as const,
}

// Fetch function
async function fetchAdminAnalytics(): Promise<AdminAnalyticsData> {
  const response = await fetch('/api/admin/analytics/overview')
  
  if (!response.ok) {
    throw new Error('Failed to fetch analytics data')
  }
  
  return response.json()
}

// Hook
export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminAnalyticsKeys.overview(),
    queryFn: fetchAdminAnalytics,
    staleTime: 1000 * 60 * 5, // 5 minutes - analytics data doesn't need frequent updates
  })
}
