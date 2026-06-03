/**
 * Job Payment Initiation API
 *
 * POST /api/payments/job/initiate — Initiate M-Pesa STK Push for job deposit or final payment
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
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const logger = createLogger('api/payments/job/initiate')

const schema = z.object({
  jobId: z.string().min(1),
  paymentType: z.enum(['DEPOSIT', 'FINAL']),
  phoneNumber: z.string().min(9),
})

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request, 'payments/job/initiate', RATE_LIMITS.STRICT)
  if (!rateLimitResult.allowed) return rateLimitResult.response!

  if (!isMpesaEnabled()) {
    return NextResponse.json({ error: 'M-Pesa payments are not enabled', code: 'MPESA_DISABLED' }, { status: 503 })
  }

  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }
    const { jobId, paymentType, phoneNumber } = parsed.data

    // Get user
    const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true, role: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { quotes: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // Only client can pay
    if (job.clientId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Determine amount
    const agreedPrice = job.agreedPrice ?? job.quotes[0]?.amount ?? 0
    if (agreedPrice <= 0) return NextResponse.json({ error: 'No agreed price for this job' }, { status: 400 })

    const depositPct = job.depositPercent ?? 30
    const depositAmount = Math.round(agreedPrice * (depositPct / 100))
    const finalAmount = agreedPrice - depositAmount

    const amount = paymentType === 'DEPOSIT' ? depositAmount : finalAmount

    // Validate phone
    const formatted = formatPhoneNumber(phoneNumber)
    if (!isValidKenyanPhone(formatted)) {
      return NextResponse.json({ error: 'Invalid Kenyan phone number' }, { status: 400 })
    }

    // Validate M-Pesa config
    const config = getMpesaConfig()
    const configError = validateMpesaConfig(config)
    if (configError) return NextResponse.json({ error: configError }, { status: 500 })

    // Create payment record
    const payment = await prisma.jobPayment.create({
      data: {
        jobId,
        amount,
        type: paymentType === 'DEPOSIT' ? 'DEPOSIT' : 'FINAL',
        status: 'PENDING',
        phoneNumber: formatted,
      },
    })

    // Initiate STK Push
    const description = paymentType === 'DEPOSIT'
      ? `Job deposit ${depositPct}% for ${job.title}`
      : `Final payment for ${job.title}`

    const callbackUrl = process.env.MPESA_JOB_CALLBACK_URL ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/job/callback`

    const stkResponse = await initiateSTKPush(config, {
      phoneNumber: formatted,
      amount,
      accountReference: `JOB-${jobId.slice(0, 8).toUpperCase()}`,
      transactionDesc: description,
      callbackUrl,
    })

    // Update payment with checkout ID
    await prisma.jobPayment.update({
      where: { id: payment.id },
      data: { mpesaCheckoutId: stkResponse.CheckoutRequestID },
    })

    logger.info(`Job payment initiated: ${payment.id}`, { jobId, paymentType, amount })

    return NextResponse.json({
      message: 'Payment initiated. Check your phone for M-Pesa prompt.',
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID,
      responseCode: stkResponse.ResponseCode,
      responseDescription: stkResponse.ResponseDescription,
      customerMessage: stkResponse.CustomerMessage,
      payment: { id: payment.id, amount, type: payment.type, status: payment.status },
    })
  } catch (error) {
    logger.error('Job payment initiation failed:', error)
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
}
