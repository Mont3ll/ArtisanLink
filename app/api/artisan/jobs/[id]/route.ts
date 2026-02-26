/**
 * Artisan Job Details API
 *
 * GET /api/artisan/jobs/[id] - Get job details
 * PATCH /api/artisan/jobs/[id] - Update job status (accept, decline, start, complete)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { JobStatus } from '@/app/generated/prisma'

const logger = createLogger('api:artisan:jobs:id')

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/artisan/jobs/[id]
 * Get detailed information about a specific job
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await params

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

    // Get job with all details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
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
        artisan: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        quotes: {
          include: {
            lineItems: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        conversation: {
          select: { id: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Verify the artisan owns this job
    if (job.artisanId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Format response
    const formattedJob = {
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
      requestedStartDate: job.requestedStartDate,
      requestedEndDate: job.requestedEndDate,
      scheduledStartDate: job.scheduledStartDate,
      scheduledEndDate: job.scheduledEndDate,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      cancelReason: job.cancelReason,
      declineReason: job.declineReason,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      client: {
        id: job.client.id,
        name: `${job.client.firstName} ${job.client.lastName}`,
        email: job.client.email,
        phone: job.client.phone,
        profileImage: job.client.profile?.profileImage || null,
        location: job.client.profile?.county 
          ? `${job.client.profile.city || ''}, ${job.client.profile.county}`.replace(/^, /, '') 
          : null,
      },
      quotes: job.quotes.map((quote: typeof job.quotes[number]) => ({
        id: quote.id,
        amount: quote.amount,
        description: quote.description,
        estimatedDuration: quote.estimatedDuration,
        paymentTerms: quote.paymentTerms,
        status: quote.status,
        round: quote.round,
        validUntil: quote.validUntil,
        clientResponse: quote.clientResponse,
        requestedDepositPercent: quote.requestedDepositPercent,
        lineItems: quote.lineItems.map((item: typeof quote.lineItems[number]) => ({
          id: item.id,
          category: item.category,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.total,
          isSystemGenerated: item.isSystemGenerated,
          sortOrder: item.sortOrder,
          createdAt: item.createdAt,
        })),
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt,
      })),
      payments: job.payments.map((payment: typeof job.payments[number]) => ({
        id: payment.id,
        amount: payment.amount,
        type: payment.type,
        mpesaReceiptNumber: payment.mpesaReceiptNumber,
        status: payment.status,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      })),
      conversationId: job.conversation?.id,
      // Determine available actions based on status
      availableActions: getAvailableActions(job),
    }

    return NextResponse.json({ job: formattedJob })
  } catch (error) {
    logger.error('Failed to fetch job details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Determine what actions are available for the artisan based on job status
 */
function getAvailableActions(job: { 
  status: JobStatus
  quotes: { status: string; round: number }[]
}): string[] {
  const actions: string[] = []
  const latestQuote = job.quotes[0]

  switch (job.status) {
    case 'REQUESTED':
      actions.push('send_quote', 'decline')
      break
    case 'QUOTED':
      // If latest quote was declined and it was round 1, can send revised quote
      if (latestQuote?.status === 'REVISION_REQUESTED' && latestQuote.round === 1) {
        actions.push('send_quote')
      }
      break
    case 'ACCEPTED':
      // Waiting for client deposit
      break
    case 'DEPOSIT_PAID':
      actions.push('start_job')
      break
    case 'IN_PROGRESS':
      actions.push('complete_job')
      break
    case 'COMPLETED':
      // Waiting for final payment
      break
  }

  return actions
}

/**
 * PATCH /api/artisan/jobs/[id]
 * Update job status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await params

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { 
        id: true, 
        role: true, 
        firstName: true, 
        lastName: true,
        profile: {
          select: { currentJobCount: true, maxConcurrentJobs: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Only artisans can update their jobs' }, { status: 403 })
    }

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.artisanId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { action, declineReason, scheduledStartDate, scheduledEndDate } = body

    switch (action) {
      case 'decline': {
        // Artisan declines the job request
        if (job.status !== 'REQUESTED') {
          return NextResponse.json({
            error: 'Can only decline jobs in REQUESTED status',
          }, { status: 400 })
        }

        const updatedJob = await prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'DECLINED',
            declineReason: declineReason || 'Declined by artisan',
          },
        })

        // Create notification for client
        await prisma.notification.create({
          data: {
            userId: job.clientId,
            type: 'JOB',
            title: 'Job Request Declined',
            message: `${user.firstName} ${user.lastName} has declined your job request "${job.title}".`,
            data: { jobId, declineReason },
            linkUrl: `/client-dashboard/jobs/${jobId}`,
          },
        })

        logger.info(`Job declined: ${jobId}`, { artisanId: user.id })

        return NextResponse.json({
          message: 'Job declined successfully',
          job: {
            id: updatedJob.id,
            status: updatedJob.status,
          },
        })
      }

      case 'start_job': {
        // Artisan starts working on the job
        if (job.status !== 'DEPOSIT_PAID') {
          return NextResponse.json({
            error: 'Can only start jobs after deposit is paid',
          }, { status: 400 })
        }

        const updatedJob = await prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'IN_PROGRESS',
            startedAt: new Date(),
            scheduledStartDate: scheduledStartDate ? new Date(scheduledStartDate) : null,
            scheduledEndDate: scheduledEndDate ? new Date(scheduledEndDate) : null,
          },
        })

        // Update artisan's current job count
        const updatedProfile = await prisma.profile.update({
          where: { userId: user.id },
          data: {
            currentJobCount: { increment: 1 },
          },
          select: {
            currentJobCount: true,
            maxConcurrentJobs: true,
            autoToggleAvailability: true,
            isAvailable: true,
          },
        })

        // Auto-toggle availability if at capacity
        if (
          updatedProfile.autoToggleAvailability &&
          updatedProfile.isAvailable &&
          updatedProfile.currentJobCount >= updatedProfile.maxConcurrentJobs
        ) {
          await prisma.profile.update({
            where: { userId: user.id },
            data: { isAvailable: false },
          })
          logger.info(`Auto-disabled availability for artisan ${user.id} (at capacity: ${updatedProfile.currentJobCount}/${updatedProfile.maxConcurrentJobs})`)
        }

        // Create notification for client
        await prisma.notification.create({
          data: {
            userId: job.clientId,
            type: 'JOB',
            title: 'Job Started',
            message: `${user.firstName} ${user.lastName} has started working on "${job.title}".`,
            data: { jobId },
            linkUrl: `/client-dashboard/jobs/${jobId}`,
          },
        })

        logger.info(`Job started: ${jobId}`, { artisanId: user.id })

        return NextResponse.json({
          message: 'Job started successfully',
          job: {
            id: updatedJob.id,
            status: updatedJob.status,
            startedAt: updatedJob.startedAt,
          },
        })
      }

      case 'complete_job': {
        // Artisan marks the job as complete
        if (job.status !== 'IN_PROGRESS') {
          return NextResponse.json({
            error: 'Can only complete jobs that are in progress',
          }, { status: 400 })
        }

        const updatedJob = await prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })

        // Update artisan's current job count
        const updatedProfile = await prisma.profile.update({
          where: { userId: user.id },
          data: {
            currentJobCount: { decrement: 1 },
          },
          select: {
            currentJobCount: true,
            maxConcurrentJobs: true,
            autoToggleAvailability: true,
            isAvailable: true,
          },
        })

        // Auto-toggle availability back on if below capacity and was auto-disabled
        if (
          updatedProfile.autoToggleAvailability &&
          !updatedProfile.isAvailable &&
          updatedProfile.currentJobCount < updatedProfile.maxConcurrentJobs
        ) {
          await prisma.profile.update({
            where: { userId: user.id },
            data: { isAvailable: true },
          })
          logger.info(`Auto-enabled availability for artisan ${user.id} (below capacity: ${updatedProfile.currentJobCount}/${updatedProfile.maxConcurrentJobs})`)
        }

        // Create notification for client
        await prisma.notification.create({
          data: {
            userId: job.clientId,
            type: 'JOB',
            title: 'Job Completed',
            message: `${user.firstName} ${user.lastName} has marked "${job.title}" as completed. Please review and make the final payment.`,
            data: { jobId },
            linkUrl: `/client-dashboard/jobs/${jobId}`,
          },
        })

        logger.info(`Job completed: ${jobId}`, { artisanId: user.id })

        return NextResponse.json({
          message: 'Job marked as completed',
          job: {
            id: updatedJob.id,
            status: updatedJob.status,
            completedAt: updatedJob.completedAt,
          },
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to update job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
