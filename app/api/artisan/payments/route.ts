import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/artisan/payments')

/**
 * GET - List payment history for the current artisan
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 * - status: Filter by payment status (PENDING, COMPLETED, FAILED, REFUNDED)
 */
export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      return NextResponse.json({ error: 'Only artisans can access payment history' }, { status: 403 })
    }

    if (!user.profile?.subscription) {
      return NextResponse.json({
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
        summary: {
          totalPayments: 0,
          totalAmount: 0,
          completedPayments: 0,
          pendingPayments: 0,
          failedPayments: 0,
        },
      })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {
      subscriptionId: user.profile.subscription.id,
    }

    if (status && ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(status)) {
      where.status = status
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ])

    // Get summary stats
    const stats = await prisma.payment.groupBy({
      by: ['status'],
      where: { subscriptionId: user.profile.subscription.id },
      _count: true,
      _sum: { amount: true },
    })

    // Calculate summary
    type PaymentStat = { status: string; _count: number; _sum: { amount: number | null } }
    const summary = {
      totalPayments: total,
      totalAmount: stats.reduce((acc: number, s: PaymentStat) => acc + (s._sum.amount || 0), 0),
      completedPayments: stats.find((s: PaymentStat) => s.status === 'COMPLETED')?._count || 0,
      completedAmount: stats.find((s: PaymentStat) => s.status === 'COMPLETED')?._sum.amount || 0,
      pendingPayments: stats.find((s: PaymentStat) => s.status === 'PENDING')?._count || 0,
      failedPayments: stats.find((s: PaymentStat) => s.status === 'FAILED')?._count || 0,
    }

    // Transform payments for response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = payments.map((payment: any) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      description: payment.description,
      phoneNumber: payment.phoneNumber 
        ? payment.phoneNumber.substring(0, 6) + '****' + payment.phoneNumber.slice(-2)
        : null,
      mpesaReceiptNumber: payment.mpesaReceiptNumber,
      failureReason: payment.failureReason,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
    }))

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
      subscription: {
        id: user.profile.subscription.id,
        plan: user.profile.subscription.plan,
        status: user.profile.subscription.status,
        startDate: user.profile.subscription.startDate,
        endDate: user.profile.subscription.endDate,
      },
    })
  } catch (error) {
    logger.error('Failed to fetch payment history', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
