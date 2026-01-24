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
        profile: true,
        clientConversations: {
          include: {
            artisan: {
              select: {
                firstName: true,
                lastName: true,
                profile: {
                  select: {
                    profession: true,
                    averageRating: true,
                    city: true
                  }
                }
              }
            },
            messages: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          },
          orderBy: {
            lastMessageAt: 'desc'
          },
          take: 10
        },
        reviews: {
          include: {
            profile: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get recommended artisans
    const recommendedArtisans = await prisma.user.findMany({
      where: {
        role: 'ARTISAN',
        profile: {
          artisanStatus: 'VERIFIED',
          isAvailable: true
        }
      },
      include: {
        profile: {
          include: {
            portfolioItems: {
              where: {
                isFeatured: true
              },
              take: 1
            }
          }
        }
      },
      orderBy: {
        profile: {
          averageRating: 'desc'
        }
      },
      take: 6
    })

    // Get unread message count
    const unreadMessages = await prisma.message.count({
      where: {
        receiverId: user.id,
        status: { not: 'READ' }
      }
    })

    // Get total conversation count
    const totalConversations = await prisma.conversation.count({
      where: {
        clientId: user.id
      }
    })

    // Get saved artisans count
    const savedArtisansCount = await prisma.savedArtisan.count({
      where: {
        userId: user.id
      }
    })

    const stats = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      activeConversations: user.clientConversations.filter((c: any) => c.status === 'ACTIVE').length,
      totalConversations,
      reviewsGiven: user.reviews.length,
      unreadMessages,
      savedArtisans: savedArtisansCount,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalSpent: user.reviews.reduce((sum: number, review: any) => sum + (review.projectCost || 0), 0)
    }

    // Build real recent activity from actual data
    const recentActivity: Array<{
      id: string
      type: 'message' | 'review' | 'conversation'
      title: string
      description: string
      timestamp: string
      icon: string
    }> = []

    // Add recent conversations/messages to activity
    for (const conversation of user.clientConversations) {
      const lastMessage = conversation.messages[0]
      if (lastMessage) {
        recentActivity.push({
          id: `message-${lastMessage.id}`,
          type: 'message',
          title: 'Message from artisan',
          description: `${conversation.artisan.firstName} ${conversation.artisan.lastName}: ${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}`,
          timestamp: lastMessage.createdAt.toISOString(),
          icon: 'message'
        })
      } else {
        recentActivity.push({
          id: `conversation-${conversation.id}`,
          type: 'conversation',
          title: 'Conversation started',
          description: `You started a conversation with ${conversation.artisan.firstName} ${conversation.artisan.lastName}`,
          timestamp: conversation.createdAt.toISOString(),
          icon: 'message'
        })
      }
    }

    // Add reviews to activity
    for (const review of user.reviews) {
      recentActivity.push({
        id: `review-${review.id}`,
        type: 'review',
        title: 'Review submitted',
        description: `You left a ${review.rating}-star review for ${review.profile.user.firstName} ${review.profile.user.lastName}`,
        timestamp: review.createdAt.toISOString(),
        icon: 'star'
      })
    }

    // Sort by timestamp and take top 10
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const topActivity = recentActivity.slice(0, 10)

    return NextResponse.json({
      stats,
      recentActivity: topActivity,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recommendedArtisans: recommendedArtisans.map((artisan: any) => ({
        id: artisan.id,
        name: `${artisan.firstName} ${artisan.lastName}`,
        profession: artisan.profile?.profession,
        location: artisan.profile?.city,
        rating: artisan.profile?.averageRating,
        totalReviews: artisan.profile?.totalReviews,
        hourlyRate: artisan.profile?.hourlyRate,
        featuredWork: artisan.profile?.portfolioItems[0]
      })),
      conversations: user.clientConversations.slice(0, 5),
      reviews: user.reviews.slice(0, 5)
    })
  } catch (error) {
    console.error('Error fetching client stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
