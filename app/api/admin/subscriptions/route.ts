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

    // Get subscription stats
    const subscriptionStats = await prisma.subscription.groupBy({
      by: ['status', 'plan'],
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    })

    // Get recent subscriptions
    const recentSubscriptions = await prisma.subscription.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    // Calculate metrics
    type SubStat = { status: string; plan: string; _count: { id: number }; _sum: { amount: number | null } }
    const totalRevenue = subscriptionStats.reduce((sum: number, stat: SubStat) => sum + (stat._sum.amount || 0), 0)
    const activeSubscriptions = subscriptionStats
      .filter((stat: SubStat) => stat.status === 'ACTIVE')
      .reduce((sum: number, stat: SubStat) => sum + stat._count.id, 0)

    return NextResponse.json({
      stats: subscriptionStats.map((stat: SubStat) => ({
        status: stat.status,
        plan: stat.plan,
        count: stat._count.id,
        revenue: stat._sum.amount || 0
      })),
      recentSubscriptions,
      metrics: {
        totalRevenue,
        activeSubscriptions,
        totalSubscriptions: subscriptionStats.reduce((sum: number, stat: SubStat) => sum + stat._count.id, 0)
      }
    })
  } catch (error) {
    console.error('Error fetching subscription data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
