import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import {
  getMpesaConfig,
  validateMpesaConfig,
  isMpesaEnabled,
  querySTKPushStatus,
  getResultCodeDescription,
} from '@/lib/mpesa'

const logger = createLogger('api/payments/mpesa/status')

/**
 * GET - Query M-Pesa payment status
 * 
 * This endpoint:
 * 1. Checks payment status in our database
 * 2. Optionally queries M-Pesa API for real-time status
 * 3. Returns the payment status to the client
 * 
 * Query params:
 * - checkoutRequestId: The M-Pesa checkout request ID (required)
 * - query: If 'true', also query M-Pesa API for real-time status
 */
export async function GET(request: Request) {
  try {
    // Authenticate user
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const checkoutRequestId = searchParams.get('checkoutRequestId')
    const shouldQuery = searchParams.get('query') === 'true'

    if (!checkoutRequestId) {
      return NextResponse.json(
        { error: 'checkoutRequestId is required' },
        { status: 400 }
      )
    }

    // Find payment in database
    const payment = await prisma.payment.findFirst({
      where: { mpesaCheckoutId: checkoutRequestId },
      include: {
        subscription: {
          include: {
            profile: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Verify user owns this payment
    if (payment.subscription.profile.userId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // If payment is already completed or failed, return from database
    if (payment.status === 'COMPLETED' || payment.status === 'FAILED') {
      return NextResponse.json({
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        receiptNumber: payment.mpesaReceiptNumber,
        paidAt: payment.paidAt,
        failureReason: payment.failureReason,
        subscription: {
          id: payment.subscription.id,
          status: payment.subscription.status,
          plan: payment.subscription.plan,
          startDate: payment.subscription.startDate,
          endDate: payment.subscription.endDate,
        },
      })
    }

    // If requested and payment still pending, query M-Pesa API
    if (shouldQuery && payment.status === 'PENDING' && isMpesaEnabled()) {
      const mpesaConfig = getMpesaConfig()
      const configValidation = validateMpesaConfig(mpesaConfig)

      if (configValidation.valid) {
        try {
          const stkStatus = await querySTKPushStatus(mpesaConfig, checkoutRequestId)

          logger.info('STK status query result', {
            checkoutRequestId,
            resultCode: stkStatus.ResultCode,
          })

          // Parse result code
          const resultCode = parseInt(stkStatus.ResultCode, 10)
          
          // If we get a definitive result, update the database
          if (resultCode === 0) {
            // Payment successful but callback hasn't arrived yet
            // The callback will handle the full update
            return NextResponse.json({
              paymentId: payment.id,
              status: 'PROCESSING',
              statusMessage: 'Payment received, processing confirmation...',
              amount: payment.amount,
              currency: payment.currency,
              subscription: {
                id: payment.subscription.id,
                status: payment.subscription.status,
                plan: payment.subscription.plan,
              },
            })
          } else if (resultCode !== 0) {
            // Payment failed - update status
            const failureReason = getResultCodeDescription(resultCode)
            
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: 'FAILED',
                failureReason,
              },
            })

            return NextResponse.json({
              paymentId: payment.id,
              status: 'FAILED',
              statusMessage: failureReason,
              amount: payment.amount,
              currency: payment.currency,
              subscription: {
                id: payment.subscription.id,
                status: payment.subscription.status,
                plan: payment.subscription.plan,
              },
            })
          }
        } catch (queryError) {
          // Log but don't fail - return database status
          logger.error('Failed to query M-Pesa status', { 
            checkoutRequestId, 
            error: queryError 
          })
        }
      }
    }

    // Return current database status
    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      statusMessage: payment.status === 'PENDING' 
        ? 'Waiting for payment confirmation...' 
        : undefined,
      amount: payment.amount,
      currency: payment.currency,
      receiptNumber: payment.mpesaReceiptNumber,
      paidAt: payment.paidAt,
      failureReason: payment.failureReason,
      subscription: {
        id: payment.subscription.id,
        status: payment.subscription.status,
        plan: payment.subscription.plan,
        startDate: payment.subscription.startDate,
        endDate: payment.subscription.endDate,
      },
    })
  } catch (error) {
    logger.error('Failed to get payment status', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
