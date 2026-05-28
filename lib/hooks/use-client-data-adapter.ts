/**
 * Client Data Adapter
 * Maps real API ClientJob (from use-client-jobs.ts) to the simplified
 * ClientJob type used in source-admin-preview.tsx ClientDashboardCoreSection.
 */
import { useClientJobs } from './use-client-jobs'
import type { ClientJob as RealClientJob } from './use-client-jobs'
import { useClientStats } from './use-client-dashboard'
import { useSavedArtisansPage } from './use-saved-artisans'

type SourceStatus = 'PENDING' | 'QUOTED' | 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'VERIFIED'

export interface SourceClientJob {
  id: string
  title: string
  artisan: string
  profession: string
  status: SourceStatus
  quote: string
  location: string
  description: string
  /** Artisan's profile ID — needed for /api/reviews POST */
  artisanProfileId: string | null
}

export function mapClientStatusToSource(status: string): SourceStatus {
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

export function mapRealClientJobToSource(job: RealClientJob): SourceClientJob {
  return {
    id: job.id,
    title: job.title,
    artisan: job.artisan.name,
    profession: job.artisan.profession ?? 'Artisan',
    status: mapClientStatusToSource(job.status),
    quote: job.latestQuote ? formatKes(job.latestQuote.amount) : 'Not sent',
    location: job.location ?? 'Kenya',
    description: job.description,
    artisanProfileId: (job.artisan as { profileId?: string }).profileId ?? null,
  }
}

export interface SourceClientStats {
  activeJobs: string
  savedArtisans: string
  completedJobs: string
  unreadMessages: string
}

export function mapClientStatsToSource(
  stats:
    | { totalProjects: number; activeProjects: number; completedProjects: number; savedArtisans: number }
    | null
    | undefined,
): SourceClientStats {
  return {
    activeJobs: String(stats?.activeProjects ?? 0),
    savedArtisans: String(stats?.savedArtisans ?? 0),
    completedJobs: String(stats?.completedProjects ?? 0),
    unreadMessages: '0',
  }
}

export function useClientDataAdapter() {
  const { data: jobsData, isLoading: jobsLoading } = useClientJobs()
  const { data: statsData, isLoading: statsLoading } = useClientStats()
  const { data: savedData, isLoading: savedLoading } = useSavedArtisansPage()

  const clientJobs: SourceClientJob[] = (jobsData?.jobs ?? []).map(mapRealClientJobToSource)
  const stats = mapClientStatsToSource(statsData ?? null)
  const savedArtisanIds = (savedData?.items ?? []).map((item) => item.artisan.id)

  return {
    clientJobs,
    stats,
    savedArtisanIds,
    savedCount: savedData?.pagination.total ?? 0,
    isLoading: jobsLoading || statsLoading || savedLoading,
  }
}
