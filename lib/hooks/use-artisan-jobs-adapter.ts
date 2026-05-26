/**
 * Artisan Jobs Adapter
 * Maps real API ArtisanJob (from use-artisan-jobs.ts) to the simplified
 * ArtisanJob type used in source-admin-preview.tsx.
 */
import { useArtisanJobs } from './use-artisan-jobs'
import type { ArtisanJob as ApiJob } from './use-artisan-jobs'

/** Source-preview simplified ArtisanJob type */
export interface SourceArtisanJob {
  id: string
  title: string
  client: string
  status: 'PENDING' | 'QUOTED' | 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'VERIFIED'
  budget: string
  quote: string
  location: string
  description: string
}

/** Maps real API job status → 6-value source-preview status */
export function mapStatusToSourceStatus(
  status: string,
): SourceArtisanJob['status'] {
  switch (status) {
    case 'REQUESTED': return 'PENDING'
    case 'QUOTED': return 'QUOTED'
    case 'ACCEPTED':
    case 'DEPOSIT_PAID':
    case 'IN_PROGRESS': return 'ACTIVE'
    case 'COMPLETED':
    case 'PAID': return 'COMPLETED'
    case 'DISPUTED': return 'REVIEW'
    default: return 'PENDING'
  }
}

function formatKes(amount: number | null | undefined): string {
  if (amount == null) return ''
  return `KES ${amount.toLocaleString('en-KE')}`
}

/** Maps a single real API job to source-preview format */
export function mapApiJobToSourceJob(job: ApiJob): SourceArtisanJob {
  return {
    id: job.id,
    title: job.title,
    client: job.client.name,
    status: mapStatusToSourceStatus(job.status),
    budget: formatKes(job.clientBudget ?? job.agreedPrice),
    quote: job.latestQuote ? formatKes(job.latestQuote.amount) : 'Not sent',
    location: job.location ?? 'Kenya',
    description: job.description,
  }
}

/**
 * Hook returning artisan jobs adapted to source-preview format.
 */
export function useArtisanJobsAdapter(statusFilter: string | null = null) {
  const { data, isLoading, error } = useArtisanJobs(statusFilter)
  const jobs: SourceArtisanJob[] = (data?.jobs ?? []).map(mapApiJobToSourceJob)
  return {
    jobs,
    isLoading,
    error,
    statusCounts: data?.statusCounts,
    pagination: data?.pagination,
  }
}
