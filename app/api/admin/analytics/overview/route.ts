import { NextResponse } from 'next/server'
import { cachedJsonResponse, CACHE_DURATIONS, STALE_DURATIONS } from '@/lib/cache'
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

    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const userGrowth = await prisma.user.groupBy({
      by: ['role'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      }
    })

    // Get portfolio statistics (last 30 days)
    const portfolioStats = await prisma.portfolioItem.aggregate({
      _count: { id: true },
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Build real monthly revenue data from PlatformEarning records (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const earnings = await prisma.platformEarning.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo }
      },
      select: {
        commissionAmount: true,
        createdAt: true
      }
    })

    // Group earnings by month
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyMap = new Map<string, number>()

    // Pre-populate the last 6 months with 0 so we always show them
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      monthlyMap.set(key, 0)
    }

    for (const earning of earnings) {
      const d = new Date(earning.createdAt)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + earning.commissionAmount)
    }

    const revenueData = Array.from(monthlyMap.entries()).map(([key, revenue]) => {
      const [, monthIdx] = key.split('-')
      return {
        month: monthNames[parseInt(monthIdx, 10)],
        revenue: Math.round(revenue * 100) / 100
      }
    })

    // Get real job statistics for completion rate and average value
    const [totalJobs, completedJobs, jobValueAgg] = await Promise.all([
      prisma.job.count({
        where: {
          status: { notIn: ['REQUESTED', 'CANCELLED', 'DECLINED'] }
        }
      }),
      prisma.job.count({
        where: {
          status: { in: ['COMPLETED', 'PAID'] }
        }
      }),
      prisma.job.aggregate({
        _avg: { agreedPrice: true },
        where: {
          agreedPrice: { not: null }
        }
      })
    ])

    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0
    const averageBudget = jobValueAgg._avg.agreedPrice || 0

    // Get platform metrics
    const totalUsers = await prisma.user.count()
    const totalPortfolioItems = await prisma.portfolioItem.count()
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' }
    })

    return cachedJsonResponse({
      userGrowth: userGrowth.map((item: { role: string; _count: { id: number } }) => ({
        role: item.role,
        count: item._count.id
      })),
      projectStats: {
        total: portfolioStats._count.id,
        averageBudget: Math.round(averageBudget * 100) / 100
      },
      revenueData,
      metrics: {
        totalUsers,
        totalProjects: totalPortfolioItems,
        activeProjects: activeSubscriptions,
        completionRate: Math.round(completionRate * 10) / 10
      }
    }, { maxAge: CACHE_DURATIONS.SHORT, staleWhileRevalidate: STALE_DURATIONS.SHORT })
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
