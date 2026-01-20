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
  artisan: ArtisanInfo
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

// Query keys
export const artisanReviewKeys = {
  all: ['artisan-reviews'] as const,
  profile: () => [...artisanReviewKeys.all, 'profile'] as const,
  reviews: (options: UseArtisanReviewsOptions) => [...artisanReviewKeys.all, 'list', options] as const,
}

// Fetch functions
async function fetchArtisanProfile() {
  const response = await fetch('/api/artisan/profile')
  if (!response.ok) {
    throw new Error('Failed to fetch artisan profile')
  }
  return response.json()
}

async function fetchArtisanReviews(
  profileId: string,
  options: UseArtisanReviewsOptions
): Promise<ReviewsResponse> {
  const params = new URLSearchParams({
    page: (options.page || 1).toString(),
    limit: (options.limit || 20).toString(),
    sortBy: options.sortBy || 'recent',
  })

  const response = await fetch(`/api/artisans/${profileId}/reviews?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch reviews')
  }
  return response.json()
}

// Hooks
export function useArtisanProfile() {
  return useQuery({
    queryKey: artisanReviewKeys.profile(),
    queryFn: fetchArtisanProfile,
  })
}

export function useArtisanReviews(options: UseArtisanReviewsOptions = {}) {
  const { data: profileData } = useArtisanProfile()

  return useQuery({
    queryKey: artisanReviewKeys.reviews(options),
    queryFn: () => fetchArtisanReviews(profileData?.profile?.id, options),
    enabled: !!profileData?.profile?.id,
  })
}
