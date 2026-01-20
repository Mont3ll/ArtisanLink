import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

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
            portfolioItems: {
              orderBy: { createdAt: 'desc' },
              take: 5
            },
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
            },
            specializations: true
          }
        },
        artisanConversations: {
          orderBy: { lastMessageAt: 'desc' },
          take: 5,
          include: {
            client: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    if (!user || user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get unread message count
    const unreadMessageCount = await prisma.message.count({
      where: {
        receiverId: user.id,
        status: { not: 'READ' }
      }
    })

    // Get total conversation count
    const totalConversations = await prisma.conversation.count({
      where: {
        artisanId: user.id
      }
    })

    // Get new conversations this month
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const newConversationsThisMonth = await prisma.conversation.count({
      where: {
        artisanId: user.id,
        createdAt: { gte: currentMonthStart }
      }
    })

    // Calculate stats
    const stats = {
      totalProjects: user.profile?.portfolioItems.length || 0,
      totalReviews: user.profile?.totalReviews || 0,
      averageRating: user.profile?.averageRating || 0,
      unreadMessages: unreadMessageCount,
      totalConversations,
      newConversationsThisMonth,
      subscriptionStatus: user.profile?.subscription?.status || 'INACTIVE',
      subscriptionEndDate: user.profile?.subscription?.endDate,
      isVerified: user.profile?.artisanStatus === 'VERIFIED',
      isAvailable: user.profile?.isAvailable || false,
      totalSpecializations: user.profile?.specializations.length || 0
    }

    // Build real recent activity from actual data
    const recentActivity: Array<{
      id: string
      type: 'message' | 'review' | 'portfolio' | 'conversation'
      title: string
      description: string
      timestamp: string
      icon: string
    }> = []

    // Add recent reviews to activity
    if (user.profile?.reviews) {
      for (const review of user.profile.reviews) {
        recentActivity.push({
          id: `review-${review.id}`,
          type: 'review',
          title: 'New review received',
          description: `${review.client.firstName} ${review.client.lastName} left you a ${review.rating}-star review`,
          timestamp: review.createdAt.toISOString(),
          icon: 'star'
        })
      }
    }

    // Add recent conversations/messages to activity
    for (const conversation of user.artisanConversations) {
      const lastMessage = conversation.messages[0]
      if (lastMessage) {
        recentActivity.push({
          id: `message-${lastMessage.id}`,
          type: 'message',
          title: 'Message from client',
          description: `${conversation.client.firstName} ${conversation.client.lastName}: ${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}`,
          timestamp: lastMessage.createdAt.toISOString(),
          icon: 'message'
        })
      } else {
        recentActivity.push({
          id: `conversation-${conversation.id}`,
          type: 'conversation',
          title: 'New conversation started',
          description: `${conversation.client.firstName} ${conversation.client.lastName} started a conversation`,
          timestamp: conversation.createdAt.toISOString(),
          icon: 'message'
        })
      }
    }

    // Add recent portfolio items to activity
    if (user.profile?.portfolioItems) {
      for (const item of user.profile.portfolioItems) {
        recentActivity.push({
          id: `portfolio-${item.id}`,
          type: 'portfolio',
          title: 'Portfolio item added',
          description: `Added "${item.title}" to your portfolio`,
          timestamp: item.createdAt.toISOString(),
          icon: 'briefcase'
        })
      }
    }

    // Sort by timestamp and take top 10
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const topActivity = recentActivity.slice(0, 10)

    return NextResponse.json({
      stats,
      recentActivity: topActivity,
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
  }
}
