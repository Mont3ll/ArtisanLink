import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface Artisan {
  id: string
  profileId: string
  name: string
  profession: string | null
  bio: string | null
  profileImage: string | null
  location: {
    city: string | null
    county: string | null
    latitude: number | null
    longitude: number | null
  }
  experience: number | null
  hourlyRate: number | null
  isAvailable: boolean
  isVerified: boolean
  rating: {
    average: number
    total: number
  }
  specializations: Array<{ name: string; skillLevel: number }>
  memberSince: string
  distance: number | null
}

export interface SearchFacets {
  professions: Array<{ name: string | null; count: number }>
  counties: Array<{ name: string | null; count: number }>
  specializations: Array<{ name: string; count: number }>
}

export interface SearchPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ArtisanSearchResponse {
  artisans: Artisan[]
  facets: SearchFacets
  pagination: SearchPagination
}

export interface SearchFilters {
  query?: string
  profession?: string
  county?: string
  minRating?: string
  available?: boolean
  verified?: boolean
  sortBy?: string
  page?: number
  limit?: number
}

export interface SearchHistoryItem {
  id: string
  query: string | null
  profession: string | null
  location: string | null
  minRating: number | null
  resultCount: number | null
  createdAt: string
}

// Query keys
export const artisanSearchKeys = {
  all: ['artisan-search'] as const,
  search: (filters: SearchFilters) => [...artisanSearchKeys.all, 'results', filters] as const,
  history: () => [...artisanSearchKeys.all, 'history'] as const,
  saved: () => [...artisanSearchKeys.all, 'saved'] as const,
}

// Build search params from filters
function buildSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.profession) params.set('profession', filters.profession)
  if (filters.county) params.set('county', filters.county)
  if (filters.minRating) params.set('minRating', filters.minRating)
  if (filters.available) params.set('available', 'true')
  if (filters.verified) params.set('verified', 'true')
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  params.set('page', String(filters.page ?? 1))
  params.set('limit', String(filters.limit ?? 12))
  return params
}

// Search artisans
async function searchArtisans(filters: SearchFilters): Promise<ArtisanSearchResponse> {
  const params = buildSearchParams(filters)
  const response = await fetch(`/api/search/artisans?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch artisans')
  }
  return response.json()
}

// Fetch search history
async function fetchSearchHistory(limit = 10): Promise<SearchHistoryItem[]> {
  const response = await fetch(`/api/client/search-history?limit=${limit}&unique=true`)
  if (!response.ok) {
    throw new Error('Failed to fetch search history')
  }
  const data = await response.json()
  return data.items
}

// Fetch saved artisan IDs
async function fetchSavedArtisanIds(): Promise<Set<string>> {
  const response = await fetch('/api/client/saved-artisans?limit=100')
  if (!response.ok) {
    throw new Error('Failed to fetch saved artisans')
  }
  const data = await response.json()
  return new Set(
    data.items.map((item: { artisan: { profileId: string } }) => item.artisan.profileId)
  )
}

/**
 * Hook to search artisans with filters
 */
export function useArtisanSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: artisanSearchKeys.search(filters),
    queryFn: () => searchArtisans(filters),
  })
}

/**
 * Hook to fetch search history
 */
export function useSearchHistory(limit = 10) {
  return useQuery({
    queryKey: artisanSearchKeys.history(),
    queryFn: () => fetchSearchHistory(limit),
  })
}

/**
 * Hook to fetch saved artisan IDs
 */
export function useSavedArtisanIds() {
  return useQuery({
    queryKey: artisanSearchKeys.saved(),
    queryFn: fetchSavedArtisanIds,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to toggle save/unsave artisan
 */
export function useToggleSaveArtisan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ profileId, isSaved }: { profileId: string; isSaved: boolean }) => {
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/client/saved-artisans?profileId=${profileId}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to unsave artisan')
      } else {
        // Save
        const response = await fetch('/api/client/saved-artisans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId }),
        })
        if (!response.ok) throw new Error('Failed to save artisan')
      }
      return { profileId, isSaved: !isSaved }
    },
    onMutate: async ({ profileId, isSaved }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: artisanSearchKeys.saved() })
      const previousSaved = queryClient.getQueryData<Set<string>>(artisanSearchKeys.saved())
      
      queryClient.setQueryData<Set<string>>(artisanSearchKeys.saved(), (old) => {
        const newSet = new Set(old)
        if (isSaved) {
          newSet.delete(profileId)
        } else {
          newSet.add(profileId)
        }
        return newSet
      })
      
      return { previousSaved }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousSaved) {
        queryClient.setQueryData(artisanSearchKeys.saved(), context.previousSaved)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: artisanSearchKeys.saved() })
    },
  })
}

/**
 * Hook to record a search to history
 */
export function useRecordSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      query?: string
      profession?: string
      location?: string
      minRating?: number
      resultCount: number
    }) => {
      const response = await fetch('/api/client/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!response.ok) throw new Error('Failed to record search')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artisanSearchKeys.history() })
    },
  })
}

/**
 * Hook to clear search history
 */
export function useClearSearchHistory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/client/search-history', { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to clear search history')
    },
    onSuccess: () => {
      queryClient.setQueryData(artisanSearchKeys.history(), [])
    },
  })
}

/**
 * Hook to delete a search history item
 */
export function useDeleteSearchHistoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/client/search-history?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete search history item')
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: artisanSearchKeys.history() })
      const previousHistory = queryClient.getQueryData<SearchHistoryItem[]>(artisanSearchKeys.history())
      
      queryClient.setQueryData<SearchHistoryItem[]>(artisanSearchKeys.history(), (old) => 
        old?.filter((item) => item.id !== id) ?? []
      )
      
      return { previousHistory }
    },
    onError: (_err, _id, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(artisanSearchKeys.history(), context.previousHistory)
      }
    },
  })
}
