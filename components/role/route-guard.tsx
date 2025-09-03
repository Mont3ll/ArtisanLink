'use client'

import { ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserRole } from '@/lib/roles'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  requiredRole?: UserRole
}

export function RouteGuard({ 
  children, 
  allowedRoles, 
  requiredRole 
}: RouteGuardProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.publicMetadata?.role as UserRole | undefined

      if (!userRole) {
        router.push('/sign-in')
        return
      }

      // Check if user has required role
      if (requiredRole && userRole !== requiredRole) {
        router.push(`/${userRole}-dashboard`)
        return
      }

      // Check if user has one of allowed roles
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        router.push(`/${userRole}-dashboard`)
        return
      }
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router, allowedRoles, requiredRole])

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

  const userRole = user.publicMetadata?.role as UserRole | undefined

  if (requiredRole && userRole !== requiredRole) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(userRole as UserRole)) {
    return null
  }

  return <>{children}</>
}

export function getUserRole(): UserRole | undefined {
  // This is a client-side helper function
  // For server-side, use the auth() function from Clerk
  return undefined // Will be populated via useUser hook in actual components
}
