'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Hammer, 
  Search,
  Filter,
  MapPin,
  Star,
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  AlertCircle,
} from 'lucide-react'
import { useAdminArtisans, type AdminArtisan } from '@/lib/hooks'
import InviteArtisans from '@/components/dashboard/admin/invite-artisans'

export default function ArtisansPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'VERIFIED' | 'REJECTED' | undefined>()
  const [subscriptionFilter, setSubscriptionFilter] = useState<'ACTIVE' | 'INACTIVE' | 'EXPIRED' | undefined>()

  const { data, isLoading, isError, refetch } = useAdminArtisans({
    page,
    limit: 20,
    search: searchTerm || undefined,
    status: statusFilter,
    subscriptionStatus: subscriptionFilter,
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">Active</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">Inactive</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Stats from API
  const stats = data?.stats
  const artisans = data?.artisans || []

  // Filter artisans for tabs (client-side filtering for display)
  const verifiedArtisans = artisans.filter(a => a.status === 'VERIFIED')
  const pendingArtisans = artisans.filter(a => a.status === 'PENDING')
  const subscribedArtisans = artisans.filter(a => a.subscriptionStatus === 'ACTIVE')

  // Error state
  if (isError) {
    return (
      <div className="px-4 lg:px-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Failed to load artisans</h2>
            <p className="text-muted-foreground mb-4">There was an error loading the artisan directory.</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artisan Directory</h1>
          <p className="text-muted-foreground">Manage and oversee all platform artisans</p>
        </div>
        <Button>Export Directory</Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artisans</CardTitle>
            <Hammer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
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
            <CardTitle className="text-sm font-medium">Verified Artisans</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.verifiedCount ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats && stats.totalArtisans > 0 
                    ? `${((stats.verifiedCount / stats.totalArtisans) * 100).toFixed(1)}% of total`
                    : '0% of total'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.pendingCount ?? 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeSubscriptions ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats && stats.totalArtisans > 0
                    ? `${((stats.activeSubscriptions / stats.totalArtisans) * 100).toFixed(1)}% subscription rate`
                    : '0% subscription rate'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artisans..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1) // Reset to first page on search
                }}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Artisans Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Artisans ({stats?.totalArtisans ?? 0})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({stats?.verifiedCount ?? 0})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats?.pendingCount ?? 0})</TabsTrigger>
          <TabsTrigger value="subscribed">Subscribed ({stats?.activeSubscriptions ?? 0})</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Artisans</CardTitle>
              <CardDescription>Complete directory of platform artisans</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ArtisanTableSkeleton />
              ) : artisans.length === 0 ? (
                <EmptyState message="No artisans found" />
              ) : (
                <ArtisanTable 
                  artisans={artisans} 
                  getStatusBadge={getStatusBadge}
                  getSubscriptionBadge={getSubscriptionBadge}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verified Artisans</CardTitle>
              <CardDescription>Artisans with verified certificates and profiles</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ArtisanCardsSkeleton />
              ) : verifiedArtisans.length === 0 ? (
                <EmptyState message="No verified artisans found" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {verifiedArtisans.map((artisan) => (
                    <ArtisanCard 
                      key={artisan.id} 
                      artisan={artisan} 
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verification</CardTitle>
              <CardDescription>Artisans awaiting verification approval</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <PendingListSkeleton />
              ) : pendingArtisans.length === 0 ? (
                <EmptyState message="No pending verifications" />
              ) : (
                <div className="divide-y">
                  {pendingArtisans.map((artisan) => (
                    <PendingArtisanRow 
                      key={artisan.id} 
                      artisan={artisan}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscribed Artisans</CardTitle>
              <CardDescription>Artisans with active premium subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <PendingListSkeleton />
              ) : subscribedArtisans.length === 0 ? (
                <EmptyState message="No subscribed artisans found" />
              ) : (
                <div className="divide-y">
                  {subscribedArtisans.map((artisan) => (
                    <SubscribedArtisanRow 
                      key={artisan.id} 
                      artisan={artisan}
                      getSubscriptionBadge={getSubscriptionBadge}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="space-y-6">
          <InviteArtisans />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {!isLoading && data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

// Sub-components
function ArtisanTable({ 
  artisans, 
  getStatusBadge, 
  getSubscriptionBadge 
}: { 
  artisans: AdminArtisan[]
  getStatusBadge: (status: string) => React.ReactNode
  getSubscriptionBadge: (status: string) => React.ReactNode
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Artisan</TableHead>
          <TableHead>Profession</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Subscription</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {artisans.map((artisan) => (
          <TableRow key={artisan.id}>
            <TableCell>
              <div>
                <div className="font-medium">{artisan.name}</div>
                <div className="text-sm text-muted-foreground">{artisan.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Hammer className="h-4 w-4 text-muted-foreground" />
                {artisan.profession || 'Not specified'}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {artisan.location || 'Not specified'}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">{artisan.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({artisan.totalReviews})</span>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(artisan.status)}</TableCell>
            <TableCell>{getSubscriptionBadge(artisan.subscriptionStatus)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(artisan.lastActive).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ArtisanCard({ 
  artisan, 
  getStatusBadge 
}: { 
  artisan: AdminArtisan
  getStatusBadge: (status: string) => React.ReactNode
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium">{artisan.name}</h3>
          <p className="text-sm text-muted-foreground">{artisan.profession || 'Not specified'}</p>
        </div>
        {getStatusBadge(artisan.status)}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          {artisan.location || 'Not specified'}
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-400 fill-current" />
          {artisan.rating.toFixed(1)} ({artisan.totalReviews} reviews)
        </div>
        <div className="text-muted-foreground">
          {artisan.experience} years experience
        </div>
        <div className="text-muted-foreground">
          {artisan.portfolioItems} portfolio items
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        <Button variant="outline" size="sm">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function PendingArtisanRow({ 
  artisan, 
  getStatusBadge 
}: { 
  artisan: AdminArtisan
  getStatusBadge: (status: string) => React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0">
      {/* Avatar */}
      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Hammer className="h-4 w-4 text-orange-600" />
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">{artisan.name}</span>
          {getStatusBadge(artisan.status)}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {artisan.profession || 'No profession'}
          {artisan.location ? ` · ${artisan.location}` : ''}
        </p>
      </div>
      {/* Action — navigates to verification page */}
      <Link href="/admin-dashboard/artisans?tab=verification">
        <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
          <Eye className="h-3 w-3 mr-1" />
          Review
        </Button>
      </Link>
    </div>
  )
}

function SubscribedArtisanRow({ 
  artisan, 
  getSubscriptionBadge 
}: { 
  artisan: AdminArtisan
  getSubscriptionBadge: (status: string) => React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0">
      {/* Avatar */}
      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Star className="h-4 w-4 text-emerald-600" />
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">{artisan.name}</span>
          {getSubscriptionBadge(artisan.subscriptionStatus)}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {artisan.profession || 'No profession'}
          {artisan.rating > 0 ? ` · ★ ${artisan.rating.toFixed(1)} (${artisan.totalReviews})` : ''}
        </p>
      </div>
      {/* Action */}
      <Link href={`/admin-dashboard/artisans?id=${artisan.id}`}>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5">
          <Eye className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Hammer className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  )
}

// Skeleton components
function ArtisanTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}

function ArtisanCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

function PendingListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}
