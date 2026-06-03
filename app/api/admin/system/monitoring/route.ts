import { NextResponse } from 'next/server'
import { cachedJsonResponse, CACHE_DURATIONS, STALE_DURATIONS } from '@/lib/cache'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const routeStart = Date.now()

  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ── Real database latency: time an actual lightweight query ──────────────
    const dbStart = Date.now()
    const totalUsers = await prisma.user.count()
    const dbResponseTime = Date.now() - dbStart

    // ── Real API latency: total time for this request so far ──────────────────
    const apiResponseTime = Date.now() - routeStart

    // ── Real server metrics: Node.js process ──────────────────────────────────
    const mem = process.memoryUsage()
    const memoryUsed = Math.round(mem.heapUsed / 1024 / 1024) // MB
    const memoryTotal = Math.round(mem.heapTotal / 1024 / 1024) // MB
    const memoryUsagePercent = Math.round((mem.heapUsed / mem.heapTotal) * 100)
    const uptimeSeconds = process.uptime()
    // Uptime percentage based on process uptime (capped at 99.99%)
    const uptimeDays = uptimeSeconds / 86400
    const uptimePercent = Math.min(99.99, 100 - (1 / (uptimeDays * 10 + 1)))

    const systemHealth = {
      database: {
        status: dbResponseTime < 500 ? 'healthy' : 'degraded',
        responseTime: dbResponseTime,
        totalUsers,
      },
      api: {
        status: 'healthy',
        responseTime: apiResponseTime,
      },
      server: {
        status: memoryUsagePercent < 85 ? 'healthy' : 'degraded',
        memoryUsed,
        memoryTotal,
        memoryUsagePercent,
        uptime: Math.round(uptimePercent * 100) / 100,
        uptimeSeconds: Math.round(uptimeSeconds),
      },
    }

    // ── System logs: recent real events from DB operations ─────────────────────
    const systemLogs = [
      {
        id: '1',
        level: 'INFO',
        message: `Health check completed — DB ${dbResponseTime}ms, ${totalUsers} users`,
        timestamp: new Date().toISOString(),
        service: 'Health',
      },
      {
        id: '2',
        level: memoryUsagePercent > 80 ? 'WARNING' : 'INFO',
        message: `Heap memory: ${memoryUsed}MB / ${memoryTotal}MB (${memoryUsagePercent}%)`,
        timestamp: new Date().toISOString(),
        service: 'Server',
      },
      {
        id: '3',
        level: 'INFO',
        message: `Process uptime: ${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`,
        timestamp: new Date().toISOString(),
        service: 'Server',
      },
    ]

    // ── Performance series: build from current snapshot (single point) ─────────
    const now = new Date()
    const performanceMetrics = [
      {
        time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
        memory: memoryUsagePercent,
        dbLatency: dbResponseTime,
        apiLatency: apiResponseTime,
      },
    ]

    return cachedJsonResponse({
      systemHealth,
      systemLogs,
      performanceMetrics,
      generatedAt: new Date().toISOString(),
    }, { maxAge: CACHE_DURATIONS.SHORT, staleWhileRevalidate: STALE_DURATIONS.SHORT })
  } catch (error) {
    console.error('Error fetching system monitoring data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
