'use client'

import { useQuery, useMutation } from '@tanstack/react-query'

// Types
export interface UserSearchResult {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  profileImage?: string | null
}

export interface ArtisanSearchResult {
  id: string
  name: string
  email: string
  profession: string | null
  status: string
  isVerified: boolean
  rating: number
  totalReviews: number
  county: string | null
  hourlyRate: number | null
}

export interface ActivitySearchResult {
  id: string
  action: string
  details: string | null
  timestamp: string
  type: string
  adminEmail: string
}

export interface SearchResults {
  users: UserSearchResult[]
  artisans: ArtisanSearchResult[]
  activities: ActivitySearchResult[]
}

export interface SearchCounts {
  users: number
  artisans: number
  activities: number
  total: number
}

export interface AdminSearchData {
  results: SearchResults
  counts: SearchCounts
  query: string
  type: string
}

export interface AdminSearchFilters {
  query?: string
  type?: 'all' | 'users' | 'artisans' | 'activities'
  limit?: number
}

// Query keys
export const adminSearchKeys = {
  all: ['admin-search'] as const,
  search: (filters: AdminSearchFilters) => [...adminSearchKeys.all, filters] as const,
}

// Fetch function
async function performSearch(filters: AdminSearchFilters): Promise<AdminSearchData> {
  const params = new URLSearchParams()
  if (filters.query?.trim()) {
    params.set('q', filters.query.trim())
  }
  if (filters.type && filters.type !== 'all') {
    params.set('type', filters.type)
  }
  params.set('limit', (filters.limit || 20).toString())
  
  const response = await fetch(`/api/admin/search?${params}`)
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to search')
  }
  
  return response.json()
}

/**
 * Hook for performing admin search
 * Returns search results and mutation to trigger new searches
 */
export function useAdminSearch(filters: AdminSearchFilters, enabled = false) {
  return useQuery({
    queryKey: adminSearchKeys.search(filters),
    queryFn: () => performSearch(filters),
    enabled,
  })
}

/**
 * Hook for triggering admin search manually
 */
export function useAdminSearchMutation() {
  return useMutation({
    mutationFn: performSearch,
  })
}

// Utility functions
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'VERIFIED':
    case 'ACTIVE':
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'SUSPENDED':
      return 'bg-orange-100 text-orange-800'
    case 'BANNED':
      return 'bg-red-100 text-red-800'
    default:
      return ''
  }
}

export function formatKESCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const QUICK_SEARCHES = [
  { label: 'Verified Artisans', query: 'verified' },
  { label: 'Recent Activities', query: '' },
  { label: 'System Settings', query: 'settings' },
  { label: 'Trending', query: '' },
] as const
