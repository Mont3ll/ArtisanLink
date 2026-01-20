'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Mail, MessageSquare, Smartphone, Moon, Clock, Save, Loader2, AlertCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  messageNotifications: boolean
  reviewNotifications: boolean
  verificationNotifications: boolean
  systemNotifications: boolean
  promotionNotifications: boolean
  bookingNotifications: boolean
  quietHoursEnabled: boolean
  quietHoursStart: string | null
  quietHoursEnd: string | null
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  messageNotifications: true,
  reviewNotifications: true,
  verificationNotifications: true,
  systemNotifications: true,
  promotionNotifications: false,
  bookingNotifications: true,
  quietHoursEnabled: false,
  quietHoursStart: null,
  quietHoursEnd: null,
}

export default function NotificationPreferencesCard() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/user/notification-preferences')
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences')
      }
      
      const data = await response.json()
      const prefs = data.preferences || DEFAULT_PREFERENCES
      setPreferences(prefs)
      setOriginalPreferences(prefs)
    } catch (err) {
      console.error('Error fetching preferences:', err)
      setError('Failed to load notification preferences')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  useEffect(() => {
    const changed = JSON.stringify(preferences) !== JSON.stringify(originalPreferences)
    setHasChanges(changed)
    if (changed) setSuccess(false)
  }, [preferences, originalPreferences])

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/user/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save preferences')
      }

      setOriginalPreferences(preferences)
      setHasChanges(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving preferences:', err)
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setPreferences(originalPreferences)
    setHasChanges(false)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-10 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
            <Button variant="ghost" size="sm" onClick={fetchPreferences} className="ml-auto">
              Retry
            </Button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg text-sm">
            Preferences saved successfully!
          </div>
        )}

        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Notification Channels
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="email-notifications" className="font-normal cursor-pointer">
                  Email Notifications
                </Label>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="push-notifications" className="font-normal cursor-pointer">
                  Push Notifications
                </Label>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="sms-notifications" className="font-normal cursor-pointer">
                  SMS Notifications
                </Label>
              </div>
              <Switch
                id="sms-notifications"
                checked={preferences.smsNotifications}
                onCheckedChange={(checked) => updatePreference('smsNotifications', checked)}
              />
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Notification Types
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="message-notifications" className="font-normal cursor-pointer">
                    Messages
                  </Label>
                  <p className="text-xs text-muted-foreground">New messages from clients or artisans</p>
                </div>
              </div>
              <Switch
                id="message-notifications"
                checked={preferences.messageNotifications}
                onCheckedChange={(checked) => updatePreference('messageNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="booking-notifications" className="font-normal cursor-pointer">
                  Bookings & Inquiries
                </Label>
                <p className="text-xs text-muted-foreground">Updates about your bookings</p>
              </div>
              <Switch
                id="booking-notifications"
                checked={preferences.bookingNotifications}
                onCheckedChange={(checked) => updatePreference('bookingNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="review-notifications" className="font-normal cursor-pointer">
                  Reviews
                </Label>
                <p className="text-xs text-muted-foreground">When you receive a new review</p>
              </div>
              <Switch
                id="review-notifications"
                checked={preferences.reviewNotifications}
                onCheckedChange={(checked) => updatePreference('reviewNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="verification-notifications" className="font-normal cursor-pointer">
                  Verification Updates
                </Label>
                <p className="text-xs text-muted-foreground">Profile verification status changes</p>
              </div>
              <Switch
                id="verification-notifications"
                checked={preferences.verificationNotifications}
                onCheckedChange={(checked) => updatePreference('verificationNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="system-notifications" className="font-normal cursor-pointer">
                  System Announcements
                </Label>
                <p className="text-xs text-muted-foreground">Important platform updates</p>
              </div>
              <Switch
                id="system-notifications"
                checked={preferences.systemNotifications}
                onCheckedChange={(checked) => updatePreference('systemNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="promotion-notifications" className="font-normal cursor-pointer">
                  Promotions & Marketing
                </Label>
                <p className="text-xs text-muted-foreground">Special offers and promotions</p>
              </div>
              <Switch
                id="promotion-notifications"
                checked={preferences.promotionNotifications}
                onCheckedChange={(checked) => updatePreference('promotionNotifications', checked)}
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Quiet Hours
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quiet-hours" className="font-normal cursor-pointer">
                  Enable Quiet Hours
                </Label>
                <p className="text-xs text-muted-foreground">Pause notifications during specific hours</p>
              </div>
              <Switch
                id="quiet-hours"
                checked={preferences.quietHoursEnabled}
                onCheckedChange={(checked) => updatePreference('quietHoursEnabled', checked)}
              />
            </div>
            
            {preferences.quietHoursEnabled && (
              <div className="flex items-center gap-4 ml-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="quiet-start" className="text-sm">From</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={preferences.quietHoursStart || '22:00'}
                    onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                    className="w-28"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="quiet-end" className="text-sm">To</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={preferences.quietHoursEnd || '08:00'}
                    onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                    className="w-28"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={cn(
              "min-w-[100px]",
              hasChanges && "bg-primary"
            )}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
