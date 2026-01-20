import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Get content for moderation (admin only)
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const type = searchParams.get('type') || 'all' // 'reviews', 'users', 'all'
    const status = searchParams.get('status') || 'pending' // 'pending', 'approved', 'hidden', 'all'

    const clampedPage = Math.max(1, page)
    const clampedLimit = Math.min(Math.max(1, limit), 50)
    const skip = (clampedPage - 1) * clampedLimit

    interface ModerationItem {
      id: string
      type: 'review' | 'user'
      status: string
      content: Record<string, unknown>
      createdAt: Date
      targetUser?: {
        id: string
        name: string
        email: string
        role: string
      }
    }

    const items: ModerationItem[] = []
    let totalCount = 0

    // Get reviews for moderation
    if (type === 'all' || type === 'reviews') {
      const reviewWhere: Record<string, unknown> = {}
      
      if (status === 'pending') {
        reviewWhere.isApproved = false
        reviewWhere.isHidden = false
      } else if (status === 'approved') {
        reviewWhere.isApproved = true
      } else if (status === 'hidden') {
        reviewWhere.isHidden = true
      }
      // 'all' = no filter

      const [reviews, reviewCount] = await Promise.all([
        prisma.review.findMany({
          where: reviewWhere,
          include: {
            profile: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true
                  }
                }
              }
            },
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'reviews' ? skip : 0,
          take: type === 'reviews' ? clampedLimit : 10
        }),
        prisma.review.count({ where: reviewWhere })
      ])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reviews.forEach((review: any) => {
        items.push({
          id: review.id,
          type: 'review',
          status: review.isHidden ? 'hidden' : review.isApproved ? 'approved' : 'pending',
          content: {
            rating: review.rating,
            comment: review.comment,
            projectTitle: review.projectTitle,
            projectCost: review.projectCost,
            artisan: {
              id: review.profile.user.id,
              name: `${review.profile.user.firstName} ${review.profile.user.lastName}`,
              profession: review.profile.profession
            }
          },
          createdAt: review.createdAt,
          targetUser: {
            id: review.client.id,
            name: `${review.client.firstName} ${review.client.lastName}`,
            email: review.client.email,
            role: review.client.role
          }
        })
      })

      if (type === 'reviews') {
        totalCount = reviewCount
      } else {
        totalCount += reviewCount
      }
    }

    // Get users for moderation (suspended/banned or pending verification)
    if (type === 'all' || type === 'users') {
      const userWhere: Record<string, unknown> = {}
      
      if (status === 'pending') {
        userWhere.status = 'PENDING'
      } else if (status === 'suspended') {
        userWhere.status = 'SUSPENDED'
      } else if (status === 'banned') {
        userWhere.status = 'BANNED'
      }
      // For 'all', we still want to filter to show only actionable users
      if (status === 'all') {
        userWhere.status = { in: ['PENDING', 'SUSPENDED'] }
      }

      const [users, userCount] = await Promise.all([
        prisma.user.findMany({
          where: userWhere,
          include: {
            profile: {
              select: {
                profession: true,
                artisanStatus: true,
                city: true,
                county: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'users' ? skip : 0,
          take: type === 'users' ? clampedLimit : 10
        }),
        prisma.user.count({ where: userWhere })
      ])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      users.forEach((u: any) => {
        items.push({
          id: u.id,
          type: 'user',
          status: u.status.toLowerCase(),
          content: {
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role,
            phone: u.phone,
            profile: u.profile
          },
          createdAt: u.createdAt,
          targetUser: {
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            role: u.role
          }
        })
      })

      if (type === 'users') {
        totalCount = userCount
      } else {
        totalCount += userCount
      }
    }

    // Sort combined items by date if showing all types
    if (type === 'all') {
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    // Get stats for dashboard
    const [pendingReviews, pendingUsers, suspendedUsers] = await Promise.all([
      prisma.review.count({ where: { isApproved: false, isHidden: false } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } })
    ])

    return NextResponse.json({
      items: type === 'all' ? items.slice(skip, skip + clampedLimit) : items,
      stats: {
        pendingReviews,
        pendingUsers,
        suspendedUsers,
        total: pendingReviews + pendingUsers + suspendedUsers
      },
      pagination: {
        page: clampedPage,
        limit: clampedLimit,
        total: type === 'all' ? items.length : totalCount,
        totalPages: Math.ceil((type === 'all' ? items.length : totalCount) / clampedLimit)
      }
    })
  } catch (error) {
    console.error('Error fetching moderation items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
