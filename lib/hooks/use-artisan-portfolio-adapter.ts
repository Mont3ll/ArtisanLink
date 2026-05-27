/**
 * Artisan Portfolio Adapter
 * Maps real API PortfolioItem (from use-portfolio.ts) to the simplified
 * ArtisanPortfolioProject type used in source-admin-preview.tsx.
 */
import { usePortfolio } from './use-portfolio'
import type { PortfolioItem } from './use-portfolio'

export interface SourcePortfolioProject {
  id: string
  title: string
  category: string
  status: 'Published' | 'Draft' | 'Hidden'
  featured: boolean
  duration: string
  cost: string
  location: string
  description: string
  tags: string[]
  gradient: string
}

const DEFAULT_GRADIENT =
  'linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 42%, #047857 100%)'

const GRADIENT_MAP: Record<string, string> = {
  Carpentry: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 42%, #d97706 100%)',
  Plumbing: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 42%, #2563eb 100%)',
  Painting: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 42%, #db2777 100%)',
  Electrical: 'linear-gradient(135deg, #fefce8 0%, #fde047 42%, #ca8a04 100%)',
}

export function mapApiPortfolioItemToSource(
  item: PortfolioItem,
): SourcePortfolioProject {
  const cat = item.category ?? 'Uncategorized'
  return {
    id: item.id,
    title: item.title,
    category: cat,
    status: item.isPublic ? 'Published' : 'Draft',
    featured: item.isFeatured,
    duration: item.duration ?? '',
    cost: item.cost ? `KES ${item.cost.toLocaleString('en-KE')}` : '',
    location: '',
    description: item.description ?? '',
    tags: item.tags,
    gradient: GRADIENT_MAP[cat] ?? DEFAULT_GRADIENT,
  }
}

export function useArtisanPortfolioAdapter(page = 1) {
  const { data, isLoading, error } = usePortfolio({ page, limit: 20 })
  const projects: SourcePortfolioProject[] = (data?.items ?? []).map(
    mapApiPortfolioItemToSource,
  )
  return {
    projects,
    isLoading,
    error,
    total: data?.pagination.total ?? 0,
    totalPages: data?.pagination.totalPages ?? 0,
  }
}
