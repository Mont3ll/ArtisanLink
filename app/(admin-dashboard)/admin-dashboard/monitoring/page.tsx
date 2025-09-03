'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

interface SystemMonitoringData {
  systemHealth: {
    database: {
      status: string
      responseTime: number
      connections: number
    }
    api: {
      status: string
      responseTime: number
      requestsPerMinute: number
    }
    server: {
      status: string
      cpuUsage: number
      memoryUsage: number
      uptime: number
    }
  }
  systemLogs: {
    id: string
    level: string
    message: string
    timestamp: string
    service: string
  }[]
  performanceMetrics: {
    time: string
    cpu: number
    memory: number
    requests: number
  }[]
}

export default function MonitoringPage() {
  const [data, setData] = useState<SystemMonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchMonitoringData()
    
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchMonitoringData, 30000) // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchMonitoringData = async () => {
    try {
      const response = await fetch('/api/admin/system/monitoring')
      if (response.ok) {
        const monitoringData = await response.json()
        setData(monitoringData)
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load monitoring data</h2>
          <p className="text-gray-600 mb-4">There was an error loading the system monitoring data.</p>
          <Button onClick={fetchMonitoringData}>Try Again</Button>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'INFO':
        return <Badge className="bg-blue-100 text-blue-800">INFO</Badge>
      case 'WARNING':
        return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>
      case 'ERROR':
        return <Badge className="bg-red-100 text-red-800">ERROR</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="mt-2">Real-time system health and performance monitoring</p>
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
          <Button onClick={fetchMonitoringData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              {getStatusIcon(data.systemHealth.database.status)}
              {getStatusBadge(data.systemHealth.database.status)}
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                Response Time: {data.systemHealth.database.responseTime}ms
              </div>
              <div className="text-sm text-gray-600">
                Connections: {data.systemHealth.database.connections}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              {getStatusIcon(data.systemHealth.api.status)}
              {getStatusBadge(data.systemHealth.api.status)}
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                Response Time: {data.systemHealth.api.responseTime}ms
              </div>
              <div className="text-sm text-gray-600">
                Requests/min: {data.systemHealth.api.requestsPerMinute}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              {getStatusIcon(data.systemHealth.server.status)}
              {getStatusBadge(data.systemHealth.server.status)}
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                Uptime: {data.systemHealth.server.uptime}%
              </div>
            </div>
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
                <span className="text-sm text-gray-600">{data.systemHealth.server.cpuUsage}%</span>
              </div>
              <Progress value={data.systemHealth.server.cpuUsage} className="h-2" />
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
                <span className="text-sm text-gray-600">{data.systemHealth.server.memoryUsage}%</span>
              </div>
              <Progress value={data.systemHealth.server.memoryUsage} className="h-2" />
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
                {data.systemLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-1">
                      {getLogLevelBadge(log.level)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{log.message}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {log.service} • {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
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
                {data.performanceMetrics.map((metric, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 border rounded-lg">
                    <div className="text-sm font-medium">{metric.time}</div>
                    <div className="text-sm">CPU: {metric.cpu}%</div>
                    <div className="text-sm">Memory: {metric.memory}%</div>
                    <div className="text-sm">Requests: {metric.requests}</div>
                  </div>
                ))}
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
                <div className="flex items-start gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <div className="font-medium">High Memory Usage</div>
                    <div className="text-sm text-gray-600">
                      Memory usage is approaching 80% threshold
                    </div>
                  </div>
                </div>
                <div className="text-center text-gray-500 py-8">
                  No critical alerts at this time
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
