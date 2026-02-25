import { useQuery } from '@tanstack/react-query'

// Types
export interface ClientStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  savedArtisans: number
}

export interface RecentSearch {
  id: string
  query: string
  timestamp: string
  filters?: Record<string, unknown>
}

export interface ActiveProject {
  id: string
  artisan: string
  service: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  location: string
}

export interface SavedArtisan {
  id: string
  name: string
  profession: string
  rating: number
  location: string
  avatar?: string
}

export interface ClientDashboardData {
  stats: ClientStats
  recentSearches: RecentSearch[]
  activeProjects: ActiveProject[]
  savedArtisans: SavedArtisan[]
}

// Query keys
export const clientDashboardKeys = {
  all: ['client-dashboard'] as const,
  stats: () => [...clientDashboardKeys.all, 'stats'] as const,
  searches: () => [...clientDashboardKeys.all, 'searches'] as const,
  projects: () => [...clientDashboardKeys.all, 'projects'] as const,
  saved: () => [...clientDashboardKeys.all, 'saved'] as const,
}

// Default empty stats
const defaultStats: ClientStats = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  savedArtisans: 0,
}

// Fetch functions
async function fetchClientStats(): Promise<ClientStats> {
  const response = await fetch('/api/client/stats')
  if (!response.ok) {
    // Return empty stats if API fails (user might not be synced yet)
    return defaultStats
  }
  const data = await response.json()
  
  // Map API response to expected format
  return {
    totalProjects: data.stats?.reviewsGiven ?? 0,
    activeProjects: data.stats?.activeConversations ?? 0,
    completedProjects: data.stats?.reviewsGiven ?? 0,
    savedArtisans: data.stats?.savedArtisans ?? 0,
  }
}

async function fetchRecentSearches(): Promise<RecentSearch[]> {
  const response = await fetch('/api/client/search-history?limit=3')
  if (!response.ok) {
    // Return empty array if API fails
    return []
  }
  const data = await response.json()
  
  // Transform API response to expected format
  const items = data.items || []
  return items.map((item: {
    id: string
    query?: string
    profession?: string
    location?: string
    createdAt: string
  }) => ({
    id: item.id,
    query: item.query || item.profession || item.location || 'Search',
    timestamp: formatRelativeTime(item.createdAt),
    filters: {},
  }))
}

async function fetchActiveProjects(): Promise<ActiveProject[]> {
  // Note: There's no /api/client/projects endpoint yet
  // Return empty array - projects are tracked via conversations/reviews
  return []
}

async function fetchSavedArtisans(): Promise<SavedArtisan[]> {
  const response = await fetch('/api/client/saved-artisans?limit=3')
  if (!response.ok) {
    // Return empty array if API fails
    return []
  }
  const data = await response.json()
  
  // Transform API response to expected format
  const items = data.items || []
  return items.map((item: {
    id: string
    artisan: {
      id: string
      name: string
      profession?: string
      rating?: { average: number }
      location?: { city?: string }
      profileImage?: string
    }
  }) => ({
    id: item.id,
    name: item.artisan.name,
    profession: item.artisan.profession || 'Artisan',
    rating: item.artisan.rating?.average || 0,
    location: item.artisan.location?.city || 'Kenya',
    avatar: item.artisan.profileImage,
  }))
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  return date.toLocaleDateString()
}

// Hooks - separate queries for independent loading
export function useClientStats() {
  return useQuery({
    queryKey: clientDashboardKeys.stats(),
    queryFn: fetchClientStats,
    retry: 1, // Only retry once
    staleTime: 30000, // Consider data fresh for 30 seconds
  })
}

export function useRecentSearches() {
  return useQuery({
    queryKey: clientDashboardKeys.searches(),
    queryFn: fetchRecentSearches,
    retry: 1,
    staleTime: 30000,
  })
}

export function useActiveProjects() {
  return useQuery({
    queryKey: clientDashboardKeys.projects(),
    queryFn: fetchActiveProjects,
    retry: 1,
    staleTime: 30000,
  })
}

export function useSavedArtisans() {
  return useQuery({
    queryKey: clientDashboardKeys.saved(),
    queryFn: fetchSavedArtisans,
    retry: 1,
    staleTime: 30000,
  })
}
