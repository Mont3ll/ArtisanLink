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
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get user statistics
    const [
      totalUsers,
      totalClients,
      totalArtisans,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      newUsersThisMonth,
      newUsersLastMonth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'ARTISAN' } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({
        where: {
          createdAt: { gte: currentMonthStart }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      })
    ])

    // Calculate real growth rate
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0
      }
      return Number((((current - previous) / previous) * 100).toFixed(1))
    }

    const growthRate = calculateGrowth(newUsersThisMonth, newUsersLastMonth)

    const stats = {
      totalUsers,
      totalClients,
      totalArtisans,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      growthRate,
      // Breakdown percentages
      breakdown: {
        clientsPercent: totalUsers > 0 ? Number(((totalClients / totalUsers) * 100).toFixed(1)) : 0,
        artisansPercent: totalUsers > 0 ? Number(((totalArtisans / totalUsers) * 100).toFixed(1)) : 0,
        activePercent: totalUsers > 0 ? Number(((activeUsers / totalUsers) * 100).toFixed(1)) : 0
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
