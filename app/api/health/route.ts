import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cachedJsonResponse, CACHE_DURATIONS, STALE_DURATIONS, cache } from '@/lib/cache'
import { getMonitoringStatus } from '@/lib/monitoring'
import { rateLimitStore } from '@/lib/rate-limit'

// Track server start time for uptime calculation
const serverStartTime = Date.now()

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  timestamp: string
  uptime: {
    seconds: number
    formatted: string
  }
  services: {
    database: {
      status: 'connected' | 'disconnected'
      responseTime?: number
    }
    cache: {
      status: 'active'
      size: number
      maxSize: number
    }
    rateLimit: {
      status: 'active'
      size: number
    }
    monitoring: {
      sentryEnabled: boolean
      sentryConfigured: boolean
    }
  }
  stats?: {
    totalUsers: number
    adminUsers: number
    artisanUsers: number
    clientUsers: number
  }
}

/**
 * Format uptime in human-readable format
 */
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const verbose = searchParams.get('verbose') === 'true'

  const uptimeMs = Date.now() - serverStartTime
  const monitoringStatus = getMonitoringStatus()
  const cacheStats = cache.stats()
  const rateLimitStats = rateLimitStore.stats()

  // Base response
  const response: HealthResponse = {
    status: 'healthy',
    version: process.env.npm_package_version || '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptimeMs / 1000),
      formatted: formatUptime(uptimeMs),
    },
    services: {
      database: {
        status: 'disconnected',
      },
      cache: {
        status: 'active',
        size: cacheStats.size,
        maxSize: cacheStats.maxSize,
      },
      rateLimit: {
        status: 'active',
        size: rateLimitStats.size,
      },
      monitoring: {
        sentryEnabled: monitoringStatus.sentryEnabled,
        sentryConfigured: monitoringStatus.sentryDsn,
      },
    },
  }

  try {
    // Test database connection with timing
    const dbStart = Date.now()
    const [userCount, adminCount, artisanCount, clientCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'ARTISAN' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
    ])
    const dbResponseTime = Date.now() - dbStart

    response.services.database = {
      status: 'connected',
      responseTime: dbResponseTime,
    }

    // Include stats in verbose mode or if explicitly requested
    if (verbose) {
      response.stats = {
        totalUsers: userCount,
        adminUsers: adminCount,
        artisanUsers: artisanCount,
        clientUsers: clientCount,
      }
    }

    // Check for degraded state (slow DB, etc.)
    if (dbResponseTime > 1000) {
      response.status = 'degraded'
    }

    // Return cached response for health check
    return cachedJsonResponse(response, {
      maxAge: CACHE_DURATIONS.SHORT, // 1 minute
      staleWhileRevalidate: STALE_DURATIONS.SHORT, // 1 minute stale
      isPublic: true, // Health checks can be cached publicly
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    response.status = 'unhealthy'
    response.services.database = {
      status: 'disconnected',
    }

    return NextResponse.json(response, { status: 503 })
  }
}

/**
 * HEAD request for simple uptime checks
 */
export async function HEAD() {
  try {
    // Quick database ping
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
