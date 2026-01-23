/**
 * Client Job Details API
 *
 * GET /api/client/jobs/[id] - Get job details
 * PATCH /api/client/jobs/[id] - Update job (accept quote, cancel, mark complete)
 * DELETE /api/client/jobs/[id] - Cancel job request (only if REQUESTED status)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { JobStatus, QuoteStatus } from '@/app/generated/prisma'

const logger = createLogger('api:client:jobs:id')

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/client/jobs/[id]
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

    if (user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only clients can access this endpoint' }, { status: 403 })
    }

    // Get job with all details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        artisan: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profile: {
              select: {
                id: true,
                profileImage: true,
                profession: true,
                averageRating: true,
                totalReviews: true,
                isAvailable: true,
                county: true,
                city: true,
              },
            },
          },
        },
        client: {
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

    // Verify the client owns this job
    if (job.clientId !== user.id) {
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
      artisan: {
        id: job.artisan.id,
        name: `${job.artisan.firstName} ${job.artisan.lastName}`,
        email: job.artisan.email,
        phone: job.artisan.phone,
        profileImage: job.artisan.profile?.profileImage,
        profession: job.artisan.profile?.profession,
        rating: job.artisan.profile?.averageRating || 0,
        totalReviews: job.artisan.profile?.totalReviews || 0,
        isAvailable: job.artisan.profile?.isAvailable || false,
        location: job.artisan.profile
          ? `${job.artisan.profile.city || ''}, ${job.artisan.profile.county || ''}`.replace(/^, |, $/, '')
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
    }

    return NextResponse.json({ job: formattedJob })
  } catch (error) {
    logger.error('Failed to fetch job details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/client/jobs/[id]
 * Update job status (accept/decline quote, cancel job, confirm completion)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await params

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true, firstName: true, lastName: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only clients can update their jobs' }, { status: 403 })
    }

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        artisan: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: { currentJobCount: true },
            },
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.clientId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { action, quoteId, cancelReason, clientNotes } = body

    switch (action) {
      case 'accept_quote': {
        // Client accepts an artisan's quote
        if (!quoteId) {
          return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 })
        }

        const quote = await prisma.quote.findUnique({
          where: { id: quoteId },
        })

        if (!quote || quote.jobId !== jobId) {
          return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
        }

        if (quote.status !== 'SENT') {
          return NextResponse.json({ error: 'Quote is not available for acceptance' }, { status: 400 })
        }

        if (quote.validUntil && new Date(quote.validUntil) < new Date()) {
          return NextResponse.json({ error: 'Quote has expired' }, { status: 400 })
        }

        // Use artisan's requested deposit percent if specified, otherwise use job's default
        const effectiveDepositPercent = quote.requestedDepositPercent ?? job.depositPercent
        const depositAmount = (quote.amount * effectiveDepositPercent) / 100

        // Update quote and job in a transaction
        const [updatedQuote, updatedJob] = await prisma.$transaction([
          prisma.quote.update({
            where: { id: quoteId },
            data: { status: 'ACCEPTED' },
          }),
          prisma.job.update({
            where: { id: jobId },
            data: {
              status: 'ACCEPTED',
              agreedPrice: quote.amount,
              depositAmount,
              depositPercent: effectiveDepositPercent, // Update to reflect accepted terms
            },
          }),
          // Decline any other quotes
          prisma.quote.updateMany({
            where: {
              jobId,
              id: { not: quoteId },
              status: 'SENT',
            },
            data: { status: 'DECLINED' },
          }),
        ])

        // Create notification for artisan
        await prisma.notification.create({
          data: {
            userId: job.artisanId,
            type: 'JOB',
            title: 'Quote Accepted',
            message: `${user.firstName} ${user.lastName} has accepted your quote for "${job.title}". Awaiting deposit payment.`,
            data: { jobId, quoteId },
            linkUrl: `/artisan-dashboard/jobs/${jobId}`,
          },
        })

        logger.info(`Quote accepted: ${quoteId}`, { jobId, clientId: user.id })

        return NextResponse.json({
          message: 'Quote accepted successfully',
          job: {
            id: updatedJob.id,
            status: updatedJob.status,
            agreedPrice: updatedJob.agreedPrice,
            depositAmount: updatedJob.depositAmount,
          },
          quote: {
            id: updatedQuote.id,
            status: updatedQuote.status,
          },
        })
      }

      case 'decline_quote': {
        // Client declines/requests revision of a quote
        if (!quoteId) {
          return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 })
        }

        const quote = await prisma.quote.findUnique({
          where: { id: quoteId },
        })

        if (!quote || quote.jobId !== jobId) {
          return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
        }

        if (quote.status !== 'SENT') {
          return NextResponse.json({ error: 'Quote is not available for decline' }, { status: 400 })
        }

        // Check if this was round 1 (allow revision) or round 2 (final decline)
        const isFirstRound = quote.round === 1

        // Update quote with client notes
        // Round 1: REVISION_REQUESTED - artisan can send revised quote
        // Round 2: DECLINED - final decline, job ends
        await prisma.quote.update({
          where: { id: quoteId },
          data: {
            status: isFirstRound ? 'REVISION_REQUESTED' : 'DECLINED',
            clientResponse: clientNotes || null,
            respondedAt: new Date(),
          },
        })

        // If it's the second round, mark job as declined
        if (!isFirstRound) {
          await prisma.job.update({
            where: { id: jobId },
            data: { status: 'DECLINED' },
          })
        }

        // Create notification for artisan
        await prisma.notification.create({
          data: {
            userId: job.artisanId,
            type: 'JOB',
            title: isFirstRound ? 'Quote Revision Requested' : 'Quote Declined',
            message: isFirstRound
              ? `${user.firstName} ${user.lastName} has requested a revision to your quote for "${job.title}".`
              : `${user.firstName} ${user.lastName} has declined your final quote for "${job.title}".`,
            data: { jobId, quoteId, clientNotes },
            linkUrl: `/artisan-dashboard/jobs/${jobId}`,
          },
        })

        logger.info(`Quote ${isFirstRound ? 'revision requested' : 'declined'}: ${quoteId}`, { jobId, clientId: user.id, round: quote.round })

        return NextResponse.json({
          message: isFirstRound ? 'Revision requested' : 'Quote declined',
          canRevise: isFirstRound,
        })
      }

      case 'cancel': {
        // Client cancels the job request
        const cancellableStatuses: JobStatus[] = ['REQUESTED', 'QUOTED', 'ACCEPTED']
        if (!cancellableStatuses.includes(job.status)) {
          return NextResponse.json({
            error: 'Job cannot be cancelled at this stage',
          }, { status: 400 })
        }

        // If deposit was paid, handle refund logic (not implemented yet)
        if (job.depositPaid) {
          return NextResponse.json({
            error: 'Cannot cancel job after deposit has been paid. Please contact support.',
          }, { status: 400 })
        }

        const updatedJob = await prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'CANCELLED',
            cancelReason: cancelReason || 'Cancelled by client',
          },
        })

        // Create notification for artisan
        await prisma.notification.create({
          data: {
            userId: job.artisanId,
            type: 'JOB',
            title: 'Job Cancelled',
            message: `${user.firstName} ${user.lastName} has cancelled the job request "${job.title}".`,
            data: { jobId, cancelReason },
            linkUrl: `/artisan-dashboard/jobs/${jobId}`,
          },
        })

        logger.info(`Job cancelled: ${jobId}`, { clientId: user.id })

        return NextResponse.json({
          message: 'Job cancelled successfully',
          job: {
            id: updatedJob.id,
            status: updatedJob.status,
          },
        })
      }

      case 'confirm_completion': {
        // Client confirms the job is complete
        if (job.status !== 'COMPLETED') {
          return NextResponse.json({
            error: 'Job must be marked as completed by artisan first',
          }, { status: 400 })
        }

        // Job is already completed, this triggers final payment flow
        // For now, just acknowledge
        return NextResponse.json({
          message: 'Completion confirmed. Please proceed with final payment.',
          job: {
            id: job.id,
            status: job.status,
            agreedPrice: job.agreedPrice,
            depositAmount: job.depositAmount,
            finalAmount: job.agreedPrice ? job.agreedPrice - (job.depositAmount || 0) : null,
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

/**
 * DELETE /api/client/jobs/[id]
 * Delete/cancel a job request (only in REQUESTED status)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    if (user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only clients can delete their jobs' }, { status: 403 })
    }

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.clientId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Only allow deletion of REQUESTED jobs
    if (job.status !== 'REQUESTED') {
      return NextResponse.json({
        error: 'Only pending job requests can be deleted',
      }, { status: 400 })
    }

    // Delete the job
    await prisma.job.delete({
      where: { id: jobId },
    })

    logger.info(`Job deleted: ${jobId}`, { clientId: user.id })

    return NextResponse.json({
      message: 'Job request deleted successfully',
    })
  } catch (error) {
    logger.error('Failed to delete job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
