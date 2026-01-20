'use client'

import { useQuery } from '@tanstack/react-query'

// Types
export interface TableInfo {
  name: string
  displayName: string
  description: string
  records: number
  estimatedSize: {
    bytes: number
    formatted: string
  }
  status: 'healthy' | 'warning' | 'error'
  lastUpdated: string
}

export interface DatabaseStats {
  totalTables: number
  totalRecords: number
  databaseSize: string
  databaseSizeBytes: number
  backupStatus: string
  lastBackup: string | null
  connectionStatus: string
}

export interface HealthStats {
  activeUsers: number
  verifiedArtisans: number
  activeSubscriptions: number
  pendingReviews: number
  lastActivity: string | null
  databaseConnected: boolean
}

export interface PerformanceStats {
  avgQueryTime: string
  slowQueries: number
  connectionPool: number | null
  note: string
}

export interface DatabaseMetadata {
  provider: string
  prismaVersion: string
  lastChecked: string
}

export interface DatabaseData {
  stats: DatabaseStats
  tables: TableInfo[]
  health: HealthStats
  performance: PerformanceStats
  metadata: DatabaseMetadata
}

// Query keys
export const adminDatabaseKeys = {
  all: ['admin-database'] as const,
  stats: () => [...adminDatabaseKeys.all, 'stats'] as const,
}

// Fetch function
async function fetchDatabaseStats(): Promise<DatabaseData> {
  const response = await fetch('/api/admin/database/stats')
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch database stats')
  }
  
  return response.json()
}

/**
 * Hook for fetching admin database statistics
 */
export function useAdminDatabase() {
  return useQuery({
    queryKey: adminDatabaseKeys.stats(),
    queryFn: fetchDatabaseStats,
  })
}

// Utility function for status badge
export function getDatabaseStatusBadgeClass(status: string): string {
  switch (status) {
    case 'healthy':
    case 'Connected':
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    default:
      return ''
  }
}
