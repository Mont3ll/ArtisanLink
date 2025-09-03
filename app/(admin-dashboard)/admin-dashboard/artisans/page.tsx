'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  UserX
} from 'lucide-react'

interface ArtisanData {
  id: string
  name: string
  email: string
  profession: string
  location: string
  experience: number
  rating: number
  totalReviews: number
  portfolioItems: number
  status: 'VERIFIED' | 'PENDING' | 'REJECTED'
  joinDate: string
  lastActive: string
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
}

const mockArtisans: ArtisanData[] = [
  {
    id: '1',
    name: 'John Mwangi',
    email: 'john.mwangi@example.com',
    profession: 'Carpenter',
    location: 'Nairobi, Kenya',
    experience: 8,
    rating: 4.8,
    totalReviews: 24,
    portfolioItems: 12,
    status: 'VERIFIED',
    joinDate: '2024-01-15',
    lastActive: '2024-03-14',
    subscriptionStatus: 'ACTIVE'
  },
  {
    id: '2',
    name: 'Sarah Wanjiku',
    email: 'sarah.wanjiku@example.com',
    profession: 'Tailor',
    location: 'Mombasa, Kenya',
    experience: 5,
    rating: 4.6,
    totalReviews: 18,
    portfolioItems: 15,
    status: 'VERIFIED',
    joinDate: '2024-02-20',
    lastActive: '2024-03-13',
    subscriptionStatus: 'ACTIVE'
  },
  {
    id: '3',
    name: 'Peter Kiprotich',
    email: 'peter.kiprotich@example.com',
    profession: 'Electrician',
    location: 'Eldoret, Kenya',
    experience: 12,
    rating: 4.9,
    totalReviews: 31,
    portfolioItems: 8,
    status: 'VERIFIED',
    joinDate: '2023-11-10',
    lastActive: '2024-03-15',
    subscriptionStatus: 'ACTIVE'
  },
  {
    id: '4',
    name: 'Grace Nyong\'o',
    email: 'grace.nyongo@example.com',
    profession: 'Hair Stylist',
    location: 'Kisumu, Kenya',
    experience: 3,
    rating: 4.4,
    totalReviews: 12,
    portfolioItems: 20,
    status: 'PENDING',
    joinDate: '2024-03-01',
    lastActive: '2024-03-12',
    subscriptionStatus: 'INACTIVE'
  }
]

export default function ArtisansPage() {
  const [artisans] = useState<ArtisanData[]>(mockArtisans)
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredArtisans = artisans.filter(artisan =>
    artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const verifiedArtisans = artisans.filter(a => a.status === 'VERIFIED')
  const pendingArtisans = artisans.filter(a => a.status === 'PENDING')
  const activeSubscriptions = artisans.filter(a => a.subscriptionStatus === 'ACTIVE')

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Artisan Directory</h1>
          <p className="mt-2">Manage and oversee all platform artisans</p>
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
            <div className="text-2xl font-bold">{artisans.length}</div>
            <p className="text-xs text-muted-foreground">Registered artisans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Artisans</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedArtisans.length}</div>
            <p className="text-xs text-muted-foreground">
              {((verifiedArtisans.length / artisans.length) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingArtisans.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              {((activeSubscriptions.length / artisans.length) * 100).toFixed(1)}% subscription rate
            </p>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
          <TabsTrigger value="all">All Artisans ({artisans.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({verifiedArtisans.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingArtisans.length})</TabsTrigger>
          <TabsTrigger value="subscribed">Subscribed ({activeSubscriptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Artisans</CardTitle>
              <CardDescription>Complete directory of platform artisans</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {filteredArtisans.map((artisan) => (
                    <TableRow key={artisan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{artisan.name}</div>
                          <div className="text-sm text-gray-500">{artisan.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Hammer className="h-4 w-4 text-gray-400" />
                          {artisan.profession}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {artisan.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{artisan.rating}</span>
                          <span className="text-sm text-gray-500">({artisan.totalReviews})</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(artisan.status)}</TableCell>
                      <TableCell>{getSubscriptionBadge(artisan.subscriptionStatus)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedArtisans.map((artisan) => (
                  <div key={artisan.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{artisan.name}</h3>
                        <p className="text-sm text-gray-600">{artisan.profession}</p>
                      </div>
                      {getStatusBadge(artisan.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {artisan.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        {artisan.rating} ({artisan.totalReviews} reviews)
                      </div>
                      <div className="text-gray-500">
                        {artisan.experience} years experience
                      </div>
                      <div className="text-gray-500">
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
                ))}
              </div>
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
              <div className="space-y-4">
                {pendingArtisans.map((artisan) => (
                  <div key={artisan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Hammer className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{artisan.name}</div>
                        <div className="text-sm text-gray-600">{artisan.profession}</div>
                        <div className="text-sm text-gray-500">{artisan.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(artisan.status)}
                      <Button variant="outline" size="sm">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                {activeSubscriptions.map((artisan) => (
                  <div key={artisan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{artisan.name}</div>
                        <div className="text-sm text-gray-600">{artisan.profession}</div>
                        <div className="text-sm text-gray-500">
                          ⭐ {artisan.rating} • {artisan.totalReviews} reviews
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getSubscriptionBadge(artisan.subscriptionStatus)}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
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
