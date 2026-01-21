'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface Specialization {
  id: string
  name: string
  category: string | null
  skillLevel: number
  yearsExp: number | null
  createdAt: string
}

export interface ArtisanProfile {
  id: string
  bio: string | null
  profession: string | null
  experience: number | null
  hourlyRate: number | null
  isAvailable: boolean
  certificateUrl: string | null
  certificateUploadedAt: string | null
  artisanStatus: string | null
  verifiedAt: string | null
  latitude: number | null
  longitude: number | null
  address: string | null
  city: string | null
  county: string | null
}

export interface SpecializationsData {
  specializations: Specialization[]
  categories: string[]
}

export interface NewSpecialization {
  name: string
  category: string | null
  skillLevel: number
  yearsExp: number | null
}

export interface LocationUpdate {
  county: string | null
  city: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
}

export interface CertificateUpdate {
  certificateUrl: string
  certificateUploadedAt: string
}

// Query keys
export const artisanSettingsKeys = {
  all: ['artisan-settings'] as const,
  profile: () => [...artisanSettingsKeys.all, 'profile'] as const,
  specializations: () => [...artisanSettingsKeys.all, 'specializations'] as const,
}

// Default values for when API fails
const defaultProfile: { profile: ArtisanProfile | null } = { profile: null }
const defaultSpecializations: SpecializationsData = { specializations: [], categories: [] }

// Fetch functions
async function fetchProfile(): Promise<{ profile: ArtisanProfile | null }> {
  try {
    const response = await fetch('/api/user/me')
    if (response.status === 403 || response.status === 404) {
      console.warn('[useArtisanProfile] User not authorized or not found, returning defaults')
      return defaultProfile
    }
    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }
    return response.json()
  } catch (error) {
    console.error('[useArtisanProfile] Error fetching profile:', error)
    return defaultProfile
  }
}

async function fetchSpecializations(): Promise<SpecializationsData> {
  try {
    const response = await fetch('/api/artisan/specializations')
    if (response.status === 403 || response.status === 404) {
      console.warn('[useArtisanSpecializations] User not authorized or not found, returning defaults')
      return defaultSpecializations
    }
    if (!response.ok) {
      throw new Error('Failed to fetch specializations')
    }
    return response.json()
  } catch (error) {
    console.error('[useArtisanSpecializations] Error fetching specializations:', error)
    return defaultSpecializations
  }
}

async function updateProfile(data: Partial<ArtisanProfile>): Promise<{ profile: ArtisanProfile }> {
  const response = await fetch('/api/artisan/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update profile')
  }
  return response.json()
}

async function addSpecialization(data: NewSpecialization): Promise<Specialization> {
  const response = await fetch('/api/artisan/specializations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to add specialization')
  }
  return response.json()
}

async function deleteSpecialization(id: string): Promise<void> {
  const response = await fetch(`/api/artisan/specializations/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error('Failed to delete specialization')
  }
}

/**
 * Hook for fetching artisan profile
 */
export function useArtisanProfile() {
  return useQuery({
    queryKey: artisanSettingsKeys.profile(),
    queryFn: fetchProfile,
  })
}

/**
 * Hook for fetching specializations
 */
export function useArtisanSpecializations() {
  return useQuery({
    queryKey: artisanSettingsKeys.specializations(),
    queryFn: fetchSpecializations,
  })
}

/**
 * Hook for updating artisan profile (availability, location, certificate)
 */
export function useUpdateArtisanProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(artisanSettingsKeys.profile(), { profile: data.profile })
    },
  })
}

/**
 * Hook for toggling availability
 */
export function useToggleAvailability() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (isAvailable: boolean) => updateProfile({ isAvailable }),
    onSuccess: (data) => {
      queryClient.setQueryData(artisanSettingsKeys.profile(), { profile: data.profile })
    },
  })
}

/**
 * Hook for updating location
 */
export function useUpdateLocation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (location: LocationUpdate) => updateProfile(location),
    onSuccess: (data) => {
      queryClient.setQueryData(artisanSettingsKeys.profile(), { profile: data.profile })
    },
  })
}

/**
 * Hook for updating certificate
 */
export function useUpdateCertificate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (certificate: CertificateUpdate) => updateProfile(certificate),
    onSuccess: (data) => {
      queryClient.setQueryData(artisanSettingsKeys.profile(), { profile: data.profile })
    },
  })
}

/**
 * Hook for adding specialization
 */
export function useAddSpecialization() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: addSpecialization,
    onSuccess: (newSpec) => {
      queryClient.setQueryData<SpecializationsData>(
        artisanSettingsKeys.specializations(),
        (old) => old ? {
          ...old,
          specializations: [...old.specializations, newSpec]
        } : { specializations: [newSpec], categories: [] }
      )
    },
  })
}

/**
 * Hook for deleting specialization
 */
export function useDeleteSpecialization() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteSpecialization,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<SpecializationsData>(
        artisanSettingsKeys.specializations(),
        (old) => old ? {
          ...old,
          specializations: old.specializations.filter(s => s.id !== deletedId)
        } : { specializations: [], categories: [] }
      )
    },
  })
}

// Skill level constants
export const SKILL_LEVELS = [
  { value: 1, label: 'Beginner', color: 'bg-gray-500' },
  { value: 2, label: 'Basic', color: 'bg-blue-500' },
  { value: 3, label: 'Intermediate', color: 'bg-green-500' },
  { value: 4, label: 'Advanced', color: 'bg-orange-500' },
  { value: 5, label: 'Expert', color: 'bg-purple-500' }
] as const

// Kenyan counties
export const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos',
  'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Muranga',
  'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans-Nzoia',
  'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
] as const

// Utility functions
export function getSkillLevel(level: number) {
  return SKILL_LEVELS.find(s => s.value === level) || SKILL_LEVELS[0]
}

export function getVerificationStatusClass(status: string | null): string {
  switch (status) {
    case 'VERIFIED':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    default:
      return ''
  }
}
