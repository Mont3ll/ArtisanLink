import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate date ranges for month-over-month comparison
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0) // Last day of previous month

    // Get statistics
    const [
      totalUsers,
      totalArtisans,
      activeArtisans,
      pendingVerifications,
      activeSubscriptions,
      monthlyRevenue,
      totalReviews,
      usersThisMonth,
      usersLastMonth,
      revenueLastMonth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ARTISAN' } }),
      prisma.user.count({ 
        where: { 
          role: 'ARTISAN',
          profile: {
            artisanStatus: 'VERIFIED',
            isAvailable: true
          }
        }
      }),
      prisma.user.count({ 
        where: { 
          role: 'ARTISAN',
          profile: {
            artisanStatus: 'PENDING'
          }
        }
      }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.aggregate({
        where: { 
          status: 'ACTIVE',
          startDate: {
            gte: currentMonthStart
          }
        },
        _sum: { amount: true }
      }),
      prisma.review.count({ where: { isApproved: true } }),
      // Users created this month
      prisma.user.count({
        where: {
          createdAt: { gte: currentMonthStart }
        }
      }),
      // Users created last month
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      }),
      // Revenue from last month for comparison
      prisma.subscription.aggregate({
        where: { 
          status: 'ACTIVE',
          startDate: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        },
        _sum: { amount: true }
      })
    ])

    // Calculate real monthly growth percentage
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0
      }
      return Number((((current - previous) / previous) * 100).toFixed(1))
    }

    const userGrowth = calculateGrowth(usersThisMonth, usersLastMonth)
    const currentRevenue = monthlyRevenue._sum.amount || 0
    const previousRevenue = revenueLastMonth._sum.amount || 0
    const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue)

    const stats = {
      totalUsers,
      totalArtisans,
      activeArtisans,
      pendingVerifications,
      activeSubscriptions,
      monthlyRevenue: currentRevenue,
      // Real calculated growth metrics
      userGrowth,
      revenueGrowth,
      // Combined growth metric (average of user and revenue growth)
      monthlyGrowth: Number(((userGrowth + revenueGrowth) / 2).toFixed(1)),
      totalReviews,
      // Period info for context
      period: {
        currentMonth: currentMonthStart.toISOString(),
        usersThisMonth,
        usersLastMonth
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
