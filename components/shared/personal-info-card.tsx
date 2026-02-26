'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Save, Loader2, CheckCircle2 } from 'lucide-react'

/**
 * PersonalInfoCard — shared settings card for updating first name, last name,
 * and phone number. Used on both artisan and client settings pages.
 *
 * - For OAuth users (e.g. Google), first/last name are pre-filled from the provider.
 * - First/last name are synced to Clerk and the DB.
 * - Phone is stored in the DB only (no Clerk phone verification required).
 * - After saving, the Clerk session is refreshed so the banner updates.
 */
export default function PersonalInfoCard() {
  const { user, isLoaded } = useUser()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [dbPhone, setDbPhone] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [isLoadingPhone, setIsLoadingPhone] = useState(true)

  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch phone from DB (since phone is stored in DB, not Clerk)
  useEffect(() => {
    async function fetchDbPhone() {
      try {
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const data = await res.json()
          setDbPhone(data.user?.phone ?? null)
        }
      } catch {
        // Non-critical — phone field will just be empty
      } finally {
        setIsLoadingPhone(false)
      }
    }
    fetchDbPhone()
  }, [])

  // Initialize form once both Clerk and DB data are available
  useEffect(() => {
    if (isLoaded && user && !isLoadingPhone && !initialized) {
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
      setPhone(dbPhone ?? user.phoneNumbers?.[0]?.phoneNumber ?? '')
      setInitialized(true)
    }
  }, [isLoaded, user, isLoadingPhone, initialized, dbPhone])

  const handleSave = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!firstName.trim()) {
      setErrorMessage('First name is required')
      return
    }
    if (!lastName.trim()) {
      setErrorMessage('Last name is required')
      return
    }

    // Validate phone format if entered
    if (phone.trim() && !/^\+254\d{9}$/.test(phone.trim())) {
      setErrorMessage('Phone number must be in the format +254XXXXXXXXX (e.g. +254712345678)')
      return
    }

    setIsSaving(true)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMessage(data.error || 'Failed to save. Please try again.')
        return
      }

      // Update local DB phone reference so hasChanges recalculates correctly
      setDbPhone(phone.trim() || null)

      // Refresh Clerk session so useUser() reflects new name
      await user?.reload()

      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const isLoading = !isLoaded || isLoadingPhone

  // Determine if there are unsaved changes
  const hasChanges =
    initialized &&
    user &&
    (firstName.trim() !== (user.firstName ?? '') ||
      lastName.trim() !== (user.lastName ?? '') ||
      phone.trim() !== (dbPhone ?? ''))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Your name and phone number. This information is visible to other users on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        ) : (
          <>
            {/* Success */}
            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {successMessage}
              </div>
            )}

            {/* Error */}
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personalFirstName">First Name *</Label>
                <Input
                  id="personalFirstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalLastName">Last Name *</Label>
                <Input
                  id="personalLastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Kamau"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalPhone">Phone Number</Label>
              <Input
                id="personalPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254712345678"
                maxLength={13}
              />
              <p className="text-xs text-muted-foreground">
                Kenyan format: +254 followed by 9 digits (e.g. +254712345678)
              </p>
            </div>

            <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
