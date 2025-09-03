'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Download,
  Users,
  DollarSign,
  Activity,
  Filter
} from 'lucide-react'

const reportData = {
  userReports: [
    {
      id: '1',
      title: 'User Registration Report',
      description: 'Monthly user registration statistics',
      generatedAt: '2024-03-15T10:30:00Z',
      type: 'users',
      status: 'completed',
      downloadUrl: '/reports/user-registration-march-2024.pdf'
    },
    {
      id: '2',
      title: 'Artisan Verification Report',
      description: 'Artisan verification and approval statistics',
      generatedAt: '2024-03-10T14:20:00Z',
      type: 'verification',
      status: 'completed',
      downloadUrl: '/reports/artisan-verification-march-2024.pdf'
    }
  ],
  financialReports: [
    {
      id: '3',
      title: 'Monthly Revenue Report',
      description: 'Subscription revenue and payment statistics',
      generatedAt: '2024-03-01T09:00:00Z',
      type: 'revenue',
      status: 'completed',
      downloadUrl: '/reports/revenue-february-2024.pdf'
    },
    {
      id: '4',
      title: 'Payment Processing Report',
      description: 'M-Pesa transaction analysis',
      generatedAt: '2024-02-28T16:45:00Z',
      type: 'payments',
      status: 'completed',
      downloadUrl: '/reports/payments-february-2024.pdf'
    }
  ],
  systemReports: [
    {
      id: '5',
      title: 'System Performance Report',
      description: 'Platform uptime and performance metrics',
      generatedAt: '2024-03-14T08:00:00Z',
      type: 'performance',
      status: 'completed',
      downloadUrl: '/reports/performance-march-2024.pdf'
    },
    {
      id: '6',
      title: 'Security Audit Report',
      description: 'Security events and threat analysis',
      generatedAt: '2024-03-12T12:00:00Z',
      type: 'security',
      status: 'completed',
      downloadUrl: '/reports/security-audit-march-2024.pdf'
    }
  ]
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [generating, setGenerating] = useState(false)

  const generateReport = async (type: string) => {
    setGenerating(true)
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false)
      alert(`${type} report generated successfully!`)
    }, 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'generating':
        return <Badge className="bg-blue-100 text-blue-800">Generating</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'users':
      case 'verification':
        return <Users className="h-4 w-4" />
      case 'revenue':
      case 'payments':
        return <DollarSign className="h-4 w-4" />
      case 'performance':
      case 'security':
        return <Activity className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Reports</h1>
          <p className="mt-2">Generate and download platform analytics reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>Create custom reports with specific filters and date ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => generateReport('User Activity')}
              disabled={generating}
            >
              <Users className="h-6 w-6" />
              User Activity Report
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => generateReport('Financial')}
              disabled={generating}
            >
              <DollarSign className="h-6 w-6" />
              Financial Report
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => generateReport('Performance')}
              disabled={generating}
            >
              <Activity className="h-6 w-6" />
              Performance Report
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => generateReport('Custom')}
              disabled={generating}
            >
              <FileText className="h-6 w-6" />
              Custom Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports History */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="user">User Reports</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="system">System Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Reports
                </CardTitle>
                <CardDescription>User registration and verification reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportData.userReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(report.type)}
                      <div>
                        <div className="font-medium">{report.title}</div>
                        <div className="text-sm text-gray-600">{report.description}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(report.generatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(report.status)}
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Financial Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Reports
                </CardTitle>
                <CardDescription>Revenue and payment processing reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportData.financialReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(report.type)}
                      <div>
                        <div className="font-medium">{report.title}</div>
                        <div className="text-sm text-gray-600">{report.description}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(report.generatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(report.status)}
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* System Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Reports
              </CardTitle>
              <CardDescription>Performance and security audit reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportData.systemReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(report.type)}
                    <div>
                      <div className="font-medium">{report.title}</div>
                      <div className="text-sm text-gray-600">{report.description}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.generatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Detailed user analytics and registration reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportData.userReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getTypeIcon(report.type)}
                    <div>
                      <div className="font-medium text-lg">{report.title}</div>
                      <div className="text-gray-600">{report.description}</div>
                      <div className="text-sm text-gray-500">
                        Generated: {new Date(report.generatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(report.status)}
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Revenue, payments, and financial analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportData.financialReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getTypeIcon(report.type)}
                    <div>
                      <div className="font-medium text-lg">{report.title}</div>
                      <div className="text-gray-600">{report.description}</div>
                      <div className="text-sm text-gray-500">
                        Generated: {new Date(report.generatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(report.status)}
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
              <CardDescription>Performance monitoring and security audit reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportData.systemReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getTypeIcon(report.type)}
                    <div>
                      <div className="font-medium text-lg">{report.title}</div>
                      <div className="text-gray-600">{report.description}</div>
                      <div className="text-sm text-gray-500">
                        Generated: {new Date(report.generatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(report.status)}
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
