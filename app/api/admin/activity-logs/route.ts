import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating activity log
const createLogSchema = z.object({
  action: z.string().min(1).max(100),
  targetType: z.string().min(1).max(50),
  targetId: z.string().min(1),
  description: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
})

// GET - List activity logs with filters (admin only)
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const action = searchParams.get('action') // Filter by action type
    const targetType = searchParams.get('targetType') // Filter by target type
    const adminId = searchParams.get('adminId') // Filter by specific admin
    const startDate = searchParams.get('startDate') // Filter by date range
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search') // Search in description

    const clampedPage = Math.max(1, page)
    const clampedLimit = Math.min(Math.max(1, limit), 100)
    const skip = (clampedPage - 1) * clampedLimit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (action) {
      where.action = action
    }

    if (targetType) {
      where.targetType = targetType
    }

    if (adminId) {
      where.adminId = adminId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, unknown>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.createdAt as Record<string, unknown>).lte = new Date(endDate)
      }
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Get logs
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: clampedLimit
      }),
      prisma.activityLog.count({ where })
    ])

    // Get action type stats for filters
    const actionStats = await prisma.activityLog.groupBy({
      by: ['action'],
      _count: { action: true }
    })

    const targetTypeStats = await prisma.activityLog.groupBy({
      by: ['targetType'],
      _count: { targetType: true }
    })

    return NextResponse.json({
      logs,
      filters: {
        actions: actionStats.map((s: { action: string; _count: { action: number } }) => ({ name: s.action, count: s._count.action })),
        targetTypes: targetTypeStats.map((s: { targetType: string; _count: { targetType: number } }) => ({ name: s.targetType, count: s._count.targetType }))
      },
      pagination: {
        page: clampedPage,
        limit: clampedLimit,
        total,
        totalPages: Math.ceil(total / clampedLimit)
      }
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new activity log (admin only, used internally)
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = createLogSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Get IP address and user agent from request
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') ||
                      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create activity log
    const log = await prisma.activityLog.create({
      data: {
        adminId: user.id,
        adminEmail: user.email,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        description: data.description,
        metadata: data.metadata,
        ipAddress,
        userAgent
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error creating activity log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
