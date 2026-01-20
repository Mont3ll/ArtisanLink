import { useQuery } from '@tanstack/react-query'

// Types
export interface AdminArtisan {
  id: string
  name: string
  email: string
  phone: string | null
  profession: string | null
  location: string | null
  experience: number
  rating: number
  totalReviews: number
  portfolioItems: number
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  isAvailable: boolean
  joinDate: string
  lastActive: string
  subscriptionStatus: 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
  subscriptionPlan: 'MONTHLY' | 'ANNUAL' | null
  subscriptionEndDate: string | null
}

export interface AdminArtisansStats {
  totalArtisans: number
  verifiedCount: number
  pendingCount: number
  activeSubscriptions: number
}

export interface AdminArtisansResponse {
  artisans: AdminArtisan[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: AdminArtisansStats
}

export interface AdminArtisansFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
  subscriptionStatus?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
}

// Query keys
export const adminArtisansKeys = {
  all: ['admin-artisans'] as const,
  lists: () => [...adminArtisansKeys.all, 'list'] as const,
  list: (filters: AdminArtisansFilters) => [...adminArtisansKeys.lists(), filters] as const,
}

// Fetch function
async function fetchAdminArtisans(filters: AdminArtisansFilters = {}): Promise<AdminArtisansResponse> {
  const params = new URLSearchParams()
  
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.subscriptionStatus) params.set('subscriptionStatus', filters.subscriptionStatus)

  const url = `/api/admin/artisans${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch artisans')
  }

  return response.json()
}

// Hook
export function useAdminArtisans(filters: AdminArtisansFilters = {}) {
  return useQuery({
    queryKey: adminArtisansKeys.list(filters),
    queryFn: () => fetchAdminArtisans(filters),
  })
}
