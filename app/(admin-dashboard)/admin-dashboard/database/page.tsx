'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Database, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Server,
  HardDrive,
  Activity,
  Zap
} from 'lucide-react'

export default function DatabasePage() {
  const databaseData = {
    stats: {
      totalTables: 15,
      totalRecords: 125430,
      databaseSize: '2.4 GB',
      backupStatus: 'Healthy',
      lastBackup: '2024-03-15T02:00:00Z'
    },
    tables: [
      { 
        name: 'users', 
        records: 12540, 
        size: '45.2 MB', 
        status: 'healthy',
        lastOptimized: '2024-03-10T00:00:00Z'
      },
      { 
        name: 'artisans', 
        records: 3250, 
        size: '78.5 MB', 
        status: 'healthy',
        lastOptimized: '2024-03-10T00:00:00Z'
      },
      { 
        name: 'portfolioItems', 
        records: 8960, 
        size: '156.8 MB', 
        status: 'warning',
        lastOptimized: '2024-03-05T00:00:00Z'
      },
      { 
        name: 'messages', 
        records: 89650, 
        size: '234.7 MB', 
        status: 'healthy',
        lastOptimized: '2024-03-12T00:00:00Z'
      },
      { 
        name: 'subscriptions', 
        records: 2340, 
        size: '12.3 MB', 
        status: 'healthy',
        lastOptimized: '2024-03-10T00:00:00Z'
      }
    ],
    performance: {
      avgQueryTime: '45ms',
      slowQueries: 3,
      connectionPool: 85,
      cpuUsage: 35,
      memoryUsage: 68
    },
    backups: [
      {
        id: '1',
        type: 'Full',
        size: '2.4 GB',
        status: 'completed',
        date: '2024-03-15T02:00:00Z'
      },
      {
        id: '2',
        type: 'Incremental',
        size: '45.2 MB',
        status: 'completed',
        date: '2024-03-14T12:00:00Z'
      },
      {
        id: '3',
        type: 'Full',
        size: '2.3 GB',
        status: 'completed',
        date: '2024-03-14T02:00:00Z'
      }
    ]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage database performance and maintenance</p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{databaseData.stats.totalTables}</div>
            <p className="text-xs text-muted-foreground">Database tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{databaseData.stats.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Database records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{databaseData.stats.databaseSize}</div>
            <p className="text-xs text-muted-foreground">Total size</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backup Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{databaseData.stats.backupStatus}</div>
            <p className="text-xs text-muted-foreground">
              Last: {new Date(databaseData.stats.lastBackup).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Query Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{databaseData.performance.avgQueryTime}</div>
            <p className="text-xs text-muted-foreground">Average query time</p>
          </CardContent>
        </Card>
      </div>

      {/* Database Tabs */}
      <Tabs defaultValue="tables" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>Monitor table health and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {databaseData.tables.map((table, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{table.name}</div>
                        <div className="text-sm text-gray-600">
                          {table.records.toLocaleString()} records • {table.size}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last optimized: {new Date(table.lastOptimized).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(table.status)}
                      <Button variant="outline" size="sm">Optimize</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Current database resource consumption</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU Usage</span>
                    <span>{databaseData.performance.cpuUsage}%</span>
                  </div>
                  <Progress value={databaseData.performance.cpuUsage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory Usage</span>
                    <span>{databaseData.performance.memoryUsage}%</span>
                  </div>
                  <Progress value={databaseData.performance.memoryUsage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Connection Pool</span>
                    <span>{databaseData.performance.connectionPool}%</span>
                  </div>
                  <Progress value={databaseData.performance.connectionPool} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
                <CardDescription>Database query metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Query Time</span>
                  <span className="font-medium">{databaseData.performance.avgQueryTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Slow Queries</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{databaseData.performance.slowQueries}</span>
                    {databaseData.performance.slowQueries > 0 && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize Queries
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Backups</CardTitle>
              <CardDescription>Backup history and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {databaseData.backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Database className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{backup.type} Backup</div>
                        <div className="text-sm text-gray-600">
                          Size: {backup.size}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(backup.date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(backup.status)}
                      <Button variant="outline" size="sm">Restore</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Maintenance</CardTitle>
                <CardDescription>Automated maintenance tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="font-medium">Database Optimization</div>
                  <div className="text-sm text-gray-600">Daily at 2:00 AM</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last run: {new Date(databaseData.stats.lastBackup).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium">Index Rebuild</div>
                  <div className="text-sm text-gray-600">Weekly on Sunday</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last run: March 10, 2024
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Operations</CardTitle>
                <CardDescription>One-time maintenance operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rebuild Indexes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Update Statistics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Compact Database
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Run Integrity Check
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
