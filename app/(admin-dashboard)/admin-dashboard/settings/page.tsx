'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Save,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface SettingsData {
  general: {
    siteName: string
    siteDescription: string
    maintenanceMode: boolean
    registrationEnabled: boolean
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    marketingEmails: boolean
  }
  security: {
    twoFactorRequired: boolean
    passwordExpiry: number
    sessionTimeout: number
    ipWhitelisting: boolean
  }
  features: {
    projectBidding: boolean
    directMessaging: boolean
    fileUploads: boolean
    videoChat: boolean
    paymentProcessing: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (category: string, categorySettings: unknown) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, settings: categorySettings })
      })

      if (response.ok) {
        toast.success(`${category} settings saved successfully`)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category: keyof SettingsData, key: string, value: string | number | boolean) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load settings</h2>
          <p className="text-gray-600 mb-4">There was an error loading the settings.</p>
          <Button onClick={fetchSettings}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">Configure platform-wide settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600">Auto-saved</span>
        </div>
      </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('general', 'siteDescription', e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">
                      Enable maintenance mode to prevent user access
                    </p>
                  </div>
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Registration</Label>
                    <p className="text-sm text-gray-600">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.general.registrationEnabled}
                    onCheckedChange={(checked) => updateSetting('general', 'registrationEnabled', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => saveSettings('general', settings.general)} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save General Settings'}
              </Button>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Send email notifications to users
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Send browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Send SMS notifications to users
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-600">
                      Send marketing and promotional emails
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketingEmails}
                    onCheckedChange={(checked) => updateSetting('notifications', 'marketingEmails', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => saveSettings('notifications', settings.notifications)} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </Button>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication Required</Label>
                    <p className="text-sm text-gray-600">
                      Require 2FA for all user accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorRequired}
                    onCheckedChange={(checked) => updateSetting('security', 'twoFactorRequired', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>IP Whitelisting</Label>
                    <p className="text-sm text-gray-600">
                      Enable IP address whitelisting for admin access
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.ipWhitelisting}
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
                    value={settings.security.passwordExpiry}
                    onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={() => saveSettings('security', settings.security)} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Security Settings'}
              </Button>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Project Bidding</Label>
                    <p className="text-sm text-gray-600">
                      Allow artisans to bid on projects
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.projectBidding}
                    onCheckedChange={(checked) => updateSetting('features', 'projectBidding', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Direct Messaging</Label>
                    <p className="text-sm text-gray-600">
                      Enable direct messaging between users
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.directMessaging}
                    onCheckedChange={(checked) => updateSetting('features', 'directMessaging', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>File Uploads</Label>
                    <p className="text-sm text-gray-600">
                      Allow users to upload files and images
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.fileUploads}
                    onCheckedChange={(checked) => updateSetting('features', 'fileUploads', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Video Chat</Label>
                    <p className="text-sm text-gray-600">
                      Enable video chat functionality
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.videoChat}
                    onCheckedChange={(checked) => updateSetting('features', 'videoChat', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Processing</Label>
                    <p className="text-sm text-gray-600">
                      Enable payment processing for projects
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.paymentProcessing}
                    onCheckedChange={(checked) => updateSetting('features', 'paymentProcessing', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => saveSettings('features', settings.features)} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Feature Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
