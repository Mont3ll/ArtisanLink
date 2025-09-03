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
          take: 5
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
          take: 5
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

    const stats = {
      activeProjects: user.clientConversations.length,
      completedProjects: user.reviews.length,
      savedArtisans: 0, // Mock for now
      unreadMessages,
      totalSpent: user.reviews.reduce((sum, review) => sum + (review.projectCost || 0), 0)
    }

    const recentActivity = [
      {
        id: 1,
        type: 'message',
        title: 'New message from artisan',
        description: user.clientConversations[0] ? 
          `${user.clientConversations[0].artisan.firstName} sent you a message` :
          'No recent messages',
        timestamp: user.clientConversations[0]?.lastMessageAt?.toISOString() || new Date().toISOString(),
        icon: 'message'
      },
      {
        id: 2,
        type: 'recommendation',
        title: 'New artisan recommendation',
        description: recommendedArtisans[0] ? 
          `Check out ${recommendedArtisans[0].firstName} - ${recommendedArtisans[0].profile?.profession}` :
          'Discover skilled artisans',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        icon: 'user'
      }
    ]

    return NextResponse.json({
      stats,
      recentActivity,
      recommendedArtisans: recommendedArtisans.map(artisan => ({
        id: artisan.id,
        name: `${artisan.firstName} ${artisan.lastName}`,
        profession: artisan.profile?.profession,
        location: artisan.profile?.city,
        rating: artisan.profile?.averageRating,
        totalReviews: artisan.profile?.totalReviews,
        hourlyRate: artisan.profile?.hourlyRate,
        featuredWork: artisan.profile?.portfolioItems[0]
      })),
      conversations: user.clientConversations,
      reviews: user.reviews
    })
  } catch (error) {
    console.error('Error fetching client stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
