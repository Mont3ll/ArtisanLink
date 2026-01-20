import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface PendingArtisanProfile {
  profession?: string
  experience?: number
  city?: string
  county?: string
  bio?: string
  certificateUrl?: string
  certificateUploadedAt?: string
  artisanStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

export interface PendingArtisan {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  createdAt: string
  profile?: PendingArtisanProfile
}

export interface VerificationStats {
  totalPending: number
  totalVerified: number
  totalRejected: number
  avgProcessingTime: number
  pendingThisWeek: number
  verifiedThisWeek: number
}

export interface VerificationData {
  pendingArtisans: PendingArtisan[]
  stats: VerificationStats
}

export interface ProcessVerificationData {
  artisanId: string
  action: 'APPROVE' | 'REJECT'
  reason?: string
}

export interface ProcessVerificationResponse {
  success: boolean
  message: string
  profile: {
    artisanStatus: string
    verifiedAt: string | null
  }
}

// Query keys
export const adminVerificationKeys = {
  all: ['admin-verification'] as const,
  pending: () => [...adminVerificationKeys.all, 'pending'] as const,
  stats: () => [...adminVerificationKeys.all, 'stats'] as const,
}

// Fetch pending artisans
async function fetchPendingArtisans(): Promise<PendingArtisan[]> {
  const response = await fetch('/api/admin/verification/pending')
  
  if (!response.ok) {
    throw new Error('Failed to fetch pending artisans')
  }
  
  return response.json()
}

// Process verification (approve/reject)
async function processVerification(
  data: ProcessVerificationData
): Promise<ProcessVerificationResponse> {
  const response = await fetch('/api/admin/verification/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error('Failed to process verification')
  }
  
  return response.json()
}

/**
 * Hook to fetch pending artisan verifications
 */
export function usePendingVerifications() {
  return useQuery({
    queryKey: adminVerificationKeys.pending(),
    queryFn: fetchPendingArtisans,
  })
}

/**
 * Hook to get verification stats (calculated from pending artisans since no stats API)
 * This calculates stats client-side based on available data
 */
export function useVerificationStats() {
  const { data: pendingArtisans, isLoading, error } = usePendingVerifications()
  
  // Calculate stats from pending artisans
  const stats: VerificationStats | undefined = pendingArtisans ? {
    totalPending: pendingArtisans.length,
    // These would ideally come from an API, using placeholders for now
    totalVerified: 0,
    totalRejected: 0,
    avgProcessingTime: 2, // Default 2 days
    pendingThisWeek: pendingArtisans.filter(a => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(a.createdAt) > weekAgo
    }).length,
    verifiedThisWeek: 0,
  } : undefined
  
  return {
    stats,
    isLoading,
    error,
  }
}

/**
 * Hook to fetch all verification data (pending artisans and stats)
 */
export function useAdminVerification() {
  const pendingQuery = usePendingVerifications()
  const { stats } = useVerificationStats()
  
  return {
    pendingArtisans: pendingQuery.data || [],
    stats,
    isLoading: pendingQuery.isLoading,
    error: pendingQuery.error,
    refetch: pendingQuery.refetch,
  }
}

/**
 * Hook to process artisan verification (approve/reject)
 */
export function useProcessVerification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: processVerification,
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminVerificationKeys.pending() })
      
      // Snapshot previous value
      const previousArtisans = queryClient.getQueryData<PendingArtisan[]>(
        adminVerificationKeys.pending()
      )
      
      // Optimistically remove the artisan from pending list
      if (previousArtisans) {
        queryClient.setQueryData<PendingArtisan[]>(
          adminVerificationKeys.pending(),
          previousArtisans.filter(a => a.id !== data.artisanId)
        )
      }
      
      return { previousArtisans }
    },
    onError: (_err, _data, context) => {
      // Rollback on error
      if (context?.previousArtisans) {
        queryClient.setQueryData(
          adminVerificationKeys.pending(),
          context.previousArtisans
        )
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: adminVerificationKeys.all })
    },
  })
}

// Helper functions
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}
