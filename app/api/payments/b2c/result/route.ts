import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import {
  parseB2CCallback,
  getB2CResultDescription,
  getNextRetryTime,
  shouldRetryPayout,
  type B2CCallbackData,
} from '@/lib/mpesa/b2c'

const logger = createLogger('api/payments/b2c/result')

/**
 * Safaricom M-Pesa IP ranges
 * These IPs are used by M-Pesa to send callbacks
 * NOTE: Always verify these IPs with Safaricom's official documentation
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
 * Send admin notification for failed payout requiring manual review
 */
async function notifyAdminFailedPayout(payoutId: string, artisanName: string, amount: number, reason: string) {
  // Create admin notification in database
  try {
    // Find admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    // Create notifications for all admins
    await prisma.notification.createMany({
      data: admins.map((admin: { id: string }) => ({
        userId: admin.id,
        type: 'SYSTEM',
        title: 'Payout Requires Manual Review',
        message: `Payout to ${artisanName} for KES ${amount.toLocaleString()} failed after max retries. Reason: ${reason}`,
        metadata: JSON.stringify({
          payoutId,
          type: 'PAYOUT_FAILED',
          requiresAction: true,
        }),
      })),
    })

    logger.info('Admin notification sent for failed payout', { payoutId })

    // TODO: In production, also send email notification
    // if (process.env.PAYOUT_ADMIN_EMAIL) {
    //   await sendEmail(...)
    // }
  } catch (error) {
    logger.error('Failed to send admin notification', error as Error, { payoutId })
  }
}

/**
 * POST - M-Pesa B2C Result callback handler
 * 
 * Called by M-Pesa when a B2C payment is completed (success or failure).
 * Updates the payout record and handles retry logic for failed payments.
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
          logger.warn('B2C callback from unauthorized IP', { ip: clientIP })
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
    const callbackData: B2CCallbackData = await request.json()

    logger.info('Received B2C result callback', {
      conversationId: callbackData.Result?.ConversationID,
      resultCode: callbackData.Result?.ResultCode,
    })

    // Validate callback structure
    if (!callbackData.Result) {
      logger.error('Invalid B2C callback structure', { data: callbackData })
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    // Parse the callback
    const result = parseB2CCallback(callbackData)

    logger.info('Parsed B2C result', {
      conversationId: result.conversationId,
      success: result.success,
      resultCode: result.resultCode,
      transactionId: result.transactionId,
    })

    // Find the payout by conversation ID
    const payout = await prisma.artisanPayout.findFirst({
      where: { mpesaConversationId: result.conversationId },
      include: {
        artisan: {
          include: {
            artisanProfile: true,
          },
        },
        job: true,
      },
    })

    if (!payout) {
      logger.error('Payout not found for conversation ID', {
        conversationId: result.conversationId,
      })
      // Return success to M-Pesa to prevent retries
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    if (result.success) {
      // Payment successful
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.$transaction(async (tx: any) => {
        // Update payout record
        await tx.artisanPayout.update({
          where: { id: payout.id },
          data: {
            status: 'COMPLETED',
            mpesaTransactionId: result.transactionId,
            mpesaReceiptNumber: result.receiptNumber,
            resultCode: result.resultCode,
            resultDesc: result.resultDesc,
            completedAt: new Date(),
          },
        })

        // Increment artisan's completed job count if this is a final payment
        if (payout.type === 'FINAL_PAYMENT' && payout.jobId) {
          await tx.user.update({
            where: { id: payout.artisanId },
            data: {
              completedJobCount: { increment: 1 },
            },
          })
        }

        // Create notification for artisan
        await tx.notification.create({
          data: {
            userId: payout.artisanId,
            type: 'PAYMENT',
            title: 'Payment Received',
            message: `You have received KES ${payout.netAmount.toLocaleString()} for ${payout.type === 'DEPOSIT_SHARE' ? 'deposit payment' : 'completed job'}. Receipt: ${result.receiptNumber}`,
            metadata: JSON.stringify({
              payoutId: payout.id,
              jobId: payout.jobId,
              amount: payout.netAmount,
              receiptNumber: result.receiptNumber,
              transactionId: result.transactionId,
            }),
          },
        })
      })

      logger.info('B2C payout completed successfully', {
        payoutId: payout.id,
        artisanId: payout.artisanId,
        amount: payout.netAmount,
        receiptNumber: result.receiptNumber,
      })
    } else {
      // Payment failed - handle retry logic
      const failureReason = getB2CResultDescription(result.resultCode)
      const maxRetries = payout.maxRetries || 3
      const newRetryCount = payout.retryCount + 1
      const canRetry = shouldRetryPayout(newRetryCount, maxRetries)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.$transaction(async (tx: any) => {
        if (canRetry) {
          // Schedule for retry
          const nextRetry = getNextRetryTime(newRetryCount)

          await tx.artisanPayout.update({
            where: { id: payout.id },
            data: {
              status: 'PENDING', // Reset to pending for retry
              failureReason,
              resultCode: result.resultCode,
              resultDesc: result.resultDesc,
              retryCount: newRetryCount,
              nextRetryAt: nextRetry,
              mpesaConversationId: null, // Clear for next attempt
              mpesaTransactionId: null,
            },
          })

          logger.info('B2C payout scheduled for retry', {
            payoutId: payout.id,
            retryCount: newRetryCount,
            nextRetryAt: nextRetry,
            reason: failureReason,
          })
        } else {
          // Max retries exceeded - mark for manual review
          await tx.artisanPayout.update({
            where: { id: payout.id },
            data: {
              status: 'FAILED',
              failureReason,
              resultCode: result.resultCode,
              resultDesc: result.resultDesc,
              retryCount: newRetryCount,
              requiresManualReview: true,
            },
          })

          // Create notification for artisan about failed payout
          await tx.notification.create({
            data: {
              userId: payout.artisanId,
              type: 'PAYMENT',
              title: 'Payout Failed',
              message: `Your payout of KES ${payout.netAmount.toLocaleString()} could not be processed. Our team will review and resolve this shortly.`,
              metadata: JSON.stringify({
                payoutId: payout.id,
                jobId: payout.jobId,
                amount: payout.netAmount,
                reason: failureReason,
              }),
            },
          })

          logger.warn('B2C payout failed after max retries', {
            payoutId: payout.id,
            retryCount: newRetryCount,
            reason: failureReason,
          })
        }
      })

      // Notify admins if payout requires manual review
      if (!canRetry) {
        const artisanName = payout.artisan.artisanProfile?.businessName ||
          `${payout.artisan.firstName} ${payout.artisan.lastName}`
        await notifyAdminFailedPayout(payout.id, artisanName, payout.netAmount, failureReason)
      }
    }

    // Always return success to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully',
    })
  } catch (error) {
    logger.error('Failed to process B2C result callback', error as Error)
    // Return success to prevent M-Pesa retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    })
  }
}

/**
 * GET - Health check for B2C result callback endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'B2C result callback endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
