'use client'

import { useMutation } from '@tanstack/react-query'

// Types
export type ReportType = 'users' | 'artisans' | 'reviews' | 'subscriptions' | 'payments' | 'activity' | 'overview'

export interface ReportSummary {
  totalUsers?: number
  artisans?: number
  clients?: number
  recentSignups?: number
  totalArtisans?: number
  verified?: number
  pending?: number
  available?: number
  averageRating?: number
  averageHourlyRate?: number
  totalReviews?: number
  approved?: number
  hidden?: number
  ratingDistribution?: Record<number, number>
  totalSubscriptions?: number
  active?: number
  expired?: number
  monthly?: number
  annual?: number
  totalRevenue?: number
  currency?: string
  totalTransactions?: number
  completed?: number
  failed?: number
  refunded?: number
  byMethod?: Record<string, number>
  totalActions?: number
  byAction?: Record<string, number>
  uniqueAdmins?: number
  users?: {
    total: number
    artisans: number
    clients: number
    recentSignups: number
  }
  subscriptions?: {
    active: number
    totalRevenue: number
    currency: string
  }
  reviews?: {
    total: number
    pending: number
  }
  geography?: {
    topCounties: Array<{ county: string; count: number }>
  }
}

export interface GeneratedReport {
  type: ReportType
  generatedAt: string
  summary: ReportSummary
  recordCount: number
}

export interface ReportMeta {
  type: ReportType
  generatedAt: string
  totalRecords: number
  summary: ReportSummary
}

export interface ReportResponse {
  meta: ReportMeta
  data: unknown
}

export interface GenerateReportParams {
  type: ReportType
  format?: 'json' | 'csv'
  startDate?: string
  endDate?: string
}

// Query keys
export const adminReportsKeys = {
  all: ['admin-reports'] as const,
}

// Generate report function
async function generateReport(params: GenerateReportParams): Promise<ReportResponse | Blob> {
  const response = await fetch('/api/admin/reports/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to generate report')
  }

  if (params.format === 'csv') {
    return response.blob()
  }
  
  return response.json()
}

/**
 * Hook for generating admin reports
 */
export function useGenerateReport() {
  return useMutation({
    mutationFn: generateReport,
  })
}

// Report type configurations
export const REPORT_TYPES = [
  { value: 'overview' as ReportType, label: 'Overview Report', description: 'Comprehensive platform overview' },
  { value: 'users' as ReportType, label: 'User Report', description: 'User registration and activity' },
  { value: 'artisans' as ReportType, label: 'Artisans Report', description: 'Artisan profiles and verification' },
  { value: 'reviews' as ReportType, label: 'Reviews Report', description: 'Review statistics and ratings' },
  { value: 'subscriptions' as ReportType, label: 'Subscriptions Report', description: 'Subscription status and plans' },
  { value: 'payments' as ReportType, label: 'Payments Report', description: 'Payment transactions and revenue' },
  { value: 'activity' as ReportType, label: 'Activity Log Report', description: 'Admin activity and actions' },
] as const

// Utility function for formatting currency
export function formatReportCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(amount)
}

// Utility function to download CSV
export function downloadReportCSV(blob: Blob, type: ReportType): void {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
