/**
 * Artisan Earnings Adapter
 * Maps real API EarningsPayout (from use-artisan-earnings.ts) to the simplified
 * ArtisanEarningRow type used in source-admin-preview.tsx.
 *
 * Real API response shape (EarningsResponse):
 *   { payouts, recentPayouts, pagination, statistics }
 *   statistics.totalEarnings.amount — total net earned
 *   statistics.pendingPayouts.amount — pending payout amount
 *   statistics.commission.currentRate — commission rate
 */
import { useArtisanEarnings } from './use-artisan-earnings'
import type { EarningsPayout, EarningsResponse } from './use-artisan-earnings'

export interface SourceEarningRow {
  id: string
  item: string
  client: string
  amount: string
  commission: string
  net: string
  status: 'COMPLETED' | 'PENDING' | 'ACTIVE' | 'REVIEW' | 'QUOTED' | 'VERIFIED'
  date: string
}

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Pending'
  const d = new Date(dateStr)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
}

export function mapPayoutToEarningRow(payout: EarningsPayout): SourceEarningRow {
  return {
    id: payout.id,
    item: payout.job?.title ?? 'Payout',
    client: payout.job
      ? `${payout.job.client.firstName} ${payout.job.client.lastName}`
      : '—',
    amount: formatKes(payout.grossAmount),
    commission: formatKes(payout.commission),
    net: formatKes(payout.netAmount),
    status: payout.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
    date: formatDate(payout.completedAt),
  }
}

export function useArtisanEarningsAdapter(filters = {}) {
  const { data, isLoading, error } = useArtisanEarnings(filters)
  const response = data as EarningsResponse | undefined

  const earningRows: SourceEarningRow[] = (response?.payouts ?? []).map(
    mapPayoutToEarningRow,
  )

  const totalEarned = response?.statistics?.totalEarnings?.amount ?? 0
  const totalCommission =
    (totalEarned > 0 && response?.statistics?.commission?.currentRate
      ? totalEarned * response.statistics.commission.currentRate
      : 0)
  const pendingPayout = response?.statistics?.pendingPayouts?.amount ?? 0

  return {
    earningRows,
    isLoading,
    error,
    totalEarned,
    totalCommission,
    pendingPayout,
    pagination: response?.pagination,
  }
}
