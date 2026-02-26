import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import {
  parseSTKCallback,
  getResultCodeDescription,
  type STKCallbackData,
} from '@/lib/mpesa'

const logger = createLogger('api/payments/mpesa/callback')

/**
 * Safaricom M-Pesa IP ranges
 * These IPs are used by M-Pesa to send callbacks
 * NOTE: Always verify these IPs with Safaricom's official documentation
 * as they may change. These are commonly known ranges.
 */
const MPESA_IP_WHITELIST = [
  // Safaricom API servers (example ranges - verify with Safaricom)
  '196.201.214.',  // Safaricom range
  '196.201.213.',  // Safaricom range
  '41.215.63.',    // Safaricom range
  '102.22.16.',    // Safaricom range
  // Sandbox IPs for testing
  '196.201.212.',
  // Allow localhost for development
  '127.0.0.1',
  '::1',
]

/**
 * Check if the request IP is from M-Pesa/Safaricom servers
 */
function isValidMpesaIP(ip: string | null): boolean {
  if (!ip) return false
  
  // In development, allow all IPs
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // Check if IP matches any whitelisted prefix
  return MPESA_IP_WHITELIST.some(prefix => ip.startsWith(prefix))
}

/**
 * POST - M-Pesa STK Push callback handler
 * 
 * This endpoint is called by M-Pesa when a payment is completed (success or failure).
 * It:
 * 1. Parses the callback data
 * 2. Finds the associated payment record
 * 3. Updates payment status
 * 4. Activates subscription if payment successful
 * 5. Creates notification for the user
 * 
 * NOTE: This endpoint is called by M-Pesa servers, not by the user.
 * It should NOT require authentication.
 */
export async function POST(request: Request) {
  try {
    // Verify the request is from M-Pesa servers (only in production)
    if (process.env.NODE_ENV === 'production') {
      try {
        const headersList = await headers()
        const forwardedFor = headersList.get('x-forwarded-for')
        const realIP = headersList.get('x-real-ip')
        const clientIP = forwardedFor?.split(',')[0]?.trim() || realIP
        
        if (!isValidMpesaIP(clientIP)) {
          logger.warn('M-Pesa callback from unauthorized IP', { ip: clientIP })
          return NextResponse.json(
            { ResultCode: 1, ResultDesc: 'Unauthorized' },
            { status: 403 }
          )
        }
      } catch (headerError) {
        // Log but don't fail if headers can't be read (e.g., in edge cases)
        logger.warn('Could not verify client IP', { error: headerError })
      }
    }

    // Parse callback data
    const callbackData: STKCallbackData = await request.json()
    
    logger.info('Received M-Pesa callback', {
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

    logger.info('Parsed callback result', {
      checkoutRequestId: result.checkoutRequestId,
      success: result.success,
      resultDesc: result.resultDesc,
    })

    // Find the payment by checkout request ID
    const payment = await prisma.payment.findFirst({
      where: { mpesaCheckoutId: result.checkoutRequestId },
      include: {
        subscription: {
          include: {
            profile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      logger.error('Payment not found for checkout request', {
        checkoutRequestId: result.checkoutRequestId,
      })
      // Return success to M-Pesa to prevent retries
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    // Process based on result
    if (result.success) {
      // Payment successful - update payment and activate subscription
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.$transaction(async (tx: any) => {
        // Update payment record
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            mpesaTransactionId: result.mpesaReceiptNumber,
            mpesaReceiptNumber: result.mpesaReceiptNumber,
            paidAt: new Date(),
          },
        })

        // Activate subscription
        await tx.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: 'ACTIVE',
            mpesaTransactionId: result.mpesaReceiptNumber,
          },
        })

        // Create notification for user
        if (payment.subscription.profile.user) {
          await tx.notification.create({
            data: {
              userId: payment.subscription.profile.user.id,
              type: 'PAYMENT',
              title: 'Subscription Activated',
              message: `Your ${payment.subscription.plan.toLowerCase()} subscription has been activated. Receipt: ${result.mpesaReceiptNumber}`,
              data: {
                paymentId: payment.id,
                subscriptionId: payment.subscriptionId,
                amount: result.amount,
                receiptNumber: result.mpesaReceiptNumber,
              },
            },
          })
        }
      })

      logger.info('Payment completed successfully', {
        paymentId: payment.id,
        subscriptionId: payment.subscriptionId,
        receiptNumber: result.mpesaReceiptNumber,
        amount: result.amount,
      })
    } else {
      // Payment failed
      const failureReason = getResultCodeDescription(result.resultCode)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.$transaction(async (tx: any) => {
        // Update payment record
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failureReason,
          },
        })

        // Create notification for user
        if (payment.subscription.profile.user) {
          await tx.notification.create({
            data: {
              userId: payment.subscription.profile.user.id,
              type: 'PAYMENT',
              title: 'Payment Failed',
              message: `Your subscription payment failed: ${failureReason}. Please try again.`,
              data: {
                paymentId: payment.id,
                subscriptionId: payment.subscriptionId,
                reason: failureReason,
                resultCode: result.resultCode,
              },
            },
          })
        }
      })

      logger.info('Payment failed', {
        paymentId: payment.id,
        subscriptionId: payment.subscriptionId,
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
    logger.error('Failed to process M-Pesa callback', error)
    // Still return success to prevent M-Pesa from retrying
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    })
  }
}

/**
 * GET - Health check for callback endpoint
 * Useful for verifying the endpoint is accessible
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'M-Pesa callback endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
