/**
 * Admin Platform Earnings API
 * 
 * GET /api/admin/earnings - Get platform earnings statistics
 * 
 * Admin only endpoint for viewing platform commission earnings.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/admin/earnings')

/**
 * GET - Get platform earnings with statistics
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const artisanId = searchParams.get('artisanId')

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
    }

    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
    }

    if (artisanId) {
      where.artisanId = artisanId
    }

    // Get earnings with pagination
    const [earnings, total] = await Promise.all([
      prisma.platformEarning.findMany({
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
              artisan: {
                select: {
                  firstName: true,
                  lastName: true,
                  profile: {
                    select: { profession: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.platformEarning.count({ where }),
    ])

    // Get summary statistics
    const [totalEarnings, promotionalEarnings, standardEarnings] = await Promise.all([
      prisma.platformEarning.aggregate({
        where,
        _sum: { commissionAmount: true, jobValue: true },
        _count: true,
      }),
      prisma.platformEarning.aggregate({
        where: { ...where, isPromotional: true },
        _sum: { commissionAmount: true },
        _count: true,
      }),
      prisma.platformEarning.aggregate({
        where: { ...where, isPromotional: false },
        _sum: { commissionAmount: true },
        _count: true,
      }),
    ])

    // Get monthly breakdown
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentEarnings = await prisma.platformEarning.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        commissionAmount: true,
        isPromotional: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group by day
    const dailyEarnings: Record<string, { total: number; promotional: number; standard: number }> = {}
    recentEarnings.forEach((earning: { createdAt: Date; commissionAmount: number; isPromotional: boolean }) => {
      const day = earning.createdAt.toISOString().split('T')[0]
      if (!dailyEarnings[day]) {
        dailyEarnings[day] = { total: 0, promotional: 0, standard: 0 }
      }
      dailyEarnings[day].total += earning.commissionAmount
      if (earning.isPromotional) {
        dailyEarnings[day].promotional += earning.commissionAmount
      } else {
        dailyEarnings[day].standard += earning.commissionAmount
      }
    })

    const statistics = {
      total: {
        commissionAmount: totalEarnings._sum.commissionAmount || 0,
        jobValue: totalEarnings._sum.jobValue || 0,
        count: totalEarnings._count,
        effectiveRate: totalEarnings._sum.jobValue
          ? ((totalEarnings._sum.commissionAmount || 0) / totalEarnings._sum.jobValue) * 100
          : 0,
      },
      promotional: {
        commissionAmount: promotionalEarnings._sum.commissionAmount || 0,
        count: promotionalEarnings._count,
      },
      standard: {
        commissionAmount: standardEarnings._sum.commissionAmount || 0,
        count: standardEarnings._count,
      },
      daily: dailyEarnings,
    }

    return NextResponse.json({
      earnings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics,
    })
  } catch (error) {
    logger.error('Failed to get earnings', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
