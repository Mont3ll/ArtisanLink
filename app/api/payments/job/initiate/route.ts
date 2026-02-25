/**
 * Job Payment Initiation API
 * 
 * POST /api/payments/job/initiate - Initiate M-Pesa payment for job (deposit or final)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'
import {
  getMpesaConfig,
  validateMpesaConfig,
  isMpesaEnabled,
  initiateSTKPush,
  formatPhoneNumber,
  isValidKenyanPhone,
} from '@/lib/mpesa'
import { JobStatus } from '@/app/generated/prisma'

const logger = createLogger('api/payments/job/initiate')

// Validation schema
const initiateJobPaymentSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  paymentType: z.enum(['DEPOSIT', 'FINAL']),
  phoneNumber: z.string().min(9, 'Phone number is required'),
})

/**
 * POST - Initiate M-Pesa STK Push payment for a job
 */
export async function POST(request: NextRequest) {
  try {
    // Check if M-Pesa is enabled
    if (!isMpesaEnabled()) {
      return NextResponse.json(
        { error: 'M-Pesa payments are not enabled' },
        { status: 503 }
      )
    }

    // Validate M-Pesa configuration
    const mpesaConfig = getMpesaConfig()
    const configValidation = validateMpesaConfig(mpesaConfig)
    if (!configValidation.valid) {
      logger.error('Invalid M-Pesa configuration', { missing: configValidation.missing })
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 503 }
      )
    }

    // Authenticate user
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true, firstName: true, lastName: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Only clients can make job payments' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = initiateJobPaymentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { jobId, paymentType, phoneNumber } = validation.data

    // Validate phone number
    if (!isValidKenyanPhone(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid Kenyan phone number. Use format: 07XXXXXXXX or 254XXXXXXXXX' },
        { status: 400 }
      )
    }

    const formattedPhone = formatPhoneNumber(phoneNumber)

    // Get job with payments
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        artisan: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        payments: true,
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Verify the client owns this job
    if (job.clientId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Validate payment based on type
    let amount: number

    if (paymentType === 'DEPOSIT') {
      // Deposit payment - job must be in ACCEPTED status
      if (job.status !== 'ACCEPTED') {
        return NextResponse.json({
          error: 'Deposit can only be paid after accepting a quote',
        }, { status: 400 })
      }

      if (job.depositPaid) {
        return NextResponse.json({
          error: 'Deposit has already been paid',
        }, { status: 400 })
      }

      if (!job.depositAmount) {
        return NextResponse.json({
          error: 'Deposit amount not set. Please accept a quote first.',
        }, { status: 400 })
      }

      amount = Number(job.depositAmount)
    } else {
      // Final payment - job must be in COMPLETED status
      if (job.status !== 'COMPLETED') {
        return NextResponse.json({
          error: 'Final payment can only be made after job is completed',
        }, { status: 400 })
      }

      if (!job.depositPaid) {
        return NextResponse.json({
          error: 'Deposit must be paid before final payment',
        }, { status: 400 })
      }

      if (job.finalPaid) {
        return NextResponse.json({
          error: 'Final payment has already been made',
        }, { status: 400 })
      }

      if (!job.agreedPrice || !job.depositAmount) {
        return NextResponse.json({
          error: 'Job pricing not set properly',
        }, { status: 400 })
      }

      // Final amount = agreed price - deposit
      amount = Number(job.agreedPrice) - Number(job.depositAmount)
    }

    // Check for pending payments
    const pendingPayment = job.payments.find(
      (p: typeof job.payments[number]) => p.type === paymentType && p.status === 'PENDING'
    )
    if (pendingPayment) {
      return NextResponse.json({
        error: 'There is already a pending payment. Please wait or try again later.',
        pendingPaymentId: pendingPayment.id,
      }, { status: 409 })
    }

    // Create job payment record
    const jobPayment = await prisma.jobPayment.create({
      data: {
        jobId,
        amount,
        type: paymentType,
        status: 'PENDING',
        phoneNumber: formattedPhone,
      },
    })

    // Initiate STK Push
    try {
      const accountRef = paymentType === 'DEPOSIT' 
        ? `DEP-${jobId.substring(0, 8)}` 
        : `FIN-${jobId.substring(0, 8)}`
      
      const transactionDesc = paymentType === 'DEPOSIT'
        ? `Job Deposit: ${job.title.substring(0, 20)}`
        : `Job Payment: ${job.title.substring(0, 20)}`

      // Use job-specific callback URL
      const jobCallbackUrl = process.env.MPESA_JOB_CALLBACK_URL || 
        mpesaConfig.callbackUrl.replace('/mpesa/callback', '/job/callback')

      const stkResponse = await initiateSTKPush(mpesaConfig, {
        phoneNumber: formattedPhone,
        amount: Math.round(amount), // M-Pesa requires whole numbers
        accountReference: accountRef,
        transactionDesc,
        callbackUrl: jobCallbackUrl,
      })

      // Update job payment with M-Pesa request details
      await prisma.jobPayment.update({
        where: { id: jobPayment.id },
        data: {
          mpesaRequestId: stkResponse.MerchantRequestID,
          mpesaCheckoutId: stkResponse.CheckoutRequestID,
        },
      })

      logger.info('Job payment STK Push initiated', {
        userId: user.id,
        jobId,
        paymentId: jobPayment.id,
        paymentType,
        amount,
        checkoutRequestId: stkResponse.CheckoutRequestID,
      })

      return NextResponse.json({
        message: 'Payment initiated. Check your phone for the M-Pesa prompt.',
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID,
        paymentId: jobPayment.id,
        jobId,
        paymentType,
        amount,
        currency: 'KES',
      })
    } catch (stkError) {
      // Mark payment as failed if STK Push fails
      await prisma.jobPayment.update({
        where: { id: jobPayment.id },
        data: {
          status: 'FAILED',
          failureReason: stkError instanceof Error ? stkError.message : 'STK Push failed',
        },
      })

      logger.error('Job payment STK Push failed', {
        paymentId: jobPayment.id,
        error: stkError,
      })

      return NextResponse.json(
        { error: 'Failed to initiate payment. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error('Failed to initiate job payment', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET - Get payment status for a job
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('jobId')
    const paymentId = searchParams.get('paymentId')
    const checkoutRequestId = searchParams.get('checkoutRequestId')

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Query by checkout request ID (for polling status after STK push)
    if (checkoutRequestId) {
      const payment = await prisma.jobPayment.findFirst({
        where: { mpesaCheckoutId: checkoutRequestId },
        include: {
          job: {
            select: { 
              id: true, 
              status: true, 
              clientId: true, 
              artisanId: true 
            },
          },
        },
      })

      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      // Verify user has access
      if (payment.job.clientId !== user.id && payment.job.artisanId !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Map status - if still PENDING, keep as PENDING for polling
      // The callback will update to COMPLETED or FAILED
      return NextResponse.json({
        status: payment.status,
        payment: {
          id: payment.id,
          amount: payment.amount,
          type: payment.type,
          status: payment.status,
          mpesaReceiptNumber: payment.mpesaReceiptNumber,
          paidAt: payment.paidAt,
        },
        job: {
          id: payment.job.id,
          status: payment.job.status,
        },
        error: payment.failureReason,
      })
    }

    if (!jobId && !paymentId) {
      return NextResponse.json({ error: 'Job ID, Payment ID, or Checkout Request ID required' }, { status: 400 })
    }

    if (paymentId) {
      // Get specific payment
      const payment = await prisma.jobPayment.findUnique({
        where: { id: paymentId },
        include: {
          job: {
            select: { clientId: true, artisanId: true },
          },
        },
      })

      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      // Verify user has access
      if (payment.job.clientId !== user.id && payment.job.artisanId !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      return NextResponse.json({
        payment: {
          id: payment.id,
          amount: payment.amount,
          type: payment.type,
          status: payment.status,
          mpesaReceiptNumber: payment.mpesaReceiptNumber,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        },
      })
    }

    // Get all payments for a job
    const job = await prisma.job.findUnique({
      where: { id: jobId! },
      select: { clientId: true, artisanId: true },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Verify user has access
    if (job.clientId !== user.id && job.artisanId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const payments = await prisma.jobPayment.findMany({
      where: { jobId: jobId! },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      payments: payments.map((p: typeof payments[number]) => ({
        id: p.id,
        amount: p.amount,
        type: p.type,
        status: p.status,
        mpesaReceiptNumber: p.mpesaReceiptNumber,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
    })
  } catch (error) {
    logger.error('Failed to get job payment status', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
