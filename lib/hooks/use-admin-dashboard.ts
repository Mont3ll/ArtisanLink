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

// Query keys
export const adminDashboardKeys = {
  all: ['admin-dashboard'] as const,
  stats: () => [...adminDashboardKeys.all, 'stats'] as const,
  tasks: () => [...adminDashboardKeys.all, 'tasks'] as const,
  recentUsers: () => [...adminDashboardKeys.all, 'recent-users'] as const,
}

// Fetch admin stats
async function fetchAdminStats(): Promise<AdminStats> {
  // TODO: Remove this artificial delay after testing skeleton animations
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const response = await fetch('/api/admin/stats')
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `Failed to fetch stats: ${response.statusText}`)
  }
  return response.json()
}

// Fetch system tasks
async function fetchSystemTasks(): Promise<SystemTasks> {
  const response = await fetch('/api/admin/tasks')
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `Failed to fetch tasks: ${response.statusText}`)
  }
  return response.json()
}

// Fetch recent users
async function fetchRecentUsers(): Promise<RecentUser[]> {
  const response = await fetch('/api/admin/users')
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `Failed to fetch users: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Hook to fetch admin dashboard stats
 */
export function useAdminStats() {
  return useQuery({
    queryKey: adminDashboardKeys.stats(),
    queryFn: fetchAdminStats,
  })
}

/**
 * Hook to fetch system tasks (pending verifications, activity, alerts)
 */
export function useSystemTasks() {
  return useQuery({
    queryKey: adminDashboardKeys.tasks(),
    queryFn: fetchSystemTasks,
  })
}

/**
 * Hook to fetch recent users
 */
export function useRecentUsers() {
  return useQuery({
    queryKey: adminDashboardKeys.recentUsers(),
    queryFn: fetchRecentUsers,
  })
}
