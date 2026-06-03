'use client'

import { useQuery } from '@tanstack/react-query'

// Types
export interface DatabaseHealth {
  status: string
  responseTime: number
  totalUsers?: number
}

export interface ApiHealth {
  status: string
  responseTime: number
}

export interface ServerHealth {
  status: string
  memoryUsed?: number
  memoryTotal?: number
  memoryUsagePercent?: number
  uptime: number
  uptimeSeconds?: number
  /** @deprecated use memoryUsed */
  cpuUsage?: number
  /** @deprecated use memoryUsagePercent */
  memoryUsage?: number
}

export interface SystemHealth {
  database: DatabaseHealth
  api: ApiHealth
  server: ServerHealth
}

export interface SystemLog {
  id: string
  level: string
  message: string
  timestamp: string
  service: string
}

export interface PerformanceMetric {
  time: string
  cpu: number
  memory: number
  requests: number
}

export interface MonitoringData {
  systemHealth: SystemHealth
  systemLogs: SystemLog[]
  performanceMetrics: PerformanceMetric[]
}

// Query keys
export const adminMonitoringKeys = {
  all: ['admin-monitoring'] as const,
  data: () => [...adminMonitoringKeys.all, 'data'] as const,
}

// Fetch function
async function fetchMonitoringData(): Promise<MonitoringData> {
  const response = await fetch('/api/admin/system/monitoring')
  
  if (!response.ok) {
    throw new Error('Failed to fetch monitoring data')
  }
  
  return response.json()
}

/**
 * Hook for fetching system monitoring data
 */
export function useAdminMonitoring(autoRefresh = true) {
  return useQuery({
    queryKey: adminMonitoringKeys.data(),
    queryFn: fetchMonitoringData,
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if enabled
  })
}

// Utility functions
export function getHealthStatusIcon(status: string): 'healthy' | 'warning' | 'error' | 'unknown' {
  switch (status) {
    case 'healthy':
      return 'healthy'
    case 'warning':
      return 'warning'
    case 'error':
      return 'error'
    default:
      return 'unknown'
  }
}

export function getHealthStatusBadgeClass(status: string): string {
  switch (status) {
    case 'healthy':
      return 'bg-green-100 text-green-800'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    default:
      return ''
  }
}

export function getLogLevelBadgeClass(level: string): string {
  switch (level) {
    case 'INFO':
      return 'bg-blue-100 text-blue-800'
    case 'WARNING':
      return 'bg-yellow-100 text-yellow-800'
    case 'ERROR':
      return 'bg-red-100 text-red-800'
    default:
      return ''
  }
}
