import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface ClientReviewProfile {
  id: string
  profession: string | null
  profileImage: string | null
  user: {
    firstName: string
    lastName: string
  }
}

export interface ClientReview {
  id: string
  profileId: string
  clientId: string
  rating: number
  comment: string | null
  projectTitle: string | null
  projectCost: number | null
  isApproved: boolean
  isHidden: boolean
  createdAt: string
  updatedAt: string
  profile: ClientReviewProfile
  client: {
    firstName: string
    lastName: string
  }
}

export interface ClientReviewsResponse {
  reviews: ClientReview[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ClientReviewsFilters {
  page?: number
  limit?: number
}

export interface CreateReviewData {
  profileId: string
  rating: number
  comment?: string
  projectTitle?: string
  projectCost?: number
}

export interface UpdateReviewData {
  rating: number
  comment?: string
  projectTitle?: string
  projectCost?: number
}

// Default values
const defaultReviewsResponse: ClientReviewsResponse = {
  reviews: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
}

// Query keys
export const clientReviewsKeys = {
  all: ['client-reviews'] as const,
  lists: () => [...clientReviewsKeys.all, 'list'] as const,
  list: (filters: ClientReviewsFilters) => [...clientReviewsKeys.lists(), filters] as const,
}

// Fetch functions
async function fetchClientReviews(filters: ClientReviewsFilters = {}): Promise<ClientReviewsResponse> {
  try {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', filters.page.toString())
    if (filters.limit) params.set('limit', filters.limit.toString())

    const url = `/api/reviews${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)

    // Handle 403/404 gracefully
    if (response.status === 403 || response.status === 404) {
      console.warn('[useClientReviews] User not authorized or not found, returning defaults')
      return defaultReviewsResponse
    }

    if (!response.ok) {
      throw new Error('Failed to fetch reviews')
    }

    return response.json()
  } catch (error) {
    console.error('[useClientReviews] Error fetching reviews:', error)
    return defaultReviewsResponse
  }
}

async function createReview(data: CreateReviewData): Promise<ClientReview> {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create review')
  }

  return response.json()
}

async function updateReview({ id, data }: { id: string; data: UpdateReviewData }): Promise<ClientReview> {
  const response = await fetch(`/api/reviews/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update review')
  }

  return response.json()
}

async function deleteReview(id: string): Promise<void> {
  const response = await fetch(`/api/reviews/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete review')
  }
}

// Hooks
export function useClientReviews(filters: ClientReviewsFilters = {}) {
  return useQuery({
    queryKey: clientReviewsKeys.list(filters),
    queryFn: () => fetchClientReviews(filters),
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientReviewsKeys.all })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientReviewsKeys.all })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteReview,
    onMutate: async (deletedId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: clientReviewsKeys.all })

      // Get current data snapshots
      const previousData = queryClient.getQueriesData({ queryKey: clientReviewsKeys.lists() })

      // Optimistically update all matching queries
      queryClient.setQueriesData(
        { queryKey: clientReviewsKeys.lists() },
        (old: ClientReviewsResponse | undefined) => {
          if (!old) return old
          return {
            ...old,
            reviews: old.reviews.filter((r) => r.id !== deletedId),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
            },
          }
        }
      )

      return { previousData }
    },
    onError: (_err, _deletedId, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientReviewsKeys.all })
    },
  })
}
