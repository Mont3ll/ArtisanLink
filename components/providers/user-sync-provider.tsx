'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'

interface UserSyncProviderProps {
  children: ReactNode
}

/**
 * UserSyncProvider ensures that authenticated Clerk users are synced to the database.
 * It calls /api/user/sync when a user is authenticated but might not exist in the DB.
 */
export function UserSyncProvider({ children }: UserSyncProviderProps) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const syncAttempted = useRef(false)
  const syncInProgress = useRef(false)

  useEffect(() => {
    // Only sync once per session, when auth is loaded and user is signed in
    if (!authLoaded || !userLoaded || !isSignedIn || !user) {
      return
    }

    // Prevent multiple sync attempts
    if (syncAttempted.current || syncInProgress.current) {
      return
    }

    const syncUser = async () => {
      syncInProgress.current = true
      
      try {
        const response = await fetch('/api/user/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('[UserSync] Failed to sync user:', response.status, errorData)
        } else {
          const data = await response.json()
          console.debug('[UserSync] User synced successfully:', data.user?.id)
        }
      } catch (error) {
        console.error('[UserSync] Error syncing user:', error)
      } finally {
        syncAttempted.current = true
        syncInProgress.current = false
      }
    }

    syncUser()
  }, [authLoaded, userLoaded, isSignedIn, user])

  return <>{children}</>
}
