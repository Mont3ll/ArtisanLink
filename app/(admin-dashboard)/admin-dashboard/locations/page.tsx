'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MapPin, 
  RefreshCw,
  Users,
  Building,
  Globe,
  Map,
  TrendingUp
} from 'lucide-react'
import {
  useAdminLocations,
  mapCountiesForMap,
  type County,
} from '@/lib/hooks'

// Dynamically import the map component to avoid SSR issues with Mapbox
const ArtisanMap = dynamic(
  () => import('@/components/shared/map/artisan-map'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      </div>
    )
  }
)

export default function LocationsPage() {
  const [includeEmpty, setIncludeEmpty] = useState(false)
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null)

  const { data: locationData, isLoading, error, refetch } = useAdminLocations({ includeEmpty })

  const stats = locationData?.stats
  const regions = locationData?.regions ?? []
  const counties = locationData?.counties ?? []
  const cities = locationData?.cities ?? []
  const topCounties = locationData?.topCounties ?? []
  const metadata = locationData?.metadata

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations Management</h1>
          <div className="text-muted-foreground mt-2">
            {isLoading ? (
              <Skeleton className="h-5 w-80 inline-block" />
            ) : metadata ? (
              `Artisan distribution across ${metadata.country} (${metadata.totalRegions} regions, ${stats?.totalCounties ?? 0} counties)`
            ) : (
              'Artisan distribution across Kenya'
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIncludeEmpty(!includeEmpty)}
          >
            {includeEmpty ? 'Hide Empty' : 'Show All Counties'}
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <span>Error loading location data: {error instanceof Error ? error.message : 'Unknown error'}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Counties</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeCounties ?? 0}</div>
                <p className="text-xs text-muted-foreground">of {stats?.totalCounties ?? 0} counties</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cities</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeCities ?? 0}</div>
                <p className="text-xs text-muted-foreground">Cities with artisans</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artisans</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalArtisans ?? 0}</div>
                <p className="text-xs text-muted-foreground">Registered artisans</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Score</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.coverageScore ?? 0}%</div>
                <p className="text-xs text-muted-foreground">County coverage</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Counties Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Counties by Artisan Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-6 w-32" />
              ))}
            </div>
          ) : topCounties.length === 0 ? (
            <p className="text-muted-foreground text-sm">No county data available</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topCounties.map((county) => (
                <Badge key={county.id} variant="secondary" className="text-sm">
                  #{county.rank} {county.name}: {county.artisanCount} artisans
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Tabs */}
      <Tabs defaultValue="map" className="space-y-6">
        <TabsList>
          <TabsTrigger value="map">
            <Map className="h-4 w-4 mr-2" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="regions">
            Regions {isLoading ? '' : `(${regions.length})`}
          </TabsTrigger>
          <TabsTrigger value="counties">
            Counties {isLoading ? '' : `(${counties.length})`}
          </TabsTrigger>
          <TabsTrigger value="cities">
            Cities {isLoading ? '' : `(${cities.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Artisan Distribution Map
              </CardTitle>
              <CardDescription>
                Interactive map showing artisan distribution across Kenya&apos;s 47 counties. 
                Click on markers to view county details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[500px] w-full rounded-lg" />
              ) : (
                <ArtisanMap 
                  counties={mapCountiesForMap(counties)}
                  height="500px"
                  onCountyClick={(county) => {
                    const fullCounty = counties.find(c => c.name === county.name)
                    if (fullCounty) {
                      setSelectedCounty(fullCounty)
                    }
                  }}
                  showLegend={true}
                />
              )}
              
              {/* Selected County Details */}
              {selectedCounty && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">{selectedCounty.name} County</h4>
                      <p className="text-sm text-blue-700">
                        {selectedCounty.artisanCount} registered artisan{selectedCounty.artisanCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedCounty.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                      )}
                      <Badge variant={selectedCounty.active ? "default" : "secondary"}>
                        {selectedCounty.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedCounty(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regions of Kenya</CardTitle>
              <CardDescription>Artisan distribution by administrative region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  ))
                ) : regions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No regions with artisans found</p>
                ) : (
                  regions.map((region) => (
                    <div key={region.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">{region.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {region.counties} of {region.totalCounties} counties active
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{region.artisanCount} artisans</Badge>
                        <Badge 
                          variant={region.artisanCount > 0 ? "default" : "secondary"}
                        >
                          {region.artisanCount > 0 ? 'Active' : 'No Artisans'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Counties</CardTitle>
              <CardDescription>Kenya has 47 counties - showing those with artisan activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-36 mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  ))
                ) : counties.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No counties with artisans found</p>
                ) : (
                  counties.map((county) => (
                    <div key={county.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Globe className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium">{county.name} County</div>
                          <div className="text-sm text-muted-foreground">
                            {county.artisanCount} artisans registered
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {county.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                        )}
                        <Badge variant={county.active ? "default" : "secondary"}>
                          {county.active ? `${county.artisanCount} artisans` : "No Artisans"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cities & Towns</CardTitle>
              <CardDescription>Top cities by artisan count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-28 mb-1" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  ))
                ) : cities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No cities with artisans found</p>
                ) : (
                  cities.map((city) => (
                    <div key={city.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Building className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{city.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {city.county} County &bull; {city.artisanCount} artisans
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {city.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                        )}
                        <Badge variant={city.active ? "default" : "secondary"}>
                          {city.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated Footer */}
      <div className="text-xs text-muted-foreground text-right">
        {isLoading ? (
          <Skeleton className="h-3 w-48 ml-auto" />
        ) : metadata ? (
          `Last updated: ${new Date(metadata.lastUpdated).toLocaleString()}`
        ) : null}
      </div>
    </div>
  )
}
