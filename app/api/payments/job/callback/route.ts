/**
 * Job Payment M-Pesa Callback API
 * 
 * POST /api/payments/job/callback - Handle M-Pesa callback for job payments
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import {
  parseSTKCallback,
  getResultCodeDescription,
  type STKCallbackData,
} from '@/lib/mpesa'

const logger = createLogger('api/payments/job/callback')

/**
 * Safaricom M-Pesa IP ranges (same as subscription callback)
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

function isValidMpesaIP(ip: string | null): boolean {
  if (!ip) return false
  if (process.env.NODE_ENV === 'development') return true
  return MPESA_IP_WHITELIST.some(prefix => ip.startsWith(prefix))
}

/**
 * POST - Handle M-Pesa callback for job payments
 */
export async function POST(request: Request) {
  try {
    // Verify request is from M-Pesa servers (production only)
    if (process.env.NODE_ENV === 'production') {
      try {
        const headersList = await headers()
        const forwardedFor = headersList.get('x-forwarded-for')
        const realIP = headersList.get('x-real-ip')
        const clientIP = forwardedFor?.split(',')[0]?.trim() || realIP

        if (!isValidMpesaIP(clientIP)) {
          logger.warn('Job payment callback from unauthorized IP', { ip: clientIP })
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
    const callbackData: STKCallbackData = await request.json()

    logger.info('Received job payment M-Pesa callback', {
      merchantRequestId: callbackData.Body?.stkCallback?.MerchantRequestID,
      resultCode: callbackData.Body?.stkCallback?.ResultCode,
    })

    // Validate callback structure
    if (!callbackData.Body?.stkCallback) {
      logger.error('Invalid callback structure', { data: callbackData })
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 })
    }

    // Parse the callback
    const result = parseSTKCallback(callbackData)

    logger.info('Parsed job payment callback result', {
      checkoutRequestId: result.checkoutRequestId,
      success: result.success,
      resultDesc: result.resultDesc,
    })

    // Find the job payment by checkout request ID
    const jobPayment = await prisma.jobPayment.findFirst({
      where: { mpesaCheckoutId: result.checkoutRequestId },
      include: {
        job: {
          include: {
            client: {
              select: { id: true, firstName: true, lastName: true },
            },
            artisan: {
              select: { 
                id: true, 
                firstName: true, 
                lastName: true,
                profile: {
                  select: { currentJobCount: true, maxConcurrentJobs: true },
                },
              },
            },
          },
        },
      },
    })

    if (!jobPayment) {
      logger.error('Job payment not found for checkout request', {
        checkoutRequestId: result.checkoutRequestId,
      })
      // Return success to M-Pesa to prevent retries
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    // Process based on result
    if (result.success) {
      // Payment successful
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.$transaction(async (tx: any) => {
        // Update job payment record
        await tx.jobPayment.update({
          where: { id: jobPayment.id },
          data: {
            status: 'COMPLETED',
            mpesaReceiptNumber: result.mpesaReceiptNumber,
            paidAt: new Date(),
          },
        })

        // Update job based on payment type
        if (jobPayment.type === 'DEPOSIT') {
          // Deposit paid - update job status
          await tx.job.update({
            where: { id: jobPayment.jobId },
            data: {
              status: 'DEPOSIT_PAID',
              depositPaid: true,
              depositPaidAt: new Date(),
            },
          })

          // Notify artisan about deposit
          await tx.notification.create({
            data: {
              userId: jobPayment.job.artisanId,
              type: 'PAYMENT',
              title: 'Deposit Received',
              message: `${jobPayment.job.client.firstName} ${jobPayment.job.client.lastName} has paid the deposit for "${jobPayment.job.title}". You can now start the job.`,
              data: {
                jobId: jobPayment.jobId,
                paymentId: jobPayment.id,
                amount: result.amount,
                receiptNumber: result.mpesaReceiptNumber,
              },
              linkUrl: `/artisan-dashboard/jobs/${jobPayment.jobId}`,
            },
          })

          // Notify client about successful deposit
          await tx.notification.create({
            data: {
              userId: jobPayment.job.clientId,
              type: 'PAYMENT',
              title: 'Deposit Payment Successful',
              message: `Your deposit payment of KES ${result.amount} for "${jobPayment.job.title}" was successful. Receipt: ${result.mpesaReceiptNumber}`,
              data: {
                jobId: jobPayment.jobId,
                paymentId: jobPayment.id,
                amount: result.amount,
                receiptNumber: result.mpesaReceiptNumber,
              },
              linkUrl: `/client-dashboard/jobs/${jobPayment.jobId}`,
            },
          })
        } else if (jobPayment.type === 'FINAL') {
          // Final payment - mark job as fully paid
          await tx.job.update({
            where: { id: jobPayment.jobId },
            data: {
              status: 'PAID',
              finalPaid: true,
              finalPaidAt: new Date(),
            },
          })

          // Notify artisan about final payment
          await tx.notification.create({
            data: {
              userId: jobPayment.job.artisanId,
              type: 'PAYMENT',
              title: 'Final Payment Received',
              message: `${jobPayment.job.client.firstName} ${jobPayment.job.client.lastName} has completed the final payment for "${jobPayment.job.title}". The job is now fully paid.`,
              data: {
                jobId: jobPayment.jobId,
                paymentId: jobPayment.id,
                amount: result.amount,
                receiptNumber: result.mpesaReceiptNumber,
              },
              linkUrl: `/artisan-dashboard/jobs/${jobPayment.jobId}`,
            },
          })

          // Notify client about successful final payment
          await tx.notification.create({
            data: {
              userId: jobPayment.job.clientId,
              type: 'PAYMENT',
              title: 'Payment Complete',
              message: `Your final payment of KES ${result.amount} for "${jobPayment.job.title}" was successful. Receipt: ${result.mpesaReceiptNumber}`,
              data: {
                jobId: jobPayment.jobId,
                paymentId: jobPayment.id,
                amount: result.amount,
                receiptNumber: result.mpesaReceiptNumber,
              },
              linkUrl: `/client-dashboard/jobs/${jobPayment.jobId}`,
            },
          })
        }
      })

      logger.info('Job payment completed successfully', {
        paymentId: jobPayment.id,
        jobId: jobPayment.jobId,
        type: jobPayment.type,
        receiptNumber: result.mpesaReceiptNumber,
        amount: result.amount,
      })
    } else {
      // Payment failed
      const failureReason = getResultCodeDescription(result.resultCode)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.$transaction(async (tx: any) => {
        // Update payment record
        await tx.jobPayment.update({
          where: { id: jobPayment.id },
          data: {
            status: 'FAILED',
            failureReason,
          },
        })

        // Notify client about failed payment
        await tx.notification.create({
          data: {
            userId: jobPayment.job.clientId,
            type: 'PAYMENT',
            title: 'Payment Failed',
            message: `Your ${jobPayment.type.toLowerCase()} payment for "${jobPayment.job.title}" failed: ${failureReason}. Please try again.`,
            data: {
              jobId: jobPayment.jobId,
              paymentId: jobPayment.id,
              reason: failureReason,
              resultCode: result.resultCode,
            },
            linkUrl: `/client-dashboard/jobs/${jobPayment.jobId}`,
          },
        })
      })

      logger.info('Job payment failed', {
        paymentId: jobPayment.id,
        jobId: jobPayment.jobId,
        type: jobPayment.type,
        resultCode: result.resultCode,
        reason: failureReason,
      })
    }

    // Always return success to M-Pesa to acknowledge receipt
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully',
    })
  } catch (error) {
    logger.error('Failed to process job payment M-Pesa callback', error)
    // Still return success to prevent M-Pesa from retrying
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    })
  }
}

/**
 * GET - Health check for callback endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Job payment M-Pesa callback endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
