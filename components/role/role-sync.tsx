'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useRef } from 'react'

export function RoleSync() {
  const { user, isLoaded } = useUser()
  const syncAttempted = useRef(false)

  useEffect(() => {
    if (isLoaded && user) {
      // Ensure user has a role in publicMetadata
      const currentRole = user.publicMetadata?.role as string | undefined
      
      if (!currentRole) {
        // Set default role as 'client' if no role is assigned
        // Use unsafeMetadata instead of publicMetadata for user updates
        user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            role: 'client'
          }
        }).catch(console.error)
      }

      // Sync user to database (only once per session)
      if (!syncAttempted.current) {
        syncAttempted.current = true
        
        fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
          .then(async (response) => {
            if (!response.ok) {
              const error = await response.json().catch(() => ({}))
              console.error('[RoleSync] Failed to sync user to database:', error)
            }
          })
          .catch((error) => {
            console.error('[RoleSync] Error syncing user to database:', error)
          })
      }
    }
  }, [user, isLoaded])

  return null
}
