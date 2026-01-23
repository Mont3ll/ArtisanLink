'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'

interface UserSyncContextType {
  isSynced: boolean
  isSyncing: boolean
  syncError: string | null
  userRole: string | null
  refetchSync: () => Promise<void>
}

const UserSyncContext = createContext<UserSyncContextType>({
  isSynced: false,
  isSyncing: false,
  syncError: null,
  userRole: null,
  refetchSync: async () => {},
})

export function useUserSync() {
  return useContext(UserSyncContext)
}

interface UserSyncProviderProps {
  children: ReactNode
}

/**
 * UserSyncProvider ensures that authenticated Clerk users are synced to the database.
 * It provides sync status to child components via context.
 */
export function UserSyncProvider({ children }: UserSyncProviderProps) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const queryClient = useQueryClient()
  
  const [isSynced, setIsSynced] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  const syncAttempted = useRef(false)

  const syncUser = useCallback(async () => {
    if (isSyncing) return
    
    setIsSyncing(true)
    setSyncError(null)
    
    try {
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Sync failed with status ${response.status}`
        console.error('[UserSync] Failed to sync user:', errorMessage)
        setSyncError(errorMessage)
        return
      }
      
      const data = await response.json()
      setUserRole(data.user?.role || null)
      setIsSynced(true)
      
      // Invalidate all queries to refetch with the now-synced user
      queryClient.invalidateQueries()
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[UserSync] Error syncing user:', errorMessage)
      setSyncError(errorMessage)
    } finally {
      setIsSyncing(false)
      syncAttempted.current = true
    }
  }, [isSyncing, queryClient])

  useEffect(() => {
    // Reset sync state when user signs out
    if (authLoaded && !isSignedIn) {
      setIsSynced(false)
      setUserRole(null)
      setSyncError(null)
      syncAttempted.current = false
      return
    }

    // Only sync once per session, when auth is loaded and user is signed in
    if (!authLoaded || !userLoaded || !isSignedIn || !user) {
      return
    }

    // Prevent multiple sync attempts
    if (syncAttempted.current) {
      return
    }

    syncUser()
  }, [authLoaded, userLoaded, isSignedIn, user, syncUser])

  return (
    <UserSyncContext.Provider value={{ 
      isSynced, 
      isSyncing, 
      syncError, 
      userRole,
      refetchSync: syncUser 
    }}>
      {children}
    </UserSyncContext.Provider>
  )
}
