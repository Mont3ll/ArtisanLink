import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function GET() {
  console.log('Admin stats API called')
  try {
    const { userId } = await auth()
    console.log('Clerk userId:', userId)
    
    if (!userId) {
      console.log('No userId from auth')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })
    console.log('User found:', user)

    if (!user || user.role !== 'ADMIN') {
      console.log('User not admin:', { user: user?.role })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Starting database queries...')
    // Get statistics
    const [
      totalUsers,
      totalArtisans,
      activeArtisans,
      pendingVerifications,
      activeSubscriptions,
      monthlyRevenue,
      totalReviews
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
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      }),
      prisma.review.count({ where: { isApproved: true } })
    ])

    console.log('Database queries completed:', {
      totalUsers,
      totalArtisans,
      activeArtisans,
      pendingVerifications,
      activeSubscriptions,
      monthlyRevenue: monthlyRevenue._sum.amount,
      totalReviews
    })

    // Calculate growth percentage (mock for now)
    const monthlyGrowth = 12.5

    const stats = {
      totalUsers,
      totalArtisans,
      activeArtisans,
      pendingVerifications,
      activeSubscriptions,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      monthlyGrowth,
      systemUptime: 99.9,
      totalReviews
    }

    console.log('Returning stats:', stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
