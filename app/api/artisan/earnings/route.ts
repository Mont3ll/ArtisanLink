/**
 * Artisan Earnings API
 * 
 * GET /api/artisan/earnings - Get artisan's earnings and payout history
 * 
 * Returns earnings statistics and payout history for the authenticated artisan.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/artisan/earnings')

/**
 * GET - Get artisan's earnings and payouts
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get artisan user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true, completedJobCount: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const status = searchParams.get('status')

    // Build where clause for payouts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { artisanId: user.id }

    if (status) {
      where.status = status
    }

    // Get payouts with pagination
    const [payouts, total] = await Promise.all([
      prisma.artisanPayout.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              agreedPrice: true,
              client: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      }),
      prisma.artisanPayout.count({ where }),
    ])

    // Get earnings statistics
    const [
      totalEarnings,
      pendingPayouts,
      completedPayouts,
      thisMonthEarnings,
    ] = await Promise.all([
      // Total completed earnings
      prisma.artisanPayout.aggregate({
        where: { artisanId: user.id, status: 'COMPLETED' },
        _sum: { netAmount: true },
        _count: true,
      }),
      // Pending payouts
      prisma.artisanPayout.aggregate({
        where: { artisanId: user.id, status: { in: ['PENDING', 'PROCESSING'] } },
        _sum: { netAmount: true },
        _count: true,
      }),
      // Recent completed payouts
      prisma.artisanPayout.findMany({
        where: { artisanId: user.id, status: 'COMPLETED' },
        take: 5,
        orderBy: { completedAt: 'desc' },
        select: {
          id: true,
          netAmount: true,
          type: true,
          completedAt: true,
          mpesaReceiptNumber: true,
          job: {
            select: { title: true },
          },
        },
      }),
      // This month's earnings
      prisma.artisanPayout.aggregate({
        where: {
          artisanId: user.id,
          status: 'COMPLETED',
          completedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { netAmount: true },
        _count: true,
      }),
    ])

    // Get commission info
    const isPromotionalEligible = (user.completedJobCount || 0) < 5
    const commissionRate = isPromotionalEligible ? 0.05 : 0.10
    const remainingPromotionalJobs = isPromotionalEligible
      ? 5 - (user.completedJobCount || 0)
      : 0

    const statistics = {
      totalEarnings: {
        amount: totalEarnings._sum.netAmount || 0,
        count: totalEarnings._count,
      },
      pendingPayouts: {
        amount: pendingPayouts._sum.netAmount || 0,
        count: pendingPayouts._count,
      },
      thisMonth: {
        amount: thisMonthEarnings._sum.netAmount || 0,
        count: thisMonthEarnings._count,
      },
      commission: {
        currentRate: commissionRate,
        isPromotional: isPromotionalEligible,
        remainingPromotionalJobs,
        completedJobCount: user.completedJobCount || 0,
      },
    }

    return NextResponse.json({
      payouts,
      recentPayouts: completedPayouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics,
    })
  } catch (error) {
    logger.error('Failed to get artisan earnings', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
