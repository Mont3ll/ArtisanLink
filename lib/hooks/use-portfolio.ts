import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface PortfolioItem {
  id: string
  title: string
  description: string | null
  imageUrl: string
  imageUrls: string[]
  category: string | null
  tags: string[]
  completedAt: string | null
  duration: string | null
  cost: number | null
  isPublic: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface PortfolioResponse {
  items: PortfolioItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PortfolioFilters {
  page?: number
  limit?: number
  category?: string
}

// Query keys
export const portfolioKeys = {
  all: ['portfolio'] as const,
  lists: () => [...portfolioKeys.all, 'list'] as const,
  list: (filters: PortfolioFilters) => [...portfolioKeys.lists(), filters] as const,
  detail: (id: string) => [...portfolioKeys.all, 'detail', id] as const,
}

// Fetch portfolio items
async function fetchPortfolio(filters: PortfolioFilters): Promise<PortfolioResponse> {
  const params = new URLSearchParams()
  params.set('page', String(filters.page ?? 1))
  params.set('limit', String(filters.limit ?? 12))
  if (filters.category && filters.category !== 'all') {
    params.set('category', filters.category)
  }

  const response = await fetch(`/api/artisan/portfolio?${params.toString()}`)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch portfolio')
  }
  return response.json()
}

/**
 * Hook to fetch portfolio items with pagination and filtering
 */
export function usePortfolio(filters: PortfolioFilters = {}) {
  return useQuery({
    queryKey: portfolioKeys.list(filters),
    queryFn: () => fetchPortfolio(filters),
  })
}

/**
 * Hook to fetch a single portfolio item
 */
export function usePortfolioItem(id: string) {
  return useQuery({
    queryKey: portfolioKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/artisan/portfolio/${id}`)
      if (!response.ok) throw new Error('Failed to fetch portfolio item')
      return response.json() as Promise<PortfolioItem>
    },
    enabled: !!id,
  })
}

/**
 * Hook to delete a portfolio item
 */
export function useDeletePortfolioItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/artisan/portfolio/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete portfolio item')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() })
    },
  })
}

/**
 * Hook to create a portfolio item
 */
export function useCreatePortfolioItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<PortfolioItem>) => {
      const response = await fetch('/api/artisan/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create portfolio item')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() })
    },
  })
}

/**
 * Hook to update a portfolio item
 */
export function useUpdatePortfolioItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PortfolioItem> }) => {
      const response = await fetch(`/api/artisan/portfolio/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update portfolio item')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() })
      queryClient.invalidateQueries({ queryKey: portfolioKeys.detail(variables.id) })
    },
  })
}
