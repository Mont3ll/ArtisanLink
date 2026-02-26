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
  idDocumentUrl?: string
  idDocumentType?: string
  profileImage?: string
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
  adminNotes?: string
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

// Fetch pending artisans with stats
async function fetchPendingArtisans(): Promise<VerificationData> {
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
 * Hook to fetch pending artisan verifications with stats
 */
export function usePendingVerifications() {
  return useQuery({
    queryKey: adminVerificationKeys.pending(),
    queryFn: fetchPendingArtisans,
  })
}

/**
 * Hook to fetch all verification data (pending artisans and stats)
 */
export function useAdminVerification() {
  const query = usePendingVerifications()
  
  return {
    pendingArtisans: query.data?.pendingArtisans || [],
    stats: query.data?.stats,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
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
      const previousData = queryClient.getQueryData<VerificationData>(
        adminVerificationKeys.pending()
      )
      
      // Optimistically remove the artisan from pending list
      if (previousData) {
        queryClient.setQueryData<VerificationData>(
          adminVerificationKeys.pending(),
          {
            ...previousData,
            pendingArtisans: previousData.pendingArtisans.filter(a => a.id !== data.artisanId),
            stats: {
              ...previousData.stats,
              totalPending: previousData.stats.totalPending - 1,
            }
          }
        )
      }
      
      return { previousData }
    },
    onError: (_err, _data, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          adminVerificationKeys.pending(),
          context.previousData
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
