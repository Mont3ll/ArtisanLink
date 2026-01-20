import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/artisan/payments/[id]')

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET - Get payment details/receipt
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user with profile and subscription
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

    if (user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Only artisans can access payment details' }, { status: 403 })
    }

    if (!user.profile?.subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Get payment
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            profile: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Verify ownership
    if (payment.subscription.profileId !== user.profile.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Generate receipt data
    const receipt = {
      receiptNumber: payment.mpesaReceiptNumber || `ART-${payment.id.substring(0, 8).toUpperCase()}`,
      paymentId: payment.id,
      transactionDate: payment.paidAt || payment.createdAt,
      
      // Customer details
      customer: {
        name: `${payment.subscription.profile.user.firstName} ${payment.subscription.profile.user.lastName}`,
        email: payment.subscription.profile.user.email,
        phone: payment.phoneNumber 
          ? payment.phoneNumber.substring(0, 6) + '****' + payment.phoneNumber.slice(-2)
          : null,
      },
      
      // Payment details
      payment: {
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        description: payment.description,
        mpesaReceiptNumber: payment.mpesaReceiptNumber,
        failureReason: payment.failureReason,
      },
      
      // Subscription details
      subscription: {
        id: payment.subscription.id,
        plan: payment.subscription.plan,
        status: payment.subscription.status,
        startDate: payment.subscription.startDate,
        endDate: payment.subscription.endDate,
      },
      
      // Company details
      company: {
        name: 'ArtisanLink Kenya',
        address: 'Nairobi, Kenya',
        email: 'support@artisanlink.ke',
        phone: '+254 700 000 000',
      },
      
      // Timestamps
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
    }

    return NextResponse.json(receipt)
  } catch (error) {
    logger.error('Failed to fetch payment details', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
