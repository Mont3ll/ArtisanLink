'use client'

import { ReactNode, useEffect, useState, useRef, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserRole } from '@/lib/roles'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  requiredRole?: UserRole
}

/**
 * Max number of times to call user.reload() to refresh session claims.
 * After this many attempts, we assume the role is genuinely missing.
 */
const MAX_RELOAD_ATTEMPTS = 5

/**
 * Interval between reload attempts (ms).
 */
const RELOAD_INTERVAL_MS = 2000

export function RouteGuard({ 
  children, 
  allowedRoles, 
  requiredRole 
}: RouteGuardProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [roleResolved, setRoleResolved] = useState(false)
  const reloadAttempts = useRef(0)
  const reloadTimer = useRef<NodeJS.Timeout | null>(null)

  const userRole = isLoaded && user
    ? (user.publicMetadata?.role as UserRole | undefined)
    : undefined

  // If the role is already available from the JWT, mark it resolved immediately.
  // Otherwise, start polling user.reload() to force-refresh the session token.
  const attemptReload = useCallback(async () => {
    if (!user) return

    reloadAttempts.current += 1

    try {
      await user.reload()
    } catch {
      // reload failed — will retry
    }

    // After reload, React will re-render with updated user.publicMetadata.
    // If the role still isn't there and we haven't hit the limit, schedule another.
    const updatedRole = (user.publicMetadata?.role as string | undefined)
    if (updatedRole) {
      setRoleResolved(true)
    } else if (reloadAttempts.current >= MAX_RELOAD_ATTEMPTS) {
      // Exhausted all attempts — the role is genuinely missing.
      // Redirect to sign-in as a last resort (NOT /after-sign-in to avoid loops).
      setRoleResolved(true)
    }
  }, [user])

  useEffect(() => {
    if (!isLoaded || !user) return

    // Role already present in JWT — no polling needed
    if (userRole) {
      setRoleResolved(true)
      return
    }

    // Start polling
    if (reloadAttempts.current === 0) {
      attemptReload()
    }

    reloadTimer.current = setInterval(() => {
      const currentRole = (user.publicMetadata?.role as string | undefined)
      if (currentRole || reloadAttempts.current >= MAX_RELOAD_ATTEMPTS) {
        if (reloadTimer.current) clearInterval(reloadTimer.current)
        setRoleResolved(true)
        return
      }
      attemptReload()
    }, RELOAD_INTERVAL_MS)

    return () => {
      if (reloadTimer.current) clearInterval(reloadTimer.current)
    }
  }, [isLoaded, user, userRole, attemptReload])

  // Handle redirects once role is resolved
  useEffect(() => {
    if (!isLoaded || !roleResolved) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    const role = user.publicMetadata?.role as UserRole | undefined

    if (!role) {
      // After all reload attempts, role is still missing.
      // Send to sign-in — don't send to /after-sign-in (creates loops).
      router.push('/sign-in')
      return
    }

    // Wrong role for this dashboard — redirect to correct one
    if (requiredRole && role !== requiredRole) {
      router.push(`/${role}-dashboard`)
      return
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      router.push(`/${role}-dashboard`)
      return
    }
  }, [user, isLoaded, router, allowedRoles, requiredRole, roleResolved])

  // Loading states
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Still waiting for role to propagate
  if (!roleResolved) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const resolvedRole = user.publicMetadata?.role as UserRole | undefined

  if (!resolvedRole) {
    return null
  }

  if (requiredRole && resolvedRole !== requiredRole) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(resolvedRole)) {
    return null
  }

  return <>{children}</>
}

export function getUserRole(): UserRole | undefined {
  // This is a client-side helper function
  // For server-side, use the auth() function from Clerk
  return undefined // Will be populated via useUser hook in actual components
}
