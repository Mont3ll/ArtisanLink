'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Download, AlertCircle } from 'lucide-react'
import { useAdminAnalytics } from '@/lib/hooks'

export default function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useAdminAnalytics()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  // Error state
  if (isError) {
    return (
      <div className="px-4 lg:px-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Failed to load analytics</h2>
            <p className="text-muted-foreground mb-4">There was an error loading the analytics data.</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive platform insights and metrics</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.metrics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{data?.userGrowth.reduce((sum, item) => sum + item.count, 0)} this month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Projects Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.metrics.totalProjects.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.projectStats.total} new this month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Projects Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-36" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.metrics.activeProjects.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.metrics.completionRate.toFixed(1)}% completion rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Avg Project Value Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Project Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-28 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(data?.projectStats.averageBudget ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="projects">Project Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Card */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth by Role</CardTitle>
                <CardDescription>New user registrations in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.userGrowth.map((item) => (
                      <div key={item.role} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.role}</Badge>
                        </div>
                        <div className="text-sm font-medium">{item.count} users</div>
                      </div>
                    ))}
                    {data?.userGrowth.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No new users in the last 30 days
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Trend Card */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <CardDescription>Revenue progression over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.revenueData.slice(-3).map((item) => (
                      <div key={item.month} className="flex items-center justify-between">
                        <div className="text-sm font-medium">{item.month}</div>
                        <div className="text-sm font-medium">{formatCurrency(item.revenue)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user metrics and demographics</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center p-4 border rounded-lg">
                      <Skeleton className="h-8 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {data?.userGrowth.map((item) => (
                    <div key={item.role} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{item.count}</div>
                      <div className="text-sm text-muted-foreground">New {item.role}s</div>
                    </div>
                  ))}
                  {data?.userGrowth.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                      No user growth data available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
              <CardDescription>Project performance and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-8 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-600">{data?.metrics.totalProjects}</div>
                      <div className="text-sm text-muted-foreground">Total Projects</div>
                    </>
                  )}
                </div>
                <div className="text-center p-4 border rounded-lg">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-8 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-blue-600">{data?.metrics.activeProjects}</div>
                      <div className="text-sm text-muted-foreground">Active Projects</div>
                    </>
                  )}
                </div>
                <div className="text-center p-4 border rounded-lg">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-8 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-purple-600">
                        {data?.metrics.completionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Completion Rate</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Financial performance and trends</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-6 w-28" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.revenueData.map((item) => (
                    <div key={item.month} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="font-medium">{item.month}</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
