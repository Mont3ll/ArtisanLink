'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserRole } from '@/lib/roles'
import { AlertTriangle, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CompleteProfileBanner() {
  const { user, isLoaded } = useUser()
  const [dismissed, setDismissed] = useState(false)
  const [dbPhone, setDbPhone] = useState<string | null | undefined>(undefined) // undefined = loading

  // Fetch phone from DB since it's stored there, not in Clerk
  useEffect(() => {
    if (!isLoaded || !user) return

    async function fetchPhone() {
      try {
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const data = await res.json()
          setDbPhone(data.user?.phone ?? null)
        } else {
          setDbPhone(null)
        }
      } catch {
        setDbPhone(null)
      }
    }
    fetchPhone()
  }, [isLoaded, user])

  if (!isLoaded || !user || dismissed || dbPhone === undefined) return null

  const missingFields: string[] = []

  if (!user.firstName?.trim()) missingFields.push('first name')
  if (!user.lastName?.trim()) missingFields.push('last name')
  if (!dbPhone && !user.phoneNumbers?.length) missingFields.push('phone number')

  if (missingFields.length === 0) return null

  const role = (user.publicMetadata?.role as UserRole) ?? 'client'
  const settingsPath = `/${role}-dashboard/settings`

  const missingText =
    missingFields.length === 1
      ? missingFields[0]
      : missingFields.slice(0, -1).join(', ') + ' and ' + missingFields[missingFields.length - 1]

  return (
    <div className="mx-4 mt-3 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <p className="flex-1">
        Your profile is incomplete — please add your{' '}
        <span className="font-medium">{missingText}</span>.{' '}
        <Link
          href={settingsPath}
          className="font-medium underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-100"
        >
          Complete setup
        </Link>
      </p>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-200"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
