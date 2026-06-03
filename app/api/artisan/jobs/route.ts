/**
 * Artisan Jobs API
 *
 * GET /api/artisan/jobs - List artisan's job requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { cachedJsonResponse, CACHE_DURATIONS, STALE_DURATIONS } from '@/lib/cache'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { JobStatus } from '@/app/generated/prisma'

const logger = createLogger('api:artisan:jobs')

/**
 * GET /api/artisan/jobs
 * List all job requests for the artisan
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Only artisans can access this endpoint' }, { status: 403 })
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as JobStatus | null
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Build where clause
    const where: Record<string, unknown> = { artisanId: user.id }
    if (status) {
      where.status = status
    }

    // Get jobs with pagination
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              profile: {
                select: {
                  profileImage: true,
                  city: true,
                  county: true,
                },
              },
            },
          },
          quotes: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          payments: {
            orderBy: { createdAt: 'desc' },
          },
          conversation: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ])

    // Format response
    const formattedJobs = jobs.map((job: typeof jobs[number]) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category,
      location: job.location,
      status: job.status,
      clientBudget: job.clientBudget,
      agreedPrice: job.agreedPrice,
      depositAmount: job.depositAmount,
      depositPercent: job.depositPercent,
      depositPaid: job.depositPaid,
      depositPaidAt: job.depositPaidAt,
      finalPaid: job.finalPaid,
      finalPaidAt: job.finalPaidAt,
      startedAt: job.startedAt,
      requestedStartDate: job.requestedStartDate,
      requestedEndDate: job.requestedEndDate,
      scheduledStartDate: job.scheduledStartDate,
      scheduledEndDate: job.scheduledEndDate,
      completedAt: job.completedAt,
      declineReason: job.declineReason,
      cancelReason: job.cancelReason,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      client: {
        id: job.client.id,
        name: `${job.client.firstName} ${job.client.lastName}`,
        email: job.client.email,
        phone: job.client.phone,
        profileImage: job.client.profile?.profileImage || null,
        location: job.client.profile?.county ? `${job.client.profile.city}, ${job.client.profile.county}` : null,
      },
      latestQuote: job.quotes[0] || null,
      payments: job.payments,
      conversationId: job.conversation?.id,
      // Calculate if action is needed
      needsAction: job.status === 'REQUESTED' || 
        (job.status === 'QUOTED' && job.quotes[0]?.status === 'DECLINED'),
    }))

    // Get counts by status for dashboard
    const statusCounts = await prisma.job.groupBy({
      by: ['status'],
      where: { artisanId: user.id },
      _count: { status: true },
    })

    const counts = statusCounts.reduce((acc: Record<string, number>, item: typeof statusCounts[number]) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    return cachedJsonResponse({
      jobs: formattedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts: {
        REQUESTED: counts.REQUESTED || 0,
        QUOTED: counts.QUOTED || 0,
        ACCEPTED: counts.ACCEPTED || 0,
        DEPOSIT_PAID: counts.DEPOSIT_PAID || 0,
        IN_PROGRESS: counts.IN_PROGRESS || 0,
        COMPLETED: counts.COMPLETED || 0,
        PAID: counts.PAID || 0,
        CANCELLED: counts.CANCELLED || 0,
        DECLINED: counts.DECLINED || 0,
        total,
      },
    }, { maxAge: CACHE_DURATIONS.SHORT, staleWhileRevalidate: STALE_DURATIONS.SHORT })
  } catch (error) {
    logger.error('Failed to fetch artisan jobs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
