/**
 * Artisan Settings Adapter
 * Provides the 47 Kenyan counties list, profile completion calculator,
 * and adapts artisan settings hooks for use in source-admin-preview.tsx.
 *
 * Real hook exports used (from use-artisan-settings.ts):
 *   useArtisanProfile()          → { data: { profile }, isLoading }
 *   useArtisanSpecializations()  → { data: { specializations, categories }, isLoading }
 *   useUpdateArtisanProfile()    → useMutation
 *   useUpdateLocation()          → useMutation
 *   useAddSpecialization()       → useMutation
 *   useDeleteSpecialization()    → useMutation
 */
import {
  useArtisanProfile,
  useArtisanSpecializations,
  useUpdateArtisanProfile,
  useUpdateLocation,
  useAddSpecialization,
  useDeleteSpecialization,
} from './use-artisan-settings'
import type { ArtisanProfile, Specialization, NewSpecialization, LocationUpdate } from './use-artisan-settings'

export const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
] as const

export type KenyanCounty = (typeof KENYAN_COUNTIES)[number]

export interface ProfileCompletionInputs {
  bio: string | null
  profession: string | null
  county: string | null
  hourlyRate: number | null
  certificateUrl: string | null
  artisanStatus: string | null
  portfolioCount: number
  specializationCount: number
}

/**
 * Computes profile completion percentage (0–100) from real profile fields.
 * Scoring:
 *   50 — base (account exists)
 *    5 — bio filled
 *    5 — profession set
 *    5 — county set
 *    5 — hourly rate set
 *   10 — certificate uploaded
 *   10 — artisan status is VERIFIED
 *   10 — 2+ portfolio items (5 pts for exactly 1)
 *   10 — at least 1 specialization
 * Max: 110 (capped at 100)
 */
export function buildProfileCompletionPct(inputs: ProfileCompletionInputs): number {
  let pct = 50
  if (inputs.bio) pct += 5
  if (inputs.profession) pct += 5
  if (inputs.county) pct += 5
  if (inputs.hourlyRate) pct += 5
  if (inputs.certificateUrl) pct += 10
  if (inputs.artisanStatus === 'VERIFIED') pct += 10
  if (inputs.portfolioCount >= 2) pct += 10
  else if (inputs.portfolioCount === 1) pct += 5
  if (inputs.specializationCount >= 1) pct += 10
  return Math.min(100, pct)
}

export type { ArtisanProfile, Specialization, NewSpecialization, LocationUpdate }

/**
 * Hook that returns artisan profile + specializations + computed completion %.
 * Re-exports mutation hooks for use in settings tab handlers.
 */
export function useArtisanSettingsAdapter() {
  const { data: profileData, isLoading: profileLoading } = useArtisanProfile()
  const { data: specData, isLoading: specLoading } = useArtisanSpecializations()

  const profile = profileData?.profile ?? null
  const specializations: Specialization[] = specData?.specializations ?? []
  const categories: string[] = specData?.categories ?? []

  const completionPct = buildProfileCompletionPct({
    bio: profile?.bio ?? null,
    profession: profile?.profession ?? null,
    county: profile?.county ?? null,
    hourlyRate: profile?.hourlyRate ?? null,
    certificateUrl: profile?.certificateUrl ?? null,
    artisanStatus: profile?.artisanStatus ?? null,
    portfolioCount: 0, // caller should pass in portfolioRows.length from portfolio adapter
    specializationCount: specializations.length,
  })

  return {
    profile,
    specializations,
    categories,
    completionPct,
    isLoading: profileLoading || specLoading,
    counties: KENYAN_COUNTIES as unknown as string[],
    // Mutations — callers use these directly
    useUpdateProfile: useUpdateArtisanProfile,
    useUpdateLocation,
    useAddSpecialization,
    useDeleteSpecialization,
  }
}
