import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Parse a time range string into a Date representing the start of that range.
 * Supported values: '7d', '30d', '90d', '1y'. Defaults to '30d'.
 */
function getRangeStartDate(range: string | null): Date {
  const now = new Date()
  switch (range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    case '30d':
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse time range from query params
    const range = request.nextUrl.searchParams.get('range')
    const rangeStart = getRangeStartDate(range)

    // Get current user with time-range-filtered related data
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: {
          include: {
            subscription: true,
            portfolioItems: {
              where: { createdAt: { gte: rangeStart } },
              orderBy: { createdAt: 'desc' },
              take: 5
            },
            reviews: {
              where: {
                isApproved: true,
                createdAt: { gte: rangeStart }
              },
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
          where: { createdAt: { gte: rangeStart } },
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

    // Get unread message count (within range)
    const unreadMessageCount = await prisma.message.count({
      where: {
        receiverId: user.id,
        status: { not: 'READ' },
        createdAt: { gte: rangeStart }
      }
    })

    // Get total conversation count (within range)
    const totalConversations = await prisma.conversation.count({
      where: {
        artisanId: user.id,
        createdAt: { gte: rangeStart }
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

    // Get total reviews and portfolio items within range for stat cards
    const [rangeReviewCount, rangePortfolioCount] = await Promise.all([
      prisma.review.count({
        where: {
          profileId: user.profile?.id,
          isApproved: true,
          createdAt: { gte: rangeStart }
        }
      }),
      prisma.portfolioItem.count({
        where: {
          profileId: user.profile?.id,
          createdAt: { gte: rangeStart }
        }
      })
    ])

    // Calculate stats (range-filtered where appropriate)
    const stats = {
      totalProjects: rangePortfolioCount,
      totalReviews: rangeReviewCount,
      averageRating: user.profile?.averageRating || 0, // All-time (rating doesn't change per range)
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
