'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Server, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
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

export default function MonitoringPage() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const { data, isLoading, isError, refetch } = useAdminMonitoring(autoRefresh)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />
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

  const getLogLevelBadge = (level: string) => {
    const badgeClass = getLogLevelBadgeClass(level)
    return badgeClass ? (
      <Badge className={badgeClass}>{level}</Badge>
    ) : (
      <Badge variant="outline">{level}</Badge>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and performance monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">Failed to load monitoring data. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : data ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  {getStatusIcon(data.systemHealth.database.status)}
                  {getStatusBadge(data.systemHealth.database.status)}
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Response Time: {data.systemHealth.database.responseTime}ms
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Connections: {data.systemHealth.database.connections}
                  </div>
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
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : data ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  {getStatusIcon(data.systemHealth.api.status)}
                  {getStatusBadge(data.systemHealth.api.status)}
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Response Time: {data.systemHealth.api.responseTime}ms
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Requests/min: {data.systemHealth.api.requestsPerMinute}
                  </div>
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
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ) : data ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  {getStatusIcon(data.systemHealth.server.status)}
                  {getStatusBadge(data.systemHealth.server.status)}
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Uptime: {data.systemHealth.server.uptime}%
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
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
                  <Skeleton className="h-4 w-12" />
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
                  <Skeleton className="h-4 w-12" />
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

      {/* Detailed Monitoring */}
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Logs</CardTitle>
              <CardDescription>Latest system events and messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Skeleton className="h-6 w-16 mt-1" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : data?.systemLogs && data.systemLogs.length > 0 ? (
                  data.systemLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {getLogLevelBadge(log.level)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{log.message}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {log.service} • {new Date(log.timestamp).toLocaleString()}
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

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 p-3 border rounded-lg">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))
                ) : data?.performanceMetrics && data.performanceMetrics.length > 0 ? (
                  data.performanceMetrics.map((metric, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 p-3 border rounded-lg">
                      <div className="text-sm font-medium">{metric.time}</div>
                      <div className="text-sm">CPU: {metric.cpu}%</div>
                      <div className="text-sm">Memory: {metric.memory}%</div>
                      <div className="text-sm">Requests: {metric.requests}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No performance metrics available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Active alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Skeleton className="h-5 w-5 mt-1" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </div>
                ) : (
                  <>
                    {data?.systemHealth.server.memoryUsage && data.systemHealth.server.memoryUsage > 70 && (
                      <div className="flex items-start gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                        <div>
                          <div className="font-medium">High Memory Usage</div>
                          <div className="text-sm text-muted-foreground">
                            Memory usage is at {data.systemHealth.server.memoryUsage}%
                          </div>
                        </div>
                      </div>
                    )}
                    {data?.systemHealth.server.cpuUsage && data.systemHealth.server.cpuUsage > 70 && (
                      <div className="flex items-start gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                        <div>
                          <div className="font-medium">High CPU Usage</div>
                          <div className="text-sm text-muted-foreground">
                            CPU usage is at {data.systemHealth.server.cpuUsage}%
                          </div>
                        </div>
                      </div>
                    )}
                    {(!data?.systemHealth.server.memoryUsage || data.systemHealth.server.memoryUsage <= 70) &&
                     (!data?.systemHealth.server.cpuUsage || data.systemHealth.server.cpuUsage <= 70) && (
                      <div className="text-center text-muted-foreground py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                        <p>No critical alerts at this time</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
