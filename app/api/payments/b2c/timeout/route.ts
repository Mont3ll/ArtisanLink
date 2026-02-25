import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { getNextRetryTime, shouldRetryPayout } from '@/lib/mpesa/b2c'

const logger = createLogger('api/payments/b2c/timeout')

/**
 * Safaricom M-Pesa IP ranges
 */
const MPESA_IP_WHITELIST = [
  '196.201.214.',
  '196.201.213.',
  '41.215.63.',
  '102.22.16.',
  '196.201.212.',
  '127.0.0.1',
  '::1',
]

/**
 * Check if the request IP is from M-Pesa/Safaricom servers
 */
function isValidMpesaIP(ip: string | null): boolean {
  if (!ip) return false
  if (process.env.NODE_ENV === 'development') return true
  return MPESA_IP_WHITELIST.some(prefix => ip.startsWith(prefix))
}

/**
 * B2C Timeout callback data structure
 */
interface B2CTimeoutData {
  Result: {
    ResultType: number
    ResultCode: number
    ResultDesc: string
    OriginatorConversationID: string
    ConversationID: string
    TransactionID: string
    ReferenceData?: {
      ReferenceItem: {
        Key: string
        Value: string
      }
    }
  }
}

/**
 * Send admin notification for timed-out payout requiring manual review
 */
async function notifyAdminTimeoutPayout(payoutId: string, artisanName: string, amount: number) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    await prisma.notification.createMany({
      data: admins.map((admin: { id: string }) => ({
        userId: admin.id,
        type: 'SYSTEM',
        title: 'Payout Timeout - Manual Review Required',
        message: `Payout to ${artisanName} for KES ${amount.toLocaleString()} timed out after max retries. Please check M-Pesa portal for status.`,
        metadata: JSON.stringify({
          payoutId,
          type: 'PAYOUT_TIMEOUT',
          requiresAction: true,
        }),
      })),
    })

    logger.info('Admin notification sent for timed-out payout', { payoutId })
  } catch (error) {
    logger.error('Failed to send admin notification', error as Error, { payoutId })
  }
}

/**
 * POST - M-Pesa B2C Timeout callback handler
 * 
 * Called by M-Pesa when a B2C payment request times out.
 * This typically means the request could not be processed within
 * the expected time frame and the status is unknown.
 * 
 * IMPORTANT: A timeout does NOT mean the payment failed.
 * The payment may still be processing. We should schedule a retry
 * and potentially check the transaction status via query API.
 */
export async function POST(request: Request) {
  try {
    // Verify request is from M-Pesa (production only)
    if (process.env.NODE_ENV === 'production') {
      try {
        const headersList = await headers()
        const forwardedFor = headersList.get('x-forwarded-for')
        const realIP = headersList.get('x-real-ip')
        const clientIP = forwardedFor?.split(',')[0]?.trim() || realIP

        if (!isValidMpesaIP(clientIP)) {
          logger.warn('B2C timeout callback from unauthorized IP', { ip: clientIP })
          return NextResponse.json(
            { ResultCode: 1, ResultDesc: 'Unauthorized' },
            { status: 403 }
          )
        }
      } catch (headerError) {
        logger.warn('Could not verify client IP', { error: headerError })
      }
    }

    // Parse callback data
    const callbackData: B2CTimeoutData = await request.json()

    logger.warn('Received B2C timeout callback', {
      conversationId: callbackData.Result?.ConversationID,
      originatorId: callbackData.Result?.OriginatorConversationID,
    })

    // Validate callback structure
    if (!callbackData.Result) {
      logger.error('Invalid B2C timeout callback structure', { data: callbackData })
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    const { ConversationID, OriginatorConversationID, ResultDesc } = callbackData.Result

    // Find the payout by conversation ID
    const payout = await prisma.artisanPayout.findFirst({
      where: { mpesaConversationId: ConversationID },
      include: {
        artisan: {
          include: {
            artisanProfile: true,
          },
        },
      },
    })

    if (!payout) {
      // Try finding by originator ID as fallback
      const payoutByOriginator = await prisma.artisanPayout.findFirst({
        where: { mpesaOriginatorId: OriginatorConversationID },
        include: {
          artisan: {
            include: {
              artisanProfile: true,
            },
          },
        },
      })

      if (!payoutByOriginator) {
        logger.error('Payout not found for timeout callback', {
          conversationId: ConversationID,
          originatorId: OriginatorConversationID,
        })
        return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
      }

      // Use the payout found by originator ID
      await handleTimeout(payoutByOriginator, ResultDesc)
    } else {
      await handleTimeout(payout, ResultDesc)
    }

    // Always return success to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Timeout callback processed',
    })
  } catch (error) {
    logger.error('Failed to process B2C timeout callback', error as Error)
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    })
  }
}

/**
 * Handle timeout for a payout record
 */
async function handleTimeout(
  payout: {
    id: string
    artisanId: string
    netAmount: number
    retryCount: number
    maxRetries: number | null
    artisan: {
      firstName: string | null
      lastName: string | null
      artisanProfile: { businessName: string | null } | null
    }
  },
  resultDesc: string
) {
  const maxRetries = payout.maxRetries || 3
  const newRetryCount = payout.retryCount + 1
  const canRetry = shouldRetryPayout(newRetryCount, maxRetries)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (tx: any) => {
    if (canRetry) {
      // Schedule for retry - timeout is usually temporary
      const nextRetry = getNextRetryTime(newRetryCount)

      await tx.artisanPayout.update({
        where: { id: payout.id },
        data: {
          status: 'PENDING', // Reset to pending for retry
          failureReason: `Request timed out: ${resultDesc}`,
          retryCount: newRetryCount,
          nextRetryAt: nextRetry,
          mpesaConversationId: null, // Clear for next attempt
          mpesaTransactionId: null,
        },
      })

      logger.info('B2C timeout - scheduled for retry', {
        payoutId: payout.id,
        retryCount: newRetryCount,
        nextRetryAt: nextRetry,
      })
    } else {
      // Max retries exceeded - mark for manual review
      // IMPORTANT: For timeouts, the payment might still have gone through
      // Admin should check M-Pesa portal before processing refund/retry
      await tx.artisanPayout.update({
        where: { id: payout.id },
        data: {
          status: 'FAILED',
          failureReason: `Request timed out after ${newRetryCount} attempts: ${resultDesc}`,
          retryCount: newRetryCount,
          requiresManualReview: true,
          adminNotes: 'TIMEOUT - Check M-Pesa portal to verify if payment was actually processed before retrying.',
        },
      })

      // Create notification for artisan
      await tx.notification.create({
        data: {
          userId: payout.artisanId,
          type: 'PAYMENT',
          title: 'Payout Processing Delayed',
          message: `Your payout of KES ${payout.netAmount.toLocaleString()} is being reviewed. Our team will ensure you receive your payment shortly.`,
          metadata: JSON.stringify({
            payoutId: payout.id,
            amount: payout.netAmount,
            status: 'under_review',
          }),
        },
      })

      logger.warn('B2C timeout - requires manual review', {
        payoutId: payout.id,
        retryCount: newRetryCount,
      })
    }
  })

  // Notify admins if payout requires manual review
  if (!canRetry) {
    const artisanName = payout.artisan.artisanProfile?.businessName ||
      `${payout.artisan.firstName} ${payout.artisan.lastName}`
    await notifyAdminTimeoutPayout(payout.id, artisanName, payout.netAmount)
  }
}

/**
 * GET - Health check for B2C timeout callback endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'B2C timeout callback endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
