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

// Fetch functions
async function fetchClientStats(): Promise<ClientStats> {
  const response = await fetch('/api/client/stats')
  if (!response.ok) {
    // Return mock data for now if API doesn't exist
    return {
      totalProjects: 12,
      activeProjects: 2,
      completedProjects: 10,
      savedArtisans: 8,
    }
  }
  return response.json()
}

async function fetchRecentSearches(): Promise<RecentSearch[]> {
  const response = await fetch('/api/client/search-history?limit=3')
  if (!response.ok) {
    // Return mock data if API fails
    return [
      { id: '1', query: 'Carpenter in Nairobi', timestamp: '2 hours ago' },
      { id: '2', query: 'Electrician near me', timestamp: '1 day ago' },
      { id: '3', query: 'Plumber in Mombasa', timestamp: '3 days ago' },
    ]
  }
  const data = await response.json()
  return data.searches || []
}

async function fetchActiveProjects(): Promise<ActiveProject[]> {
  const response = await fetch('/api/client/projects?status=active&limit=3')
  if (!response.ok) {
    // Return mock data if API fails
    return [
      {
        id: '1',
        artisan: 'John Kamau',
        service: 'Kitchen Cabinet Installation',
        status: 'IN_PROGRESS',
        startDate: '2024-08-25',
        location: 'Nairobi',
      },
      {
        id: '2',
        artisan: 'Mary Wanjiku',
        service: 'House Painting',
        status: 'SCHEDULED',
        startDate: '2024-09-01',
        location: 'Kiambu',
      },
    ]
  }
  const data = await response.json()
  return data.projects || []
}

async function fetchSavedArtisans(): Promise<SavedArtisan[]> {
  const response = await fetch('/api/client/saved-artisans?limit=3')
  if (!response.ok) {
    // Return mock data if API fails
    return [
      {
        id: '1',
        name: 'Peter Ochieng',
        profession: 'Electrician',
        rating: 4.9,
        location: 'Nairobi',
      },
      {
        id: '2',
        name: 'Grace Muthoni',
        profession: 'Tailor',
        rating: 4.8,
        location: 'Mombasa',
      },
    ]
  }
  const data = await response.json()
  return data.artisans || []
}

// Hooks - separate queries for independent loading
export function useClientStats() {
  return useQuery({
    queryKey: clientDashboardKeys.stats(),
    queryFn: fetchClientStats,
  })
}

export function useRecentSearches() {
  return useQuery({
    queryKey: clientDashboardKeys.searches(),
    queryFn: fetchRecentSearches,
  })
}

export function useActiveProjects() {
  return useQuery({
    queryKey: clientDashboardKeys.projects(),
    queryFn: fetchActiveProjects,
  })
}

export function useSavedArtisans() {
  return useQuery({
    queryKey: clientDashboardKeys.saved(),
    queryFn: fetchSavedArtisans,
  })
}
