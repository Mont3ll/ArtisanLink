import { useQuery } from '@tanstack/react-query'

// Types
export interface Review {
  id: string
  rating: number
  comment: string | null
  projectTitle: string | null
  projectCost: number | null
  createdAt: string
  client: {
    name: string
  }
}

export interface ArtisanInfo {
  id: string
  profileId: string
  name: string
  profession: string | null
  averageRating: number | null
  totalReviews: number
}

export interface ReviewsResponse {
  artisan: ArtisanInfo | null
  reviews: Review[]
  ratingBreakdown: Record<number, number>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseArtisanReviewsOptions {
  page?: number
  limit?: number
  sortBy?: 'recent' | 'highest' | 'lowest'
}

// Default values
const defaultReviewsResponse: ReviewsResponse = {
  artisan: null,
  reviews: [],
  ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
}

// Query keys
export const artisanReviewKeys = {
  all: ['artisan-reviews'] as const,
  profile: () => [...artisanReviewKeys.all, 'profile'] as const,
  reviews: (options: UseArtisanReviewsOptions) => [...artisanReviewKeys.all, 'list', options] as const,
}

// Fetch functions
async function fetchArtisanProfile() {
  try {
    const response = await fetch('/api/artisan/profile')
    if (response.status === 403 || response.status === 404) {
      console.warn('[useArtisanProfile] User not authorized or not found, returning null')
      return { profile: null }
    }
    if (!response.ok) {
      throw new Error('Failed to fetch artisan profile')
    }
    return response.json()
  } catch (error) {
    console.error('[useArtisanProfile] Error fetching profile:', error)
    return { profile: null }
  }
}

async function fetchArtisanReviews(
  profileId: string,
  options: UseArtisanReviewsOptions
): Promise<ReviewsResponse> {
  try {
    const params = new URLSearchParams({
      page: (options.page || 1).toString(),
      limit: (options.limit || 20).toString(),
      sortBy: options.sortBy || 'recent',
    })

    const response = await fetch(`/api/artisans/${profileId}/reviews?${params.toString()}`)
    if (response.status === 403 || response.status === 404) {
      console.warn('[useArtisanReviews] Not authorized or not found, returning defaults')
      return defaultReviewsResponse
    }
    if (!response.ok) {
      throw new Error('Failed to fetch reviews')
    }
    return response.json()
  } catch (error) {
    console.error('[useArtisanReviews] Error fetching reviews:', error)
    return defaultReviewsResponse
  }
}

// Hooks
export function useArtisanProfile() {
  return useQuery({
    queryKey: artisanReviewKeys.profile(),
    queryFn: fetchArtisanProfile,
    staleTime: 30000,
    retry: 1,
  })
}

export function useArtisanReviews(options: UseArtisanReviewsOptions = {}) {
  const { data: profileData } = useArtisanProfile()

  return useQuery({
    queryKey: artisanReviewKeys.reviews(options),
    queryFn: () => fetchArtisanReviews(profileData?.profile?.id, options),
    enabled: !!profileData?.profile?.id,
    staleTime: 30000,
    retry: 1,
  })
}
