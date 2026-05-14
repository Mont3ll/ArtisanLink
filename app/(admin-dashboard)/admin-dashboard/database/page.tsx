'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Database, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Server,
  HardDrive,
  Activity,
  Users,
  Star,
  CreditCard,
  MessageSquare
} from 'lucide-react'
import {
  useAdminDatabase,
  getDatabaseStatusBadgeClass,
} from '@/lib/hooks'

export default function DatabasePage() {
  const { data: databaseData, isLoading, error, refetch } = useAdminDatabase()

  const stats = databaseData?.stats
  const tables = databaseData?.tables ?? []
  const health = databaseData?.health
  const performance = databaseData?.performance
  const metadata = databaseData?.metadata

  const getStatusBadge = (status: string) => {
    const className = getDatabaseStatusBadgeClass(status)
    if (className) {
      return <Badge className={className}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Management</h1>
          <div className="text-muted-foreground mt-2">
            {isLoading ? (
              <Skeleton className="h-5 w-64 inline-block" />
            ) : metadata ? (
              `${metadata.provider} database via Prisma ${metadata.prismaVersion}`
            ) : (
              'Database statistics and health monitoring'
            )}
          </div>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Error loading database data: {error instanceof Error ? error.message : 'Unknown error'}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalTables ?? 0}</div>
                <p className="text-xs text-muted-foreground">Database tables</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{(stats?.totalRecords ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Database records</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-28" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.databaseSize ?? '0 KB'}</div>
                <p className="text-xs text-muted-foreground">Based on row estimates</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-28" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats?.connectionStatus ?? 'Unknown'}</div>
                <p className="text-xs text-muted-foreground">
                  {health?.databaseConnected ? 'Database accessible' : 'Connection issue'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-14 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{(health?.activeUsers ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Active accounts</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Database Tabs */}
      <Tabs defaultValue="tables" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tables">Tables {isLoading ? '' : `(${tables.length})`}</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>Current row counts for all tables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-48 mb-1" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))
                ) : tables.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No table data available</p>
                ) : (
                  tables.map((table) => (
                    <div key={table.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Database className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium">{table.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {table.records.toLocaleString()} records &bull; ~{table.estimatedSize.formatted}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {table.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(table.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Health Overview</CardTitle>
                <CardDescription>Key metrics from your database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm">Active Users</span>
                      </div>
                      <span className="font-medium">{(health?.activeUsers ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Verified Artisans</span>
                      </div>
                      <span className="font-medium">{(health?.verifiedArtisans ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-purple-500" />
                        <span className="text-sm">Active Subscriptions</span>
                      </div>
                      <span className="font-medium">{(health?.activeSubscriptions ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm">Pending Reviews</span>
                      </div>
                      <span className="font-medium">{(health?.pendingReviews ?? 0).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Distribution</CardTitle>
                <CardDescription>Records per table</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))
                ) : (
                  tables.slice(0, 5).map((table) => {
                    const percentage = (stats?.totalRecords ?? 0) > 0 
                      ? Math.round((table.records / (stats?.totalRecords ?? 1)) * 100) 
                      : 0
                    return (
                      <div key={table.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{table.displayName}</span>
                          <span>{table.records.toLocaleString()} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {!isLoading && health?.lastActivity && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>
                    Last activity logged: {new Date(health.lastActivity).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Information</CardTitle>
                <CardDescription>Technical details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm text-muted-foreground">Provider</span>
                      <span className="font-medium">{metadata?.provider ?? 'Unknown'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm text-muted-foreground">ORM</span>
                      <span className="font-medium">Prisma {metadata?.prismaVersion ?? ''}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Tables</span>
                      <span className="font-medium">{stats?.totalTables ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Records</span>
                      <span className="font-medium">{(stats?.totalRecords ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm text-muted-foreground">Estimated Size</span>
                      <span className="font-medium">{stats?.databaseSize ?? '0 KB'}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Notes</CardTitle>
                <CardDescription>Monitoring recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Production Monitoring</p>
                        <p>{performance?.note ?? 'No performance notes available'}</p>
                        <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                          <li>Consider integrating with pgAdmin or similar tools</li>
                          <li>Set up database performance monitoring</li>
                          <li>Configure automated backups with your hosting provider</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Last Updated Footer */}
      <div className="text-xs text-muted-foreground text-right">
        {isLoading ? (
          <Skeleton className="h-3 w-48 ml-auto" />
        ) : metadata ? (
          `Last checked: ${new Date(metadata.lastChecked).toLocaleString()}`
        ) : null}
      </div>
    </div>
  )
}
