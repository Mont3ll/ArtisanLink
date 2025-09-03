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

    // Get user statistics
    const [
      totalUsers,
      totalClients,
      totalArtisans,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      newUsersThisMonth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'ARTISAN' } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    // Calculate growth rate (mock calculation for now)
    const growthRate = 12.5

    const stats = {
      totalUsers,
      totalClients,
      totalArtisans,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      newUsersThisMonth,
      growthRate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
