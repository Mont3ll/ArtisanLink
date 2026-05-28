/**
 * Client Jobs API
 *
 * GET /api/client/jobs - List client's job requests
 * POST /api/client/jobs - Create a new job request
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { JobStatus } from '@/app/generated/prisma'

const logger = createLogger('api:client:jobs')

/**
 * GET /api/client/jobs
 * List all job requests made by the client
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

    if (user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only clients can access this endpoint' }, { status: 403 })
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as JobStatus | null
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Build where clause
    const where: Record<string, unknown> = { clientId: user.id }
    if (status) {
      where.status = status
    }

    // Get jobs with pagination
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          artisan: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profile: {
                select: {
                  id: true,
                  profileImage: true,
                  profession: true,
                  averageRating: true,
                  isAvailable: true,
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
      artisan: {
        id: job.artisan.id,
        profileId: job.artisan.profile?.id || null,
        name: `${job.artisan.firstName} ${job.artisan.lastName}`,
        email: job.artisan.email,
        profileImage: job.artisan.profile?.profileImage,
        profession: job.artisan.profile?.profession,
        rating: job.artisan.profile?.averageRating || 0,
        isAvailable: job.artisan.profile?.isAvailable || false,
      },
      latestQuote: job.quotes[0] || null,
      payments: job.payments,
      conversationId: job.conversation?.id,
    }))

    return NextResponse.json({
      jobs: formattedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Failed to fetch client jobs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/client/jobs
 * Create a new job request
 */
export async function POST(request: NextRequest) {
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

    if (user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only clients can create job requests' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const {
      artisanId,
      conversationId,
      title,
      description,
      category,
      location,
      clientBudget,
      requestedStartDate,
      requestedEndDate,
      depositPercent = 30,
    } = body

    // Validate required fields
    if (!artisanId) {
      return NextResponse.json({ error: 'Artisan ID is required' }, { status: 400 })
    }
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
    }
    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    }

    // Verify artisan exists and is verified
    const artisan = await prisma.user.findUnique({
      where: { id: artisanId },
      include: {
        profile: {
          select: {
            artisanStatus: true,
            isAvailable: true,
            currentJobCount: true,
            maxConcurrentJobs: true,
          },
        },
      },
    })

    if (!artisan || artisan.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })
    }

    if (artisan.profile?.artisanStatus !== 'VERIFIED') {
      return NextResponse.json({ error: 'Artisan is not verified' }, { status: 400 })
    }

    // Check if conversation exists (if provided)
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      })
      if (!conversation || conversation.clientId !== user.id || conversation.artisanId !== artisanId) {
        return NextResponse.json({ error: 'Invalid conversation' }, { status: 400 })
      }
    }

    // Create the job
    const job = await prisma.job.create({
      data: {
        clientId: user.id,
        artisanId,
        conversationId: conversationId || null,
        title: title.trim(),
        description: description.trim(),
        category: category?.trim() || null,
        location: location?.trim() || null,
        clientBudget: clientBudget ? parseFloat(clientBudget) : null,
        requestedStartDate: requestedStartDate ? new Date(requestedStartDate) : null,
        requestedEndDate: requestedEndDate ? new Date(requestedEndDate) : null,
        depositPercent: Math.min(Math.max(depositPercent, 10), 50), // Between 10-50%
        status: 'REQUESTED',
      },
      include: {
        artisan: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Create notification for artisan
    await prisma.notification.create({
      data: {
        userId: artisanId,
        type: 'JOB',
        title: 'New Job Request',
        message: `${job.client.firstName} ${job.client.lastName} has sent you a job request: "${title}"`,
        data: { jobId: job.id, clientId: user.id },
        linkUrl: `/artisan-dashboard/jobs/${job.id}`,
      },
    })

    logger.info(`Job created: ${job.id}`, { clientId: user.id, artisanId })

    return NextResponse.json({
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        status: job.status,
        createdAt: job.createdAt,
        artisan: {
          id: job.artisan.id,
          name: `${job.artisan.firstName} ${job.artisan.lastName}`,
        },
      },
    }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
