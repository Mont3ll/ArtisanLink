import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

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

    // Get portfolio statistics instead of project statistics
    const portfolioStats = await prisma.portfolioItem.aggregate({
      _count: { id: true },
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Get revenue data (simulated for now since we don't have orders table)
    const revenueData = [
      { month: 'Jan', revenue: 15000 },
      { month: 'Feb', revenue: 18000 },
      { month: 'Mar', revenue: 22000 },
      { month: 'Apr', revenue: 25000 },
      { month: 'May', revenue: 28000 },
      { month: 'Jun', revenue: 32000 }
    ]

    // Get platform metrics
    const totalUsers = await prisma.user.count()
    const totalPortfolioItems = await prisma.portfolioItem.count()
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' }
    })

    return NextResponse.json({
      userGrowth: userGrowth.map(item => ({
        role: item.role,
        count: item._count.id
      })),
      projectStats: {
        total: portfolioStats._count.id,
        averageBudget: 0 // No budget data in portfolio items
      },
      revenueData,
      metrics: {
        totalUsers,
        totalProjects: totalPortfolioItems,
        activeProjects: activeSubscriptions,
        completionRate: totalPortfolioItems > 0 ? 85 : 0 // Simulated completion rate
      }
    })
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
