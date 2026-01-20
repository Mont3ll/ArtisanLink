import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for moderation action
const moderationActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'hide', 'unhide', 'suspend', 'unsuspend', 'ban', 'unban', 'activate']),
  type: z.enum(['review', 'user']),
  reason: z.string().max(500).optional()
})

// POST - Perform moderation action (admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const admin = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Parse and validate body
    const body = await request.json()
    const validationResult = moderationActionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { action, type, reason } = validationResult.data

    // Handle review moderation
    if (type === 'review') {
      const review = await prisma.review.findUnique({
        where: { id },
        include: { profile: true }
      })

      if (!review) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 })
      }

      let updateData: Record<string, unknown> = {}

      switch (action) {
        case 'approve':
          updateData = { isApproved: true, isHidden: false }
          break
        case 'reject':
        case 'hide':
          updateData = { isHidden: true, isApproved: false }
          break
        case 'unhide':
          updateData = { isHidden: false }
          break
        default:
          return NextResponse.json(
            { error: `Invalid action '${action}' for review` },
            { status: 400 }
          )
      }

      const updatedReview = await prisma.review.update({
        where: { id },
        data: updateData
      })

      // Recalculate artisan's average rating if approving/hiding
      if (action === 'approve' || action === 'hide' || action === 'reject') {
        const stats = await prisma.review.aggregate({
          where: {
            profileId: review.profileId,
            isApproved: true,
            isHidden: false
          },
          _avg: { rating: true },
          _count: { rating: true }
        })

        await prisma.profile.update({
          where: { id: review.profileId },
          data: {
            averageRating: stats._avg.rating || 0,
            totalReviews: stats._count.rating
          }
        })
      }

      // Log the action
      await prisma.activityLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: `REVIEW_${action.toUpperCase()}`,
          targetType: 'REVIEW',
          targetId: id,
          description: reason || `Review ${action}d by admin`,
          metadata: { reviewId: id, profileId: review.profileId }
        }
      })

      return NextResponse.json({
        success: true,
        message: `Review ${action}d successfully`,
        review: updatedReview
      })
    }

    // Handle user moderation
    if (type === 'user') {
      const targetUser = await prisma.user.findUnique({
        where: { id }
      })

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Prevent modifying other admins
      if (targetUser.role === 'ADMIN' && targetUser.id !== admin.id) {
        return NextResponse.json(
          { error: 'Cannot moderate other admins' },
          { status: 403 }
        )
      }

      let newStatus: string

      switch (action) {
        case 'activate':
          newStatus = 'ACTIVE'
          break
        case 'suspend':
          newStatus = 'SUSPENDED'
          break
        case 'unsuspend':
          newStatus = 'ACTIVE'
          break
        case 'ban':
          newStatus = 'BANNED'
          break
        case 'unban':
          newStatus = 'ACTIVE'
          break
        default:
          return NextResponse.json(
            { error: `Invalid action '${action}' for user` },
            { status: 400 }
          )
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { status: newStatus as 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true
        }
      })

      // Log the action
      await prisma.activityLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: `USER_${action.toUpperCase()}`,
          targetType: 'USER',
          targetId: id,
          description: reason || `User ${action}d by admin`,
          metadata: { 
            userId: id, 
            previousStatus: targetUser.status,
            newStatus 
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: `User ${action}d successfully`,
        user: updatedUser
      })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error performing moderation action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get specific item for moderation detail view
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const admin = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'review'

    if (type === 'review') {
      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          profile: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      if (!review) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 })
      }

      // Get moderation history for this review
      const history = await prisma.activityLog.findMany({
        where: {
          targetType: 'REVIEW',
          targetId: id
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      return NextResponse.json({ review, history })
    }

    if (type === 'user') {
      const targetUser = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          reviews: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Get moderation history for this user
      const history = await prisma.activityLog.findMany({
        where: {
          targetType: 'USER',
          targetId: id
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      return NextResponse.json({ user: targetUser, history })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching moderation item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
