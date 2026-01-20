'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  TrendingUp, 
  MoreVertical,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  useAdminSubscriptions,
  formatCurrency,
  getStatusBadgeVariant,
  getPlanBadgeVariant,
} from '@/lib/hooks/use-admin-subscriptions'

// Skeleton Components
function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-28 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-40" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  )
}

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  // React Query hook
  const { data, isLoading, error, refetch } = useAdminSubscriptions()

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    if (!data?.recentSubscriptions) return []
    
    return data.recentSubscriptions.filter(sub =>
      sub.profile?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.profile?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.profile?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data?.recentSubscriptions, searchTerm])

  // Unique plans and statuses for tabs
  const uniquePlans = useMemo(() => {
    if (!data?.stats) return []
    return Array.from(new Set(data.stats.map(s => s.plan)))
  }, [data?.stats])

  const uniqueStatuses = useMemo(() => {
    if (!data?.stats) return []
    return Array.from(new Set(data.stats.map(s => s.status)))
  }, [data?.stats])

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Failed to load subscriptions</h2>
          <p className="text-muted-foreground mb-4">There was an error loading the subscription data.</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground">Monitor and manage platform subscriptions</p>
        </div>
        <Button>Export Data</Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-28 mb-1" />
                <Skeleton className="h-3 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(data?.metrics.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +8.2% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Subscriptions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.metrics.activeSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.metrics.totalSubscriptions 
                    ? ((data.metrics.activeSubscriptions / data.metrics.totalSubscriptions) * 100).toFixed(1) 
                    : 0}% of total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Subscriptions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-28" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.metrics.totalSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time subscriptions
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription by Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription by Plan</CardTitle>
                <CardDescription>Distribution of subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
                  ) : (
                    uniquePlans.map((plan) => {
                      const planStats = data?.stats.filter(s => s.plan === plan) || []
                      const totalCount = planStats.reduce((sum, s) => sum + s.count, 0)
                      const totalRevenue = planStats.reduce((sum, s) => sum + s.revenue, 0)
                      return (
                        <div key={plan} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant={getPlanBadgeVariant(plan)}>{plan}</Badge>
                            <span className="text-sm text-muted-foreground">{totalCount} subscribers</span>
                          </div>
                          <div className="text-sm font-medium">{formatCurrency(totalRevenue)}</div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subscription by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription by Status</CardTitle>
                <CardDescription>Current subscription status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                  ) : (
                    uniqueStatuses.map((status) => {
                      const statusStats = data?.stats.filter(s => s.status === status) || []
                      const totalCount = statusStats.reduce((sum, s) => sum + s.count, 0)
                      return (
                        <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                          </div>
                          <div className="text-sm font-medium">{totalCount} subscriptions</div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Performance</CardTitle>
              <CardDescription>Detailed breakdown by subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="text-center p-6 border rounded-lg">
                      <Skeleton className="h-5 w-16 mx-auto mb-2" />
                      <Skeleton className="h-8 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-20 mx-auto mb-2" />
                      <Skeleton className="h-6 w-24 mx-auto mb-1" />
                      <Skeleton className="h-3 w-20 mx-auto" />
                    </div>
                  ))
                ) : (
                  uniquePlans.map((plan) => {
                    const planStats = data?.stats.filter(s => s.plan === plan) || []
                    const totalCount = planStats.reduce((sum, s) => sum + s.count, 0)
                    const totalRevenue = planStats.reduce((sum, s) => sum + s.revenue, 0)
                    return (
                      <div key={plan} className="text-center p-6 border rounded-lg">
                        <Badge variant={getPlanBadgeVariant(plan)} className="mb-2">{plan}</Badge>
                        <div className="text-2xl font-bold text-primary">{totalCount}</div>
                        <div className="text-sm text-muted-foreground mb-2">Subscribers</div>
                        <div className="text-lg font-semibold text-green-600">{formatCurrency(totalRevenue)}</div>
                        <div className="text-xs text-muted-foreground">Total Revenue</div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
              <CardDescription>Subscription status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="text-center p-4 border rounded-lg">
                      <Skeleton className="h-5 w-16 mx-auto mb-2" />
                      <Skeleton className="h-7 w-10 mx-auto mb-1" />
                      <Skeleton className="h-3 w-20 mx-auto" />
                    </div>
                  ))
                ) : (
                  uniqueStatuses.map((status) => {
                    const statusStats = data?.stats.filter(s => s.status === status) || []
                    const totalCount = statusStats.reduce((sum, s) => sum + s.count, 0)
                    return (
                      <div key={status} className="text-center p-4 border rounded-lg">
                        <Badge variant={getStatusBadgeVariant(status)} className="mb-2">{status}</Badge>
                        <div className="text-xl font-bold">{totalCount}</div>
                        <div className="text-xs text-muted-foreground">Subscriptions</div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Subscriptions</CardTitle>
          <CardDescription>Latest subscription activities</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No subscriptions match your search' : 'No subscriptions found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {subscription.profile?.user?.firstName || subscription.profile?.user?.lastName 
                            ? `${subscription.profile?.user?.firstName || ''} ${subscription.profile?.user?.lastName || ''}`.trim()
                            : 'Unknown User'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {subscription.profile?.user?.email || 'No email'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPlanBadgeVariant(subscription.plan)}>
                        {subscription.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(subscription.amount)}
                    </TableCell>
                    <TableCell>
                      {new Date(subscription.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
