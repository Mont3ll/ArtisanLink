'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Save,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useAdminSettings,
  useSaveAdminSettings,
  DEFAULT_SETTINGS,
  type AdminSettings,
} from '@/lib/hooks'

export default function SettingsPage() {
  const [localSettings, setLocalSettings] = useState<AdminSettings>(DEFAULT_SETTINGS)
  
  const { data, isLoading, error, refetch } = useAdminSettings()
  const { mutate: saveSettings, isPending: isSaving } = useSaveAdminSettings()

  // Sync local state when data loads
  useEffect(() => {
    if (data?.settings) {
      setLocalSettings(data.settings)
    }
  }, [data?.settings])

  const handleSaveSettings = (category: keyof AdminSettings) => {
    saveSettings(
      { category, settings: localSettings[category] },
      {
        onSuccess: () => {
          toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully`)
        },
        onError: () => {
          toast.error('Failed to save settings')
        }
      }
    )
  }

  const updateSetting = (category: keyof AdminSettings, key: string, value: string | number | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  // Skeleton for a switch setting row
  const SwitchSkeleton = () => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-6 w-11 rounded-full" />
    </div>
  )

  // Skeleton for an input field
  const InputSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  )

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : error ? (
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600">Auto-saved</span>
            </>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <span>Failed to load settings: {error instanceof Error ? error.message : 'Unknown error'}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputSkeleton />
                  </div>
                  <InputSkeleton />
                  <div className="space-y-4">
                    <SwitchSkeleton />
                    <SwitchSkeleton />
                  </div>
                  <Skeleton className="h-10 w-48" />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={localSettings.general.siteName}
                        onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Input
                      id="siteDescription"
                      value={localSettings.general.siteDescription}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('general', 'siteDescription', e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable maintenance mode to prevent user access
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.general.maintenanceMode}
                        onCheckedChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>User Registration</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow new users to register accounts
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.general.registrationEnabled}
                        onCheckedChange={(checked) => updateSetting('general', 'registrationEnabled', checked)}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSaveSettings('general')} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save General Settings'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <>
                  <div className="space-y-4">
                    <SwitchSkeleton />
                    <SwitchSkeleton />
                    <SwitchSkeleton />
                    <SwitchSkeleton />
                  </div>
                  <Skeleton className="h-10 w-56" />
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send email notifications to users
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.notifications.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send browser push notifications
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.notifications.pushNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send SMS notifications to users
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.notifications.smsNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Send marketing and promotional emails
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.notifications.marketingEmails}
                        onCheckedChange={(checked) => updateSetting('notifications', 'marketingEmails', checked)}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSaveSettings('notifications')} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure platform security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <>
                  <div className="space-y-4">
                    <SwitchSkeleton />
                    <SwitchSkeleton />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputSkeleton />
                    <InputSkeleton />
                  </div>
                  <Skeleton className="h-10 w-52" />
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication Required</Label>
                        <p className="text-sm text-muted-foreground">
                          Require 2FA for all user accounts
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.security.twoFactorRequired}
                        onCheckedChange={(checked) => updateSetting('security', 'twoFactorRequired', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>IP Whitelisting</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable IP address whitelisting for admin access
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.security.ipWhitelisting}
                        onCheckedChange={(checked) => updateSetting('security', 'ipWhitelisting', checked)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={localSettings.security.passwordExpiry}
                        onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={localSettings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSaveSettings('security')} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Security Settings'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <>
                  <div className="space-y-4">
                    <SwitchSkeleton />
                    <SwitchSkeleton />
                    <SwitchSkeleton />
                    <SwitchSkeleton />
                    <SwitchSkeleton />
                  </div>
                  <Skeleton className="h-10 w-48" />
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Project Bidding</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow artisans to bid on projects
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.features.projectBidding}
                        onCheckedChange={(checked) => updateSetting('features', 'projectBidding', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Direct Messaging</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable direct messaging between users
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.features.directMessaging}
                        onCheckedChange={(checked) => updateSetting('features', 'directMessaging', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>File Uploads</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to upload files and images
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.features.fileUploads}
                        onCheckedChange={(checked) => updateSetting('features', 'fileUploads', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Video Chat</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable video chat functionality
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.features.videoChat}
                        onCheckedChange={(checked) => updateSetting('features', 'videoChat', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Payment Processing</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable payment processing for projects
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.features.paymentProcessing}
                        onCheckedChange={(checked) => updateSetting('features', 'paymentProcessing', checked)}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSaveSettings('features')} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Feature Settings'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
