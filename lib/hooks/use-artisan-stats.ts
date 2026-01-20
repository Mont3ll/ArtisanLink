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
  profile: ArtisanProfile
  user: ArtisanUser
}

// Query keys
export const artisanStatsKeys = {
  all: ['artisan-stats'] as const,
  dashboard: () => [...artisanStatsKeys.all, 'dashboard'] as const,
}

// Fetch artisan dashboard data
async function fetchArtisanDashboard(): Promise<ArtisanDashboardData> {
  const response = await fetch('/api/artisan/stats')
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch artisan data')
  }
  return response.json()
}

/**
 * Hook to fetch artisan dashboard data (stats, activity, profile, user)
 */
export function useArtisanDashboard() {
  return useQuery({
    queryKey: artisanStatsKeys.dashboard(),
    queryFn: fetchArtisanDashboard,
  })
}
