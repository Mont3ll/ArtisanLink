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

    // Get pending verifications
    const pendingArtisans = await prisma.user.findMany({
      where: {
        role: 'ARTISAN',
        profile: {
          artisanStatus: 'PENDING'
        }
      },
      include: {
        profile: true
      },
      take: 20,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get recent activity logs
    // const recentLogs = await prisma.activityLog.findMany({
    //   take: 20,
    //   orderBy: {
    //     createdAt: 'desc'
    //   }
    // })

    // Get recent reviews for review_submitted activity
    const recentReviews = await prisma.review.findMany({
      where: {
        isApproved: true
      },
      include: {
        client: true,
        profile: {
          include: {
            user: true
          }
        }
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get recent conversations for message_sent activity
    const recentMessages = await prisma.conversation.findMany({
      include: {
        client: true,
        artisan: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      take: 10,
      orderBy: {
        lastMessageAt: 'desc'
      }
    })

    // Get recent user activity (registrations, subscriptions, etc.)
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        profile: {
          include: {
            subscription: true
          }
        }
      },
      take: 20,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for the new table structure
    const pendingVerifications = pendingArtisans.map((artisan) => ({
      id: artisan.id,
      name: `${artisan.firstName} ${artisan.lastName}`,
      email: artisan.email,
      profession: artisan.profile?.profession || 'Not specified',
      location: artisan.profile?.city || 'Not specified',
      submittedAt: artisan.createdAt.toISOString(),
      certificateUrl: artisan.profile?.certificateUrl
    }))

    const recentActivity = [
      // User registrations
      ...recentUsers.map((user) => ({
        id: `user-${user.id}`,
        type: 'user_joined' as const,
        description: `${user.role === 'ARTISAN' ? 'New artisan' : 'New client'} registered`,
        user: `${user.firstName} ${user.lastName}`,
        timestamp: user.createdAt.toISOString(),
        status: 'completed' as const
      })),
      // Subscription payments
      ...recentUsers
        .filter(user => user.profile?.subscription?.status === 'ACTIVE')
        .map((user) => ({
          id: `sub-${user.id}`,
          type: 'subscription_paid' as const,
          description: 'Subscription payment received',
          user: `${user.firstName} ${user.lastName}`,
          timestamp: user.profile?.subscription?.createdAt?.toISOString() || user.createdAt.toISOString(),
          status: 'completed' as const
        })),
      // Recent reviews
      ...recentReviews.map((review) => ({
        id: `review-${review.id}`,
        type: 'review_submitted' as const,
        description: `${review.rating}-star review submitted for ${review.profile.user.firstName}`,
        user: `${review.client.firstName} ${review.client.lastName}`,
        timestamp: review.createdAt.toISOString(),
        status: 'completed' as const
      })),
      // Recent messages
      ...recentMessages
        .filter(conv => conv.messages.length > 0)
        .map((conversation) => ({
          id: `msg-${conversation.id}`,
          type: 'message_sent' as const,
          description: `New message in conversation`,
          user: `${conversation.client.firstName} ${conversation.client.lastName}`,
          timestamp: conversation.lastMessageAt?.toISOString() || new Date().toISOString(),
          status: 'completed' as const
        }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)

    // System alerts (you can customize this based on your needs)
    const systemAlerts = [
      {
        id: '1',
        title: 'Database Performance',
        type: 'info' as const,
        description: 'Database queries are running optimally',
        timestamp: new Date().toISOString(),
        resolved: true
      },
      {
        id: '2',
        title: 'Pending Verifications',
        type: pendingArtisans.length > 10 ? 'warning' as const : 'info' as const,
        description: `${pendingArtisans.length} artisan verifications pending`,
        timestamp: new Date().toISOString(),
        resolved: pendingArtisans.length <= 5
      }
    ]

    return NextResponse.json({
      pendingVerifications,
      recentActivity,
      systemAlerts
    })
  } catch (error) {
    console.error('Error fetching system tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
