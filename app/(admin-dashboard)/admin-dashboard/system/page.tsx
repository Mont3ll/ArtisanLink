'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Server, 
  Database, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw
} from 'lucide-react'
import {
  useAdminMonitoring,
  getHealthStatusBadgeClass,
  getLogLevelBadgeClass,
} from '@/lib/hooks'

export default function SystemPage() {
  const { data, isLoading, refetch } = useAdminMonitoring(false) // No auto-refresh for this page

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const badgeClass = getHealthStatusBadgeClass(status)
    const labels: Record<string, string> = {
      healthy: 'Healthy',
      warning: 'Warning',
      error: 'Error',
    }
    return badgeClass ? (
      <Badge className={badgeClass}>{labels[status] || 'Unknown'}</Badge>
    ) : (
      <Badge variant="outline">Unknown</Badge>
    )
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'INFO':
        return <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
      case 'ERROR':
        return <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">Monitor platform infrastructure and performance</p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : data ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(data.systemHealth.database.status)}
                  {getStatusBadge(data.systemHealth.database.status)}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Connections: {data.systemHealth.database.connections}</div>
                  <div>Response: {data.systemHealth.database.responseTime}ms</div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ) : data ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(data.systemHealth.server.status)}
                  {getStatusBadge(data.systemHealth.server.status)}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Uptime: {data.systemHealth.server.uptime}%</div>
                  <div>CPU: {data.systemHealth.server.cpuUsage}%</div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : data ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(data.systemHealth.api.status)}
                  {getStatusBadge(data.systemHealth.api.status)}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Requests/min: {data.systemHealth.api.requestsPerMinute}</div>
                  <div>Response: {data.systemHealth.api.responseTime}ms</div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Usage</span>
                    {isLoading ? (
                      <Skeleton className="h-4 w-10" />
                    ) : (
                      <span className="text-sm text-muted-foreground">{data?.systemHealth.server.cpuUsage || 0}%</span>
                    )}
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-2 w-full" />
                  ) : (
                    <Progress value={data?.systemHealth.server.cpuUsage || 0} className="h-2" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Usage</span>
                    {isLoading ? (
                      <Skeleton className="h-4 w-10" />
                    ) : (
                      <span className="text-sm text-muted-foreground">{data?.systemHealth.server.memoryUsage || 0}%</span>
                    )}
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-2 w-full" />
                  ) : (
                    <Progress value={data?.systemHealth.server.memoryUsage || 0} className="h-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Real-time system performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-8 w-20 mx-auto mb-1" />
                        <Skeleton className="h-4 w-12 mx-auto" />
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-green-600">{data?.systemHealth.server.uptime || 0}%</div>
                        <div className="text-sm text-muted-foreground">Uptime</div>
                      </>
                    )}
                  </div>
                  <div className="p-4 border rounded-lg">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-8 w-20 mx-auto mb-1" />
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-blue-600">{data?.systemHealth.api.responseTime || 0}ms</div>
                        <div className="text-sm text-muted-foreground">Avg Response</div>
                      </>
                    )}
                  </div>
                  <div className="p-4 border rounded-lg">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-8 w-20 mx-auto mb-1" />
                        <Skeleton className="h-4 w-20 mx-auto" />
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-purple-600">{data?.systemHealth.api.requestsPerMinute?.toLocaleString() || 0}</div>
                        <div className="text-sm text-muted-foreground">Requests/min</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system events and messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Skeleton className="h-5 w-5 mt-0.5 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-64" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))
                ) : data?.systemLogs && data.systemLogs.length > 0 ? (
                  data.systemLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getLogIcon(log.level)}
                      <div>
                        <div className="font-medium">{log.message}</div>
                        <div className="text-sm text-muted-foreground">{log.service}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No system logs available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
