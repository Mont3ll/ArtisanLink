'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, 
  Plus,
  Edit,
  Users,
  Building,
  Globe
} from 'lucide-react'

export default function LocationsPage() {
  const locationData = {
    countries: [
      { id: '1', name: 'United States', artisanCount: 1250, cities: 45 },
      { id: '2', name: 'Canada', artisanCount: 320, cities: 15 },
      { id: '3', name: 'United Kingdom', artisanCount: 480, cities: 22 }
    ],
    cities: [
      { 
        id: '1', 
        name: 'New York, NY', 
        country: 'United States',
        artisanCount: 180, 
        active: true,
        featured: true 
      },
      { 
        id: '2', 
        name: 'Los Angeles, CA', 
        country: 'United States',
        artisanCount: 145, 
        active: true,
        featured: false 
      },
      { 
        id: '3', 
        name: 'Toronto, ON', 
        country: 'Canada',
        artisanCount: 95, 
        active: true,
        featured: true 
      }
    ],
    regions: [
      { 
        id: '1', 
        name: 'North America', 
        countries: 2, 
        artisanCount: 1570 
      },
      { 
        id: '2', 
        name: 'Europe', 
        countries: 1, 
        artisanCount: 480 
      }
    ]
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations Management</h1>
          <p className="text-gray-600 mt-2">Manage geographical coverage and service areas</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationData.countries.length}</div>
            <p className="text-xs text-muted-foreground">Countries served</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cities</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationData.cities.filter(c => c.active).length}</div>
            <p className="text-xs text-muted-foreground">Cities with artisans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationData.cities.filter(c => c.featured).length}</div>
            <p className="text-xs text-muted-foreground">Featured cities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Score</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Market coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Location Tabs */}
      <Tabs defaultValue="countries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
        </TabsList>

        <TabsContent value="countries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Countries</CardTitle>
              <CardDescription>Manage country-level service areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationData.countries.map((country) => (
                  <div key={country.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Globe className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{country.name}</div>
                        <div className="text-sm text-gray-600">
                          {country.artisanCount} artisans • {country.cities} cities
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{country.artisanCount} artisans</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cities</CardTitle>
              <CardDescription>Manage city-level service coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationData.cities.map((city) => (
                  <div key={city.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Building className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-600">
                          {city.country} • {city.artisanCount} artisans
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
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regions</CardTitle>
              <CardDescription>Manage regional service areas and groupings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationData.regions.map((region) => (
                  <div key={region.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{region.name}</div>
                        <div className="text-sm text-gray-600">
                          {region.countries} countries • {region.artisanCount} artisans
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{region.artisanCount} artisans</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
