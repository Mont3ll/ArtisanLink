'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  TrendingUp, 
  MoreVertical,
  Search,
  Filter
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SubscriptionData {
  stats: {
    status: string
    plan: string
    count: number
    revenue: number
  }[]
  recentSubscriptions: {
    id: string
    plan: string
    status: string
    amount: number
    createdAt: string
    profile: {
      user: {
        id: string
        email: string | null
        firstName: string | null
        lastName: string | null
      }
    }
  }[]
  metrics: {
    totalRevenue: number
    activeSubscriptions: number
    totalSubscriptions: number
  }
}

export default function SubscriptionsPage() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions')
      if (response.ok) {
        const subscriptionData = await response.json()
        setData(subscriptionData)
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load subscriptions</h2>
          <p className="text-gray-600 mb-4">There was an error loading the subscription data.</p>
          <Button onClick={fetchSubscriptionData}>Try Again</Button>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'CANCELLED':
        return 'destructive'
      case 'PAST_DUE':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'PREMIUM':
        return 'default'
      case 'BASIC':
        return 'secondary'
      case 'PRO':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const filteredSubscriptions = data.recentSubscriptions.filter(sub =>
    sub.profile?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.profile?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.profile?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.plan?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="mt-2">Monitor and manage platform subscriptions</p>
        </div>
        <Button>Export Data</Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {((data.metrics.activeSubscriptions / data.metrics.totalSubscriptions) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              All time subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription by Plan</CardTitle>
                <CardDescription>Distribution of subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(data.stats.map(s => s.plan))).map((plan) => {
                    const planStats = data.stats.filter(s => s.plan === plan)
                    const totalCount = planStats.reduce((sum, s) => sum + s.count, 0)
                    const totalRevenue = planStats.reduce((sum, s) => sum + s.revenue, 0)
                    return (
                      <div key={plan} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPlanBadgeVariant(plan)}>{plan}</Badge>
                          <span className="text-sm text-gray-600">{totalCount} subscribers</span>
                        </div>
                        <div className="text-sm font-medium">{formatCurrency(totalRevenue)}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription by Status</CardTitle>
                <CardDescription>Current subscription status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(data.stats.map(s => s.status))).map((status) => {
                    const statusStats = data.stats.filter(s => s.status === status)
                    const totalCount = statusStats.reduce((sum, s) => sum + s.count, 0)
                    return (
                      <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                        </div>
                        <div className="text-sm font-medium">{totalCount} subscriptions</div>
                      </div>
                    )
                  })}
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
                {Array.from(new Set(data.stats.map(s => s.plan))).map((plan) => {
                  const planStats = data.stats.filter(s => s.plan === plan)
                  const totalCount = planStats.reduce((sum, s) => sum + s.count, 0)
                  const totalRevenue = planStats.reduce((sum, s) => sum + s.revenue, 0)
                  return (
                    <div key={plan} className="text-center p-6 border rounded-lg">
                      <Badge variant={getPlanBadgeVariant(plan)} className="mb-2">{plan}</Badge>
                      <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                      <div className="text-sm text-gray-600 mb-2">Subscribers</div>
                      <div className="text-lg font-semibold text-green-600">{formatCurrency(totalRevenue)}</div>
                      <div className="text-xs text-gray-500">Total Revenue</div>
                    </div>
                  )
                })}
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
                {Array.from(new Set(data.stats.map(s => s.status))).map((status) => {
                  const statusStats = data.stats.filter(s => s.status === status)
                  const totalCount = statusStats.reduce((sum, s) => sum + s.count, 0)
                  return (
                    <div key={status} className="text-center p-4 border rounded-lg">
                      <Badge variant={getStatusBadgeVariant(status)} className="mb-2">{status}</Badge>
                      <div className="text-xl font-bold">{totalCount}</div>
                      <div className="text-xs text-gray-600">Subscriptions</div>
                    </div>
                  )
                })}
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
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {subscription.profile?.user?.firstName || subscription.profile?.user?.lastName 
                          ? `${subscription.profile?.user?.firstName || ''} ${subscription.profile?.user?.lastName || ''}`.trim()
                          : 'Unknown User'
                        }
                      </div>
                      <div className="text-sm text-gray-500">{subscription.profile?.user?.email || 'No email'}</div>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
