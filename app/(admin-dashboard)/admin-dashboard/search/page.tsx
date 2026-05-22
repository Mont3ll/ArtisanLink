'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Clock,
  User,
  Settings,
  TrendingUp,
  MapPin,
  Star,
  Briefcase,
  AlertTriangle
} from 'lucide-react'
import {
  useAdminSearchMutation,
  getStatusBadgeClass,
  formatKESCurrency,
  QUICK_SEARCHES,
  type AdminSearchData,
  type AdminSearchFilters,
} from '@/lib/hooks'

const quickSearchIcons = {
  'Verified Artisans': User,
  'Recent Activities': Clock,
  'System Settings': Settings,
  'Trending': TrendingUp,
} as const

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<AdminSearchFilters['type']>('all')
  const [searchData, setSearchData] = useState<AdminSearchData | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const { mutate: performSearch, isPending: isSearching, error } = useAdminSearchMutation()

  const handleSearch = (query?: string) => {
    const searchTerm = query ?? searchQuery
    setHasSearched(true)
    
    performSearch(
      { 
        query: searchTerm,
        type: activeTab,
        limit: 20 
      },
      {
        onSuccess: (data) => {
          setSearchData(data)
        }
      }
    )
  }

  const getStatusBadge = (status: string) => {
    const className = getStatusBadgeClass(status)
    if (className) {
      return <Badge className={className}>{status}</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search</h1>
          <p className="text-muted-foreground">Search across users, artisans, and activities</p>
        </div>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users, artisans, activities..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Search Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Searches</CardTitle>
          <CardDescription>Popular searches and suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map((item) => {
              const Icon = quickSearchIcons[item.label as keyof typeof quickSearchIcons] || Search
              return (
                <Button 
                  key={item.label}
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSearchQuery(item.query)
                    handleSearch(item.query)
                  }}
                  disabled={isSearching}
                >
                  <Icon className="h-3 w-3 mr-2" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Search error: {error instanceof Error ? error.message : 'Unknown error'}</span>
              <Button variant="outline" size="sm" onClick={() => handleSearch()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State - Per Component Skeletons */}
      {isSearching && (
        <Tabs value={activeTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="artisans">Artisans</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users Results Skeleton */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Users</CardTitle>
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Artisans Results Skeleton */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Artisans</CardTitle>
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Activities Results Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-3 w-56 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </Tabs>
      )}

      {/* Search Results */}
      {!isSearching && hasSearched && searchData && (
        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value as AdminSearchFilters['type']); }} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All Results ({searchData.counts.total})
            </TabsTrigger>
            <TabsTrigger value="users">
              Users ({searchData.counts.users})
            </TabsTrigger>
            <TabsTrigger value="artisans">
              Artisans ({searchData.counts.artisans})
            </TabsTrigger>
            <TabsTrigger value="activities">
              Activities ({searchData.counts.activities})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users Results */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Users</CardTitle>
                    <CardDescription>{searchData.results.users.length} results shown</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {searchData.results.users.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No users found</p>
                  ) : (
                    searchData.results.users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{user.role}</Badge>
                          {getStatusBadge(user.status)}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Artisans Results */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Artisans</CardTitle>
                    <CardDescription>{searchData.results.artisans.length} results shown</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {searchData.results.artisans.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No artisans found</p>
                  ) : (
                    searchData.results.artisans.slice(0, 5).map((artisan) => (
                      <div key={artisan.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{artisan.name}</div>
                            {artisan.isVerified && (
                              <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span>{artisan.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({artisan.totalReviews})</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {artisan.profession && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {artisan.profession}
                            </div>
                          )}
                          {artisan.county && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {artisan.county} County
                            </div>
                          )}
                          {artisan.hourlyRate && (
                            <div>{formatKESCurrency(artisan.hourlyRate)}/hr</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activities Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activities</CardTitle>
                <CardDescription>{searchData.results.activities.length} results shown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {searchData.results.activities.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No activities found</p>
                ) : (
                  searchData.results.activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">{activity.details || 'No details'}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()} by {activity.adminEmail}
                        </div>
                      </div>
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Search Results</CardTitle>
                <CardDescription>Found {searchData.counts.users} users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {searchData.results.users.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No users found</p>
                ) : (
                  searchData.results.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium text-lg">{user.name}</div>
                          <div className="text-muted-foreground">{user.email}</div>
                          <div className="text-sm text-muted-foreground">
                            Joined: {new Date(user.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{user.role}</Badge>
                        {getStatusBadge(user.status)}
                        <Link href={`/admin-dashboard/users`}><Button variant="outline" size="sm">View</Button></Link>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="artisans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Artisan Search Results</CardTitle>
                <CardDescription>Found {searchData.counts.artisans} artisans</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {searchData.results.artisans.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No artisans found</p>
                ) : (
                  searchData.results.artisans.map((artisan) => (
                    <div key={artisan.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-lg">{artisan.name}</div>
                            {artisan.isVerified && (
                              <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground">{artisan.email}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{artisan.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({artisan.totalReviews} reviews)</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Profession:</span>
                          <div className="font-medium">{artisan.profession || 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <div className="font-medium">{artisan.county ? `${artisan.county} County` : 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hourly Rate:</span>
                          <div className="font-medium">
                            {artisan.hourlyRate ? formatKESCurrency(artisan.hourlyRate) : 'Not set'}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div>{getStatusBadge(artisan.status)}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Link href={`/artisans/${artisan.id}`}><Button variant="outline" size="sm">View Profile</Button></Link>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Search Results</CardTitle>
                <CardDescription>Found {searchData.counts.activities} activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {searchData.results.activities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No activities found</p>
                ) : (
                  searchData.results.activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-medium">{activity.action}</div>
                          <Badge variant="outline">{activity.type}</Badge>
                        </div>
                        <div className="text-muted-foreground mb-2">{activity.details || 'No additional details'}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()} by {activity.adminEmail}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Initial State - No Search Yet */}
      {!hasSearched && !isSearching && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter a search term or use quick searches to find users, artisans, and activities</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
