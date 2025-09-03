import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // System health metrics
    const systemHealth = {
      database: {
        status: 'healthy',
        responseTime: Math.floor(Math.random() * 50) + 10, // Simulated
        connections: Math.floor(Math.random() * 20) + 5
      },
      api: {
        status: 'healthy',
        responseTime: Math.floor(Math.random() * 100) + 50,
        requestsPerMinute: Math.floor(Math.random() * 500) + 100
      },
      server: {
        status: 'healthy',
        cpuUsage: Math.floor(Math.random() * 30) + 20,
        memoryUsage: Math.floor(Math.random() * 40) + 30,
        uptime: 99.98
      }
    }

    // Get recent system logs (simulated for now)
    const systemLogs = [
      {
        id: '1',
        level: 'INFO',
        message: 'Database backup completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        service: 'Database'
      },
      {
        id: '2',
        level: 'WARNING',
        message: 'High memory usage detected',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        service: 'Server'
      },
      {
        id: '3',
        level: 'INFO',
        message: 'User authentication service restarted',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        service: 'Auth'
      },
      {
        id: '4',
        level: 'ERROR',
        message: 'Failed to send notification email',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        service: 'Email'
      }
    ]

    // Performance metrics over time
    const performanceMetrics = [
      { time: '00:00', cpu: 25, memory: 35, requests: 120 },
      { time: '01:00', cpu: 30, memory: 40, requests: 150 },
      { time: '02:00', cpu: 28, memory: 38, requests: 130 },
      { time: '03:00', cpu: 32, memory: 42, requests: 160 },
      { time: '04:00', cpu: 27, memory: 36, requests: 140 },
      { time: '05:00', cpu: 35, memory: 45, requests: 180 }
    ]

    return NextResponse.json({
      systemHealth,
      systemLogs,
      performanceMetrics
    })
  } catch (error) {
    console.error('Error fetching system monitoring data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
