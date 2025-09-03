'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export function RoleSync() {
  const { user, isLoaded } = useUser()

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
    }
  }, [user, isLoaded])

  return null
}
