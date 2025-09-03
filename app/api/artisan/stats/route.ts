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

    // Get current user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: {
          include: {
            subscription: true,
            portfolioItems: true,
            reviews: {
              where: { isApproved: true },
              include: {
                client: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 5
            }
          }
        }
      }
    })

    if (!user || user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get message count
    const messageCount = await prisma.message.count({
      where: {
        receiverId: user.id,
        status: { not: 'READ' }
      }
    })

    // Calculate stats
    const stats = {
      profileViews: Math.floor(Math.random() * 500) + 100, // Mock data for now
      totalProjects: user.profile?.portfolioItems.length || 0,
      totalReviews: user.profile?.totalReviews || 0,
      averageRating: user.profile?.averageRating || 0,
      unreadMessages: messageCount,
      subscriptionStatus: user.profile?.subscription?.status || 'INACTIVE',
      subscriptionEndDate: user.profile?.subscription?.endDate,
      isVerified: user.profile?.artisanStatus === 'VERIFIED',
      isAvailable: user.profile?.isAvailable || false
    }

    const recentActivity = [
      {
        id: 1,
        type: 'message',
        title: 'New message received',
        description: 'You have a new inquiry about your carpentry services',
        timestamp: new Date().toISOString(),
        icon: 'message'
      },
      {
        id: 2,
        type: 'review',
        title: 'New review received',
        description: user.profile?.reviews[0] ? 
          `${user.profile.reviews[0].client.firstName} left you a ${user.profile.reviews[0].rating}-star review` :
          'Check your latest reviews',
        timestamp: user.profile?.reviews[0]?.createdAt.toISOString() || new Date().toISOString(),
        icon: 'star'
      },
      {
        id: 3,
        type: 'portfolio',
        title: 'Portfolio view',
        description: 'Your portfolio was viewed 15 times today',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        icon: 'eye'
      }
    ]

    return NextResponse.json({
      stats,
      recentActivity,
      profile: user.profile,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Error fetching artisan stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
