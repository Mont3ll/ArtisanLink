'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download,
  Users,
  DollarSign,
  Activity,
  Calendar as CalendarIcon,
  Loader2,
  Star,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import {
  useGenerateReport,
  REPORT_TYPES,
  formatReportCurrency,
  downloadReportCSV,
  type ReportType,
  type ReportResponse,
  type GeneratedReport,
  type ReportSummary,
} from '@/lib/hooks'

// Map report types to icons
const REPORT_ICONS: Record<ReportType, React.ReactNode> = {
  overview: <BarChart3 className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  artisans: <TrendingUp className="h-6 w-6" />,
  reviews: <Star className="h-6 w-6" />,
  subscriptions: <Activity className="h-6 w-6" />,
  payments: <DollarSign className="h-6 w-6" />,
  activity: <FileText className="h-6 w-6" />,
}

export default function ReportsPage() {
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([])
  const [currentReport, setCurrentReport] = useState<ReportResponse | null>(null)
  const [generatingType, setGeneratingType] = useState<ReportType | null>(null)

  const generateReportMutation = useGenerateReport()

  // Generate report
  const handleGenerateReport = async (type: ReportType, format: 'json' | 'csv' = 'json') => {
    setGeneratingType(type)

    try {
      const result = await generateReportMutation.mutateAsync({ type, format })

      if (format === 'csv' && result instanceof Blob) {
        downloadReportCSV(result, type)
      } else if (!(result instanceof Blob)) {
        setCurrentReport(result)
        
        // Add to generated reports list
        const newReport: GeneratedReport = {
          type,
          generatedAt: new Date().toISOString(),
          summary: result.meta?.summary || {},
          recordCount: result.meta?.totalRecords || 0
        }
        setGeneratedReports(prev => [newReport, ...prev.slice(0, 9)])
      }
    } finally {
      setGeneratingType(null)
    }
  }

  // Quick action to generate and download CSV
  const downloadCSV = (type: ReportType) => {
    handleGenerateReport(type, 'csv')
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

  const getTypeIcon = (type: ReportType) => {
    return REPORT_ICONS[type] || <FileText className="h-4 w-4" />
  }

  const isGenerating = generatingType !== null

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
          <p className="text-muted-foreground">Generate and download platform analytics reports</p>
        </div>
      </div>

      {generateReportMutation.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">
              {generateReportMutation.error instanceof Error 
                ? generateReportMutation.error.message 
                : 'Failed to generate report'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>Create custom reports with specific filters and date ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {REPORT_TYPES.slice(0, 4).map((reportType) => (
              <Button 
                key={reportType.value}
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => handleGenerateReport(reportType.value)}
                disabled={isGenerating}
              >
                {generatingType === reportType.value ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  REPORT_ICONS[reportType.value]
                )}
                {reportType.label}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {REPORT_TYPES.slice(4).map((reportType) => (
              <Button 
                key={reportType.value}
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => handleGenerateReport(reportType.value)}
                disabled={isGenerating}
              >
                {generatingType === reportType.value ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  REPORT_ICONS[reportType.value]
                )}
                {reportType.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Report Display */}
      {currentReport && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(currentReport.meta?.type as ReportType)}
                {(currentReport.meta?.type as string)?.charAt(0).toUpperCase() + (currentReport.meta?.type as string)?.slice(1)} Report
              </CardTitle>
              <CardDescription>
                Generated at {new Date(currentReport.meta?.generatedAt as string).toLocaleString()}
                {currentReport.meta?.totalRecords && ` • ${currentReport.meta.totalRecords} records`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => downloadCSV(currentReport.meta?.type as ReportType)}
                disabled={isGenerating}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary display based on report type */}
            {currentReport.meta?.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentReport.meta.type === 'overview' && currentReport.meta.summary && (
                  <>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Users</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).users?.total || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Artisans</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).users?.artisans || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Active Subscriptions</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).subscriptions?.active || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                      <div className="text-2xl font-bold">{formatReportCurrency((currentReport.meta.summary as ReportSummary).subscriptions?.totalRevenue || 0)}</div>
                    </div>
                  </>
                )}
                {currentReport.meta.type === 'users' && (
                  <>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Records</div>
                      <div className="text-2xl font-bold">{currentReport.meta.totalRecords as number}</div>
                    </div>
                  </>
                )}
                {currentReport.meta.type === 'artisans' && currentReport.meta.summary && (
                  <>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Artisans</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).totalArtisans || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Verified</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).verified || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).averageRating || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Avg Hourly Rate</div>
                      <div className="text-2xl font-bold">{formatReportCurrency((currentReport.meta.summary as ReportSummary).averageHourlyRate || 0)}</div>
                    </div>
                  </>
                )}
                {currentReport.meta.type === 'reviews' && currentReport.meta.summary && (
                  <>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Reviews</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).totalReviews || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Approved</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).approved || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Pending</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).pending || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).averageRating || 0}</div>
                    </div>
                  </>
                )}
                {currentReport.meta.type === 'payments' && currentReport.meta.summary && (
                  <>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Transactions</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).totalTransactions || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Completed</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).completed || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                      <div className="text-2xl font-bold">{formatReportCurrency((currentReport.meta.summary as ReportSummary).totalRevenue || 0)}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Failed</div>
                      <div className="text-2xl font-bold">{(currentReport.meta.summary as ReportSummary).failed || 0}</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Reports History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports in this session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {generatedReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports generated yet</p>
              <p className="text-sm">Generate a report above to see it here</p>
            </div>
          ) : (
            generatedReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTypeIcon(report.type)}
                  <div>
                    <div className="font-medium">
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {report.recordCount} records
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(report.generatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge('completed')}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadCSV(report.type)}
                    disabled={isGenerating}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
          <CardDescription>Download reports directly as CSV files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {REPORT_TYPES.filter(r => r.value !== 'overview').map((reportType) => (
              <Button 
                key={reportType.value}
                variant="outline"
                onClick={() => downloadCSV(reportType.value)}
                disabled={isGenerating}
              >
                <Download className="h-4 w-4 mr-2" />
                {reportType.label.replace(' Report', '')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
