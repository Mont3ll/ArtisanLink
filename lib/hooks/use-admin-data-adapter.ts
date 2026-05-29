/**
 * Admin Data Adapter
 * Maps real API types from admin hooks → simplified types used
 * in source-admin-preview.tsx AdminOperationsSection.
 *
 * Key type notes (from reading actual hook files):
 * - useAdminVerification() returns { pendingArtisans, stats, isLoading, ... } directly (not data.*)
 * - useAdminArtisans()    returns standard React Query { data: AdminArtisansResponse, ... }
 * - useAdminStats()       returns standard React Query { data: AdminStats, ... }
 * - useUsers()            returns standard React Query { data: User[], ... } (plain array, not {users:[]})
 */
import { useAdminStats } from './use-admin-dashboard'
import { useAdminVerification } from './use-admin-verification'
import type { PendingArtisan } from './use-admin-verification'
import { useAdminArtisans } from './use-admin-artisans'
import type { AdminArtisan } from './use-admin-artisans'
import { useUsers, useUserStats } from './use-users'
import type { User } from './use-users'
import { useAdminModeration } from './use-admin-moderation'
import type { ModerationItem } from './use-admin-moderation'

// ─── Helper ──────────────────────────────────────────────────────────────────

export function relativeTime(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime()
  const hours = Math.floor(ms / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(isoString).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
}

// ─── Verification Record ──────────────────────────────────────────────────────

export interface SourceVerificationRecord {
  id: string
  name: string
  profession: string
  county: string
  submitted: string
  status: 'PENDING' | 'REVIEW' | 'VERIFIED' | 'ACTIVE' | 'QUOTED' | 'COMPLETED'
  documents: string[]
  risk: 'Low' | 'Medium' | 'High'
}

export function mapPendingArtisanToVerificationRecord(
  artisan: PendingArtisan,
): SourceVerificationRecord {
  const docs: string[] = []
  if (artisan.profile?.idDocumentUrl) docs.push('National ID')
  if (artisan.profile?.certificateUrl) docs.push('Certificate')
  const displayDocs = docs.length === 0 ? ['Pending upload'] : docs

  const st = artisan.profile?.artisanStatus ?? 'PENDING'

  return {
    id: artisan.id,
    name: `${artisan.firstName} ${artisan.lastName}`,
    profession: artisan.profile?.profession ?? 'Not specified',
    county: artisan.profile?.county ?? 'Unknown',
    submitted: relativeTime(artisan.createdAt),
    status: st === 'REJECTED' ? 'REVIEW' : st === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
    documents: displayDocs,
    risk: docs.length >= 2 ? 'Low' : docs.length === 1 ? 'Medium' : 'High',
  }
}

// ─── Admin Artisan ────────────────────────────────────────────────────────────

export interface SourceAdminArtisan {
  id: string
  name: string
  profession: string | null
  location: { city: string; county: string }
  isVerified: boolean
  isPremium: boolean
  isAvailable: boolean
  rating: { average: number; total: number }
  totalReviews: number
  portfolioItems: number
  hourlyRate: number
  profileImage: string | null
}

export function mapAdminArtisanToSource(artisan: AdminArtisan): SourceAdminArtisan {
  const parts = (artisan.location ?? '').split(',').map((s) => s.trim())
  return {
    id: artisan.id,
    name: artisan.name,
    profession: artisan.profession,
    location: { city: parts[0] ?? '', county: parts[1] ?? '' },
    isVerified: artisan.status === 'VERIFIED',
    isPremium: artisan.subscriptionStatus === 'ACTIVE',
    isAvailable: artisan.isAvailable,
    rating: { average: artisan.rating, total: artisan.totalReviews },
    totalReviews: artisan.totalReviews,
    portfolioItems: artisan.portfolioItems,
    hourlyRate: 0,
    profileImage: null,
  }
}

// ─── Invite Row ───────────────────────────────────────────────────────────────

export interface SourceInviteRow {
  email: string
  role: string
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'REVIEW'
  sent: string
}

export function mapInviteToRow(invite: {
  id: string
  email: string
  status: string
  createdAt: string
}): SourceInviteRow {
  const statusMap: Record<string, SourceInviteRow['status']> = {
    PENDING: 'PENDING',
    ACCEPTED: 'COMPLETED',
    EXPIRED: 'REVIEW',
    REVOKED: 'REVIEW',
  }
  return {
    email: invite.email,
    role: 'Artisan',
    status: statusMap[invite.status] ?? 'PENDING',
    sent: relativeTime(invite.createdAt),
  }
}

// ─── Admin Stats ─────────────────────────────────────────────────────────────

export interface SourceAdminStats {
  pendingVerification: string
  openModeration: string
  activeSubscriptions: string
  systemUptime: string
}

export function mapAdminStatsToSource(stats: {
  pendingVerifications: number
  activeSubscriptions: number
  systemUptime: number
  [key: string]: number
}): SourceAdminStats {
  return {
    pendingVerification: String(stats.pendingVerifications ?? 0),
    openModeration: '0',
    activeSubscriptions: String(stats.activeSubscriptions ?? 0),
    systemUptime: `${(stats.systemUptime ?? 0).toFixed(2)}%`,
  }
}

// ─── Aggregate Hook ───────────────────────────────────────────────────────────

export interface SourceUserRow {
  id: string
  name: string
  role: string
  status: string
  meta: string
  email: string
  risk: 'Low' | 'Medium' | 'High'
}

export interface SourceModerationRow {
  id: string
  title: string
  body: string
  status: 'PENDING' | 'REVIEW' | 'ACTIVE' | 'COMPLETED' | 'QUOTED' | 'VERIFIED'
  severity: 'Low' | 'Medium' | 'High'
  target: string
  source: string
  owner: string
}

export function mapUserToRow(user: User): SourceUserRow {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email
  const profile = user.profile as { profession?: string; city?: string } | undefined
  return {
    id: user.id,
    name,
    role: user.role === 'ARTISAN' ? 'Artisan' : user.role === 'ADMIN' ? 'Admin' : 'Client',
    status: user.status,
    meta: profile?.profession
      ? `${profile.profession}${profile.city ? ' · ' + profile.city : ''}`
      : profile?.city || 'Kenya',
    email: user.email,
    risk: (user.status === 'SUSPENDED' || user.status === 'BANNED') ? 'High' : 'Low',
  }
}

export function mapModerationItemToRow(item: ModerationItem): SourceModerationRow {
  const content = item.content as Record<string, unknown>
  const body = (content?.comment as string)
    || ((content?.artisan as { name?: string })?.name ? `Artisan: ${(content.artisan as { name: string }).name}` : '')
    || (item.targetUser ? `User: ${item.targetUser.name}` : 'Reported item')
  const statusMap: Record<string, SourceModerationRow['status']> = {
    pending: 'PENDING', approved: 'ACTIVE', hidden: 'REVIEW', suspended: 'REVIEW',
  }
  return {
    id: item.id,
    title: item.type === 'review' ? 'Review flag' : 'User report',
    body: body || 'Reported content',
    status: statusMap[item.status.toLowerCase()] ?? 'REVIEW',
    severity: item.status.toLowerCase() === 'suspended' ? 'High' : item.type === 'review' ? 'Low' : 'Medium',
    target: item.type === 'review' ? 'Review' : 'User account',
    source: item.targetUser ? `${item.targetUser.role} report` : 'System flag',
    owner: 'Trust queue',
  }
}


export function useAdminDataAdapter() {
  // useAdminVerification returns fields directly (not data.*)
  const {
    pendingArtisans,
    isLoading: verLoading,
  } = useAdminVerification()

  // Standard React Query shape
  const { data: artData, isLoading: artLoading } = useAdminArtisans()
  const { data: statsData, isLoading: statsLoading } = useAdminStats()
  // useUsers returns plain User[] (not {users:[]})
  const { data: usersData, isLoading: usersLoading } = useUsers()

  const verificationQueue: SourceVerificationRecord[] = (pendingArtisans ?? []).map(
    mapPendingArtisanToVerificationRecord,
  )

  const adminArtisans: SourceAdminArtisan[] = (artData?.artisans ?? []).map(
    mapAdminArtisanToSource,
  )

  const stats = statsData
    ? mapAdminStatsToSource(statsData as unknown as Parameters<typeof mapAdminStatsToSource>[0])
    : null

  const { data: userStatsData } = useUserStats()
  const { data: moderationData, isLoading: modLoading } = useAdminModeration()
  const users: SourceUserRow[] = (usersData as User[] ?? []).map(mapUserToRow)
  const userStats = userStatsData ?? null
  const moderationRows: SourceModerationRow[] = (moderationData?.items ?? []).map(mapModerationItemToRow)
  const moderationStats = moderationData?.stats ?? null

  return {
    verificationQueue,
    adminArtisans,
    users,
    userStats,
    moderationRows,
    moderationStats,
    stats,
    isLoading: verLoading || artLoading || statsLoading || usersLoading || modLoading,
  }
}
