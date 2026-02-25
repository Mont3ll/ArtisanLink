/**
 * Admin Payout Detail API
 * 
 * GET /api/admin/payouts/[id] - Get payout details
 * PATCH /api/admin/payouts/[id] - Update payout (retry, cancel, add notes)
 * 
 * Admin only endpoint for managing individual payouts.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { getNextRetryTime } from '@/lib/mpesa/b2c'

const logger = createLogger('api/admin/payouts/[id]')

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET - Get payout details
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const payout = await prisma.artisanPayout.findUnique({
      where: { id },
      include: {
        artisan: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            completedJobCount: true,
            artisanProfile: {
              select: { businessName: true },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            agreedPrice: true,
            depositAmount: true,
            status: true,
            client: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    })

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    return NextResponse.json(payout)
  } catch (error) {
    logger.error('Failed to get payout', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH - Update payout (retry, cancel, add notes)
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, adminNotes, phoneNumber } = body

    const payout = await prisma.artisanPayout.findUnique({
      where: { id },
    })

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    // Handle different actions
    switch (action) {
      case 'retry': {
        // Reset payout for retry
        if (payout.status === 'COMPLETED') {
          return NextResponse.json(
            { error: 'Cannot retry completed payout' },
            { status: 400 }
          )
        }

        const updatedPayout = await prisma.artisanPayout.update({
          where: { id },
          data: {
            status: 'PENDING',
            requiresManualReview: false,
            nextRetryAt: new Date(), // Immediate retry
            adminNotes: adminNotes || payout.adminNotes,
            reviewedBy: user.id,
            reviewedAt: new Date(),
            // Update phone number if provided
            ...(phoneNumber && { phoneNumber }),
            // Clear previous error state
            failureReason: null,
            resultCode: null,
            resultDesc: null,
            mpesaConversationId: null,
            mpesaTransactionId: null,
          },
        })

        logger.info('Payout marked for retry by admin', {
          payoutId: id,
          adminId: user.id,
        })

        return NextResponse.json({
          success: true,
          message: 'Payout scheduled for retry',
          payout: updatedPayout,
        })
      }

      case 'cancel': {
        if (payout.status === 'COMPLETED') {
          return NextResponse.json(
            { error: 'Cannot cancel completed payout' },
            { status: 400 }
          )
        }

        if (payout.status === 'PROCESSING') {
          return NextResponse.json(
            { error: 'Cannot cancel payout in processing state' },
            { status: 400 }
          )
        }

        const updatedPayout = await prisma.artisanPayout.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            adminNotes: adminNotes || 'Cancelled by admin',
            reviewedBy: user.id,
            reviewedAt: new Date(),
          },
        })

        logger.info('Payout cancelled by admin', {
          payoutId: id,
          adminId: user.id,
        })

        return NextResponse.json({
          success: true,
          message: 'Payout cancelled',
          payout: updatedPayout,
        })
      }

      case 'markComplete': {
        // Manual completion (e.g., when payment was made outside system)
        if (payout.status === 'COMPLETED') {
          return NextResponse.json(
            { error: 'Payout already completed' },
            { status: 400 }
          )
        }

        const { transactionId, receiptNumber } = body
        if (!transactionId && !receiptNumber) {
          return NextResponse.json(
            { error: 'Transaction ID or receipt number required' },
            { status: 400 }
          )
        }

        const updatedPayout = await prisma.artisanPayout.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            mpesaTransactionId: transactionId,
            mpesaReceiptNumber: receiptNumber,
            completedAt: new Date(),
            adminNotes: adminNotes || 'Manually marked complete by admin',
            reviewedBy: user.id,
            reviewedAt: new Date(),
            requiresManualReview: false,
          },
        })

        // Increment artisan's completed job count if this is a final payment
        if (payout.type === 'FINAL_PAYMENT' && payout.jobId) {
          await prisma.user.update({
            where: { id: payout.artisanId },
            data: { completedJobCount: { increment: 1 } },
          })
        }

        logger.info('Payout manually marked complete by admin', {
          payoutId: id,
          adminId: user.id,
          transactionId,
        })

        return NextResponse.json({
          success: true,
          message: 'Payout marked as complete',
          payout: updatedPayout,
        })
      }

      case 'addNotes': {
        if (!adminNotes) {
          return NextResponse.json(
            { error: 'Admin notes required' },
            { status: 400 }
          )
        }

        const existingNotes = payout.adminNotes || ''
        const timestamp = new Date().toISOString()
        const newNotes = existingNotes
          ? `${existingNotes}\n\n[${timestamp}] ${adminNotes}`
          : `[${timestamp}] ${adminNotes}`

        const updatedPayout = await prisma.artisanPayout.update({
          where: { id },
          data: {
            adminNotes: newNotes,
            reviewedBy: user.id,
            reviewedAt: new Date(),
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Notes added',
          payout: updatedPayout,
        })
      }

      case 'clearReview': {
        // Clear manual review flag without retrying
        const updatedPayout = await prisma.artisanPayout.update({
          where: { id },
          data: {
            requiresManualReview: false,
            adminNotes: adminNotes || payout.adminNotes,
            reviewedBy: user.id,
            reviewedAt: new Date(),
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Manual review cleared',
          payout: updatedPayout,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Failed to update payout', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
