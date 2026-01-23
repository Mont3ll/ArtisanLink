import { useQuery } from '@tanstack/react-query'

// Types
export interface AdminStats {
  totalUsers: number
  totalArtisans: number
  activeArtisans: number
  pendingVerifications: number
  activeSubscriptions: number
  monthlyRevenue: number
  monthlyGrowth: number
  systemUptime: number
  totalReviews: number
}

export interface PendingVerification {
  id: string
  name: string
  email: string
  profession: string
  location: string
  submittedAt: string
  certificateUrl?: string
}

export interface RecentActivity {
  id: string
  type: 'user_joined' | 'subscription_paid' | 'review_submitted' | 'message_sent'
  description: string
  user: string
  timestamp: string
  status: 'completed' | 'pending' | 'failed'
}

export interface SystemAlert {
  id: string
  title: string
  type: 'error' | 'warning' | 'info'
  description: string
  timestamp: string
  resolved: boolean
}

export interface SystemTasks {
  pendingVerifications: PendingVerification[]
  recentActivity: RecentActivity[]
  systemAlerts: SystemAlert[]
}

export interface RecentUser {
  id: string
  user: string
  email: string
  role: string
  status: string
  location: string
  joinDate: string
  profession: string | null
  portfolioItems: number
}

// Default values
const defaultStats: AdminStats = {
  totalUsers: 0,
  totalArtisans: 0,
  activeArtisans: 0,
  pendingVerifications: 0,
  activeSubscriptions: 0,
  monthlyRevenue: 0,
  monthlyGrowth: 0,
  systemUptime: 100,
  totalReviews: 0,
}

const defaultTasks: SystemTasks = {
  pendingVerifications: [],
  recentActivity: [],
  systemAlerts: [],
}

// Query keys
export const adminDashboardKeys = {
  all: ['admin-dashboard'] as const,
  stats: () => [...adminDashboardKeys.all, 'stats'] as const,
  tasks: () => [...adminDashboardKeys.all, 'tasks'] as const,
  recentUsers: () => [...adminDashboardKeys.all, 'recent-users'] as const,
}

// Fetch admin stats
async function fetchAdminStats(): Promise<AdminStats> {
  try {
    const response = await fetch('/api/admin/stats')
    
    // Handle 403 (wrong role) and 404 (user not found) gracefully
    if (response.status === 403 || response.status === 404) {
      console.warn('[useAdminStats] User not authorized as admin or not found, returning defaults')
      return defaultStats
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Failed to fetch stats: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('[useAdminStats] Error fetching stats:', error)
    return defaultStats
  }
}

// Fetch system tasks
async function fetchSystemTasks(): Promise<SystemTasks> {
  try {
    const response = await fetch('/api/admin/tasks')
    
    if (response.status === 403 || response.status === 404) {
      console.warn('[useSystemTasks] User not authorized as admin or not found, returning defaults')
      return defaultTasks
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Failed to fetch tasks: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('[useSystemTasks] Error fetching tasks:', error)
    return defaultTasks
  }
}

// Fetch recent users
async function fetchRecentUsers(): Promise<RecentUser[]> {
  try {
    const response = await fetch('/api/admin/users')
    
    if (response.status === 403 || response.status === 404) {
      console.warn('[useRecentUsers] User not authorized as admin or not found, returning empty array')
      return []
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Failed to fetch users: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('[useRecentUsers] Error fetching users:', error)
    return []
  }
}

/**
 * Hook to fetch admin dashboard stats
 */
export function useAdminStats() {
  return useQuery({
    queryKey: adminDashboardKeys.stats(),
    queryFn: fetchAdminStats,
    staleTime: 30000,
    retry: 1,
  })
}

/**
 * Hook to fetch system tasks (pending verifications, activity, alerts)
 */
export function useSystemTasks() {
  return useQuery({
    queryKey: adminDashboardKeys.tasks(),
    queryFn: fetchSystemTasks,
    staleTime: 30000,
    retry: 1,
  })
}

/**
 * Hook to fetch recent users
 */
export function useRecentUsers() {
  return useQuery({
    queryKey: adminDashboardKeys.recentUsers(),
    queryFn: fetchRecentUsers,
    staleTime: 30000,
    retry: 1,
  })
}
