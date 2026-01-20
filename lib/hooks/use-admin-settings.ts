'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface GeneralSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
}

export interface SecuritySettings {
  twoFactorRequired: boolean
  passwordExpiry: number
  sessionTimeout: number
  ipWhitelisting: boolean
}

export interface FeatureSettings {
  projectBidding: boolean
  directMessaging: boolean
  fileUploads: boolean
  videoChat: boolean
  paymentProcessing: boolean
}

export interface AdminSettings {
  general: GeneralSettings
  notifications: NotificationSettings
  security: SecuritySettings
  features: FeatureSettings
}

export interface SaveSettingsData {
  category: keyof AdminSettings
  settings: GeneralSettings | NotificationSettings | SecuritySettings | FeatureSettings
}

// Query keys
export const adminSettingsKeys = {
  all: ['admin-settings'] as const,
  settings: () => [...adminSettingsKeys.all, 'data'] as const,
}

// Fetch functions
async function fetchSettings(): Promise<{ settings: AdminSettings }> {
  const response = await fetch('/api/admin/settings')
  
  if (!response.ok) {
    throw new Error('Failed to fetch settings')
  }
  
  return response.json()
}

async function saveSettings(data: SaveSettingsData): Promise<void> {
  const response = await fetch('/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error('Failed to save settings')
  }
}

/**
 * Hook for fetching admin settings
 */
export function useAdminSettings() {
  return useQuery({
    queryKey: adminSettingsKeys.settings(),
    queryFn: fetchSettings,
  })
}

/**
 * Hook for saving admin settings
 */
export function useSaveAdminSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsKeys.settings() })
    },
  })
}

// Default settings for initial state
export const DEFAULT_SETTINGS: AdminSettings = {
  general: {
    siteName: 'ArtisanLink',
    siteDescription: 'Connecting clients with skilled artisans in Kenya',
    maintenanceMode: false,
    registrationEnabled: true,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
  },
  security: {
    twoFactorRequired: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    ipWhitelisting: false,
  },
  features: {
    projectBidding: true,
    directMessaging: true,
    fileUploads: true,
    videoChat: false,
    paymentProcessing: true,
  },
}
