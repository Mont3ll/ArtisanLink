import { useQuery } from '@tanstack/react-query'

// Types
export interface CurrentUser {
  id: string
  email: string
  phone: string | null
  firstName: string
  lastName: string
  role: 'ADMIN' | 'ARTISAN' | 'CLIENT'
  status: string
}

export interface CurrentUserProfile {
  id: string
  profileImage: string | null
  bio: string | null
  profession: string | null
  experience: number | null
  hourlyRate: number | null
  isAvailable: boolean
  city: string | null
  county: string | null
  address: string | null
}

export interface CurrentUserResponse {
  clerkUserId: string
  user: CurrentUser | null
  profile: CurrentUserProfile | null
}

// Query keys
export const currentUserKeys = {
  all: ['current-user'] as const,
  me: () => [...currentUserKeys.all, 'me'] as const,
}

// Fetch function
async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  const response = await fetch('/api/user/me')
  
  if (!response.ok) {
    throw new Error('Failed to fetch current user')
  }
  
  return response.json()
}

/**
 * Hook for fetching the current user's data including phone number
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKeys.me(),
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}
