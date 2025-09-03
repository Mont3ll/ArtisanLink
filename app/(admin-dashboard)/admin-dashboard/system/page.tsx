'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Server, 
  Database, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw
} from 'lucide-react'

export default function SystemPage() {
  const systemMetrics = {
    database: { status: 'healthy', connections: 15, responseTime: 45 },
    server: { status: 'healthy', uptime: 99.98, cpu: 25, memory: 40 },
    api: { status: 'healthy', requests: 1247, errors: 0.02 }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600 mt-2">Monitor platform infrastructure and performance</p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
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
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Connections: {systemMetrics.database.connections}</div>
              <div>Response: {systemMetrics.database.responseTime}ms</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Uptime: {systemMetrics.server.uptime}%</div>
              <div>CPU: {systemMetrics.server.cpu}%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Requests: {systemMetrics.api.requests}</div>
              <div>Error Rate: {systemMetrics.api.errors}%</div>
            </div>
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
                    <span className="text-sm text-gray-600">{systemMetrics.server.cpu}%</span>
                  </div>
                  <Progress value={systemMetrics.server.cpu} className="h-2" />
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
                    <span className="text-sm text-gray-600">{systemMetrics.server.memory}%</span>
                  </div>
                  <Progress value={systemMetrics.server.memory} className="h-2" />
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
                    <div className="text-2xl font-bold text-green-600">99.98%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">245ms</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">1,247</div>
                    <div className="text-sm text-gray-600">Requests/min</div>
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
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Database backup completed</div>
                    <div className="text-sm text-gray-600">Daily backup process finished successfully</div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <div className="font-medium">High memory usage detected</div>
                    <div className="text-sm text-gray-600">Memory usage exceeded 75% threshold</div>
                    <div className="text-xs text-gray-500">4 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium">API deployment successful</div>
                    <div className="text-sm text-gray-600">New API version deployed without issues</div>
                    <div className="text-xs text-gray-500">6 hours ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
