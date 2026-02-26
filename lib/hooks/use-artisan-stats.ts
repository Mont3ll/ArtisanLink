import { useQuery } from '@tanstack/react-query'

// Types
export interface ArtisanStats {
  profileViews: number
  totalProjects: number
  totalReviews: number
  averageRating: number
  unreadMessages: number
  subscriptionStatus: string
  subscriptionEndDate?: string
  isVerified: boolean
  isAvailable: boolean
  totalConversations?: number
  newConversationsThisMonth?: number
  totalSpecializations?: number
}

export interface ArtisanRecentActivity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  icon: string
}

export interface ArtisanProfile {
  bio: string | null
  profileImage: string | null
  profession: string | null
  experience: number | null
  hourlyRate: number | null
  latitude: number | null
  longitude: number | null
  address: string | null
  city: string | null
  county: string | null
  certificateUrl: string | null
  isAvailable: boolean
  artisanStatus: string | null
  rejectionReason: string | null
  portfolioItems: { id: string }[]
  specializations: { id: string }[]
}

export interface ArtisanUser {
  firstName: string
  lastName: string
  email: string
}

export interface ArtisanDashboardData {
  stats: ArtisanStats
  recentActivity: ArtisanRecentActivity[]
  profile: ArtisanProfile | null
  user: ArtisanUser | null
}

// Default values for when API fails or user doesn't have artisan role
const defaultStats: ArtisanStats = {
  profileViews: 0,
  totalProjects: 0,
  totalReviews: 0,
  averageRating: 0,
  unreadMessages: 0,
  subscriptionStatus: 'INACTIVE',
  isVerified: false,
  isAvailable: false,
  totalConversations: 0,
  newConversationsThisMonth: 0,
  totalSpecializations: 0,
}

const defaultDashboardData: ArtisanDashboardData = {
  stats: defaultStats,
  recentActivity: [],
  profile: null,
  user: null,
}

// Query keys
export const artisanStatsKeys = {
  all: ['artisan-stats'] as const,
  dashboard: () => [...artisanStatsKeys.all, 'dashboard'] as const,
}

// Fetch artisan dashboard data
async function fetchArtisanDashboard(): Promise<ArtisanDashboardData> {
  try {
    const response = await fetch('/api/artisan/stats')
    
    // Handle 403 (wrong role) and 404 (user not found) gracefully
    if (response.status === 403 || response.status === 404) {
      console.warn('[useArtisanDashboard] User not authorized as artisan or not found, returning defaults')
      return defaultDashboardData
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Failed to fetch artisan data')
    }
    
    return response.json()
  } catch (error) {
    console.error('[useArtisanDashboard] Error fetching dashboard:', error)
    return defaultDashboardData
  }
}

/**
 * Hook to fetch artisan dashboard data (stats, activity, profile, user)
 */
export function useArtisanDashboard() {
  return useQuery({
    queryKey: artisanStatsKeys.dashboard(),
    queryFn: fetchArtisanDashboard,
    staleTime: 30000, // 30 seconds
    retry: 1, // Only retry once since 403/404 won't change
  })
}
