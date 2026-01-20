import { NextResponse } from 'next/server'
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
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanType,
} from '@/lib/mpesa'

const logger = createLogger('api/payments/mpesa/initiate')

// Validation schema for initiating payment
const initiatePaymentSchema = z.object({
  phoneNumber: z.string().min(9, 'Phone number is required'),
  plan: z.enum(['MONTHLY', 'ANNUAL']),
})

/**
 * POST - Initiate M-Pesa STK Push payment for subscription
 * 
 * This endpoint:
 * 1. Validates the artisan user
 * 2. Creates or updates a subscription record
 * 3. Creates a payment record
 * 4. Initiates STK Push to the user's phone
 * 5. Returns the checkout request ID for status tracking
 */
export async function POST(request: Request) {
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

    // Get user and profile from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        profile: {
          include: {
            subscription: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only artisans can subscribe
    if (user.role !== 'ARTISAN') {
      return NextResponse.json(
        { error: 'Only artisans can subscribe' },
        { status: 403 }
      )
    }

    if (!user.profile) {
      return NextResponse.json(
        { error: 'Artisan profile not found. Please complete your profile first.' },
        { status: 400 }
      )
    }

    // Check if there's already an active subscription
    if (user.profile.subscription?.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 409 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = initiatePaymentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { phoneNumber, plan } = validation.data

    // Validate phone number
    if (!isValidKenyanPhone(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid Kenyan phone number. Use format: 07XXXXXXXX or 254XXXXXXXXX' },
        { status: 400 }
      )
    }

    const formattedPhone = formatPhoneNumber(phoneNumber)

    // Get plan details
    const planDetails = SUBSCRIPTION_PLANS[plan as SubscriptionPlanType]
    const amount = planDetails.price

    // Calculate subscription dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + planDetails.durationDays)

    // Create or update subscription in a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // Create or update subscription
      let subscription = user.profile!.subscription

      if (subscription) {
        // Update existing subscription
        subscription = await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            plan,
            status: 'INACTIVE', // Will be activated on successful payment
            startDate,
            endDate,
            amount,
          },
        })
      } else {
        // Create new subscription
        subscription = await tx.subscription.create({
          data: {
            profileId: user.profile!.id,
            plan,
            status: 'INACTIVE',
            startDate,
            endDate,
            amount,
          },
        })
      }

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount,
          currency: 'KES',
          method: 'MPESA',
          status: 'PENDING',
          phoneNumber: formattedPhone,
          description: `${planDetails.name} subscription`,
        },
      })

      return { subscription, payment }
    })

    // Initiate STK Push
    try {
      const stkResponse = await initiateSTKPush(mpesaConfig, {
        phoneNumber: formattedPhone,
        amount,
        accountReference: `SUB-${result.subscription.id.substring(0, 8)}`,
        transactionDesc: `ArtisanLink ${plan}`,
      })

      // Update payment with M-Pesa request details
      await prisma.payment.update({
        where: { id: result.payment.id },
        data: {
          mpesaRequestId: stkResponse.MerchantRequestID,
          mpesaCheckoutId: stkResponse.CheckoutRequestID,
        },
      })

      // Update subscription with M-Pesa request details
      await prisma.subscription.update({
        where: { id: result.subscription.id },
        data: {
          mpesaRequestId: stkResponse.MerchantRequestID,
          mpesaCheckoutId: stkResponse.CheckoutRequestID,
        },
      })

      logger.info('STK Push initiated successfully', {
        userId: user.id,
        subscriptionId: result.subscription.id,
        paymentId: result.payment.id,
        checkoutRequestId: stkResponse.CheckoutRequestID,
      })

      return NextResponse.json({
        message: 'Payment initiated. Check your phone for the M-Pesa prompt.',
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID,
        paymentId: result.payment.id,
        subscriptionId: result.subscription.id,
        plan,
        amount,
        currency: 'KES',
      })
    } catch (stkError) {
      // Mark payment as failed if STK Push fails
      await prisma.payment.update({
        where: { id: result.payment.id },
        data: {
          status: 'FAILED',
          failureReason: stkError instanceof Error ? stkError.message : 'STK Push failed',
        },
      })

      logger.error('STK Push failed', { 
        paymentId: result.payment.id, 
        error: stkError 
      })

      return NextResponse.json(
        { error: 'Failed to initiate payment. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error('Failed to initiate M-Pesa payment', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
