'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface ModerationItemContent {
  rating?: number
  comment?: string
  projectTitle?: string
  projectCost?: number
  artisan?: {
    id: string
    name: string
    profession?: string
  }
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  phone?: string
  profile?: {
    profession?: string
    artisanStatus?: string
    city?: string
    county?: string
  }
}

export interface ModerationTargetUser {
  id: string
  name: string
  email: string
  role: string
}

export interface ModerationItem {
  id: string
  type: 'review' | 'user'
  status: string
  content: ModerationItemContent
  createdAt: string
  targetUser?: ModerationTargetUser
}

export interface ModerationStats {
  pendingReviews: number
  pendingUsers: number
  suspendedUsers: number
  total: number
}

export interface ActivityLogItem {
  id: string
  adminEmail: string
  action: string
  targetType: string
  targetId: string
  description?: string
  createdAt: string
}

export interface ModerationData {
  items: ModerationItem[]
  stats: ModerationStats
}

export interface ModerationActionParams {
  id: string
  action: string
  type: 'review' | 'user'
  reason?: string
}

// Query keys
export const adminModerationKeys = {
  all: ['admin-moderation'] as const,
  list: (status?: string) => [...adminModerationKeys.all, 'list', status] as const,
  activityLogs: (limit?: number) => [...adminModerationKeys.all, 'activity-logs', limit] as const,
}

// Fetch functions
async function fetchModerationData(status?: string): Promise<ModerationData> {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  
  const response = await fetch(`/api/admin/moderation?${params}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch moderation data')
  }
  
  return response.json()
}

async function fetchActivityLogs(limit = 10): Promise<{ logs: ActivityLogItem[] }> {
  const response = await fetch(`/api/admin/activity-logs?limit=${limit}`)
  
  if (!response.ok) {
    return { logs: [] }
  }
  
  return response.json()
}

async function performModerationAction(params: ModerationActionParams): Promise<void> {
  const response = await fetch(`/api/admin/moderation/${params.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: params.action,
      type: params.type,
      reason: params.reason || `${params.action} via moderation dashboard`
    })
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Action failed')
  }
}

/**
 * Hook for fetching moderation data
 */
export function useAdminModeration(status?: string) {
  return useQuery({
    queryKey: adminModerationKeys.list(status),
    queryFn: () => fetchModerationData(status),
    refetchInterval: 30000, // Poll every 30 seconds
  })
}

/**
 * Hook for fetching activity logs
 */
export function useActivityLogs(limit = 10) {
  return useQuery({
    queryKey: adminModerationKeys.activityLogs(limit),
    queryFn: () => fetchActivityLogs(limit),
  })
}

/**
 * Hook for performing moderation actions
 */
export function useModerationAction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: performModerationAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminModerationKeys.all })
    },
  })
}

// Utility functions
export function getModerationStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'hidden':
      return 'bg-red-100 text-red-800'
    case 'suspended':
      return 'bg-orange-100 text-orange-800'
    default:
      return ''
  }
}

export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    approve: 'Approve',
    reject: 'Reject',
    hide: 'Hide',
    suspend: 'Suspend User',
    activate: 'Activate User',
    unsuspend: 'Unsuspend',
    ban: 'Ban User'
  }
  return labels[action] || action
}
