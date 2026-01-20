import { useQuery } from '@tanstack/react-query'

// Types
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'CLIENT' | 'ARTISAN' | 'ADMIN'
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  createdAt: string
  lastLoginAt?: string
  profile?: {
    city?: string
    profession?: string
    artisanStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'
    isAvailable?: boolean
    averageRating?: number
    totalReviews?: number
  }
}

interface UserStats {
  totalUsers: number
  totalClients: number
  totalArtisans: number
  activeUsers: number
  pendingUsers: number
  suspendedUsers: number
  newUsersThisMonth: number
  growthRate: number
}

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, string>) => [...userKeys.lists(), filters] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
}

// Fetch functions
async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/admin/users/all')
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return response.json()
}

async function fetchUserStats(): Promise<UserStats> {
  const response = await fetch('/api/admin/users/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch user stats')
  }
  return response.json()
}

// Hooks
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: fetchUsers,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: fetchUserStats,
  })
}

// Re-export types for use in components
export type { User, UserStats }
