'use client'

import { useQuery } from '@tanstack/react-query'

// Types
export interface ArtisanAnalyticsStats {
  profileViews: number
  totalProjects: number
  totalReviews: number
  averageRating: number
  unreadMessages: number
  totalConversations: number
  newConversationsThisMonth: number
  totalSpecializations: number
}

export interface ArtisanAnalyticsReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  client: {
    firstName: string
    lastName: string
  }
}

export interface ArtisanAnalyticsProfile {
  totalReviews: number
  averageRating: number
  portfolioItems: { id: string }[]
  reviews: ArtisanAnalyticsReview[]
}

export interface ArtisanAnalyticsData {
  stats: ArtisanAnalyticsStats
  profile: ArtisanAnalyticsProfile
}

// Query keys
export const artisanAnalyticsKeys = {
  all: ['artisan-analytics'] as const,
  data: () => [...artisanAnalyticsKeys.all, 'data'] as const,
}

// Fetch function
async function fetchArtisanAnalytics(): Promise<ArtisanAnalyticsData> {
  const response = await fetch('/api/artisan/stats')
  
  if (!response.ok) {
    throw new Error('Failed to fetch analytics')
  }
  
  return response.json()
}

/**
 * Hook for fetching artisan analytics data
 * Uses the /api/artisan/stats endpoint
 */
export function useArtisanAnalytics() {
  return useQuery({
    queryKey: artisanAnalyticsKeys.data(),
    queryFn: fetchArtisanAnalytics,
  })
}

// Utility functions
export function getRatingDistribution(reviews: ArtisanAnalyticsReview[] | undefined): number[] {
  if (!reviews) return [0, 0, 0, 0, 0]
  const distribution = [0, 0, 0, 0, 0]
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating - 1]++
    }
  })
  return distribution
}

export function formatAnalyticsDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}
