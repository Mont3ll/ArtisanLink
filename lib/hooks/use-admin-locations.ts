'use client'

import { useQuery } from '@tanstack/react-query'

// Types
export interface County {
  id: string
  name: string
  artisanCount: number
  active: boolean
  featured: boolean
}

export interface Region {
  id: string
  name: string
  counties: number
  totalCounties: number
  artisanCount: number
  countyList: County[]
}

export interface City {
  id: string
  name: string
  county: string
  artisanCount: number
  active: boolean
  featured: boolean
}

export interface TopCounty {
  id: string
  name: string
  artisanCount: number
  rank: number
}

export interface LocationStats {
  totalCounties: number
  activeCounties: number
  activeCities: number
  featuredLocations: number
  coverageScore: number
  totalArtisans: number
}

export interface LocationMetadata {
  country: string
  totalRegions: number
  lastUpdated: string
}

export interface LocationData {
  stats: LocationStats
  regions: Region[]
  counties: County[]
  cities: City[]
  topCounties: TopCounty[]
  metadata: LocationMetadata
}

export interface LocationFilters {
  includeEmpty?: boolean
}

// Query keys
export const adminLocationsKeys = {
  all: ['admin-locations'] as const,
  stats: (filters: LocationFilters) => [...adminLocationsKeys.all, 'stats', filters] as const,
}

// Fetch function
async function fetchLocationStats(filters: LocationFilters): Promise<LocationData> {
  const params = new URLSearchParams()
  if (filters.includeEmpty) {
    params.set('includeEmpty', 'true')
  }
  
  const response = await fetch(`/api/admin/locations/stats?${params}`)
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch location stats')
  }
  
  return response.json()
}

/**
 * Hook for fetching admin location statistics
 */
export function useAdminLocations(filters: LocationFilters = {}) {
  return useQuery({
    queryKey: adminLocationsKeys.stats(filters),
    queryFn: () => fetchLocationStats(filters),
  })
}

// Map county data for map component
export interface MapCounty {
  name: string
  artisanCount: number
  featured: boolean
}

export function mapCountiesForMap(counties: County[]): MapCounty[] {
  return counties.map(c => ({
    name: c.name,
    artisanCount: c.artisanCount,
    featured: c.featured,
  }))
}
