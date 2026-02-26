import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface SavedArtisan {
  id: string
  savedAt: string
  artisan: {
    id: string
    profileId: string
    name: string
    profession: string | null
    bio: string | null
    profileImage: string | null
    location: {
      city: string | null
      county: string | null
    }
    experience: number | null
    hourlyRate: number | null
    isAvailable: boolean
    isVerified: boolean
    isPremium: boolean
    rating: {
      average: number
      total: number
    }
    specializations: Array<{ name: string; skillLevel: number }>
  }
}

export interface SavedArtisansResponse {
  items: SavedArtisan[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SavedArtisansFilters {
  page?: number
  limit?: number
  search?: string
}

// Query keys
export const savedArtisansKeys = {
  all: ['savedArtisans'] as const,
  lists: () => [...savedArtisansKeys.all, 'list'] as const,
  list: (filters: SavedArtisansFilters) => [...savedArtisansKeys.lists(), filters] as const,
}

// Fetch saved artisans
async function fetchSavedArtisans(filters: SavedArtisansFilters): Promise<SavedArtisansResponse> {
  const params = new URLSearchParams()
  params.set('page', String(filters.page ?? 1))
  params.set('limit', String(filters.limit ?? 12))

  const response = await fetch(`/api/client/saved-artisans?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch saved artisans')
  }
  return response.json()
}

/**
 * Hook to fetch saved artisans with pagination
 */
export function useSavedArtisansPage(filters: SavedArtisansFilters = {}) {
  return useQuery({
    queryKey: savedArtisansKeys.list(filters),
    queryFn: () => fetchSavedArtisans(filters),
  })
}

/**
 * Hook to remove a saved artisan
 */
export function useRemoveSavedArtisan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (artisanId: string) => {
      const response = await fetch(`/api/client/saved-artisans/${artisanId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to remove saved artisan')
      return response.json()
    },
    // Optimistic update
    onMutate: async (artisanId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: savedArtisansKeys.lists() })

      // Snapshot current data
      const previousData = queryClient.getQueriesData({ queryKey: savedArtisansKeys.lists() })

      // Optimistically remove from all cached lists
      queryClient.setQueriesData(
        { queryKey: savedArtisansKeys.lists() },
        (old: SavedArtisansResponse | undefined) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.filter((item) => item.artisan.id !== artisanId),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
            },
          }
        }
      )

      return { previousData }
    },
    onError: (_err, _artisanId, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: savedArtisansKeys.lists() })
    },
  })
}
