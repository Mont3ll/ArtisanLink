import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating review
const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional().nullable(),
  projectTitle: z.string().max(200).optional().nullable(),
  projectCost: z.number().positive().optional().nullable(),
  // Admin-only fields
  isApproved: z.boolean().optional(),
  isHidden: z.boolean().optional()
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET - Get single review
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get review
    const review = await prisma.review.findUnique({
      where: { id },
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
        },
        client: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update review
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get review
    const review = await prisma.review.findUnique({
      where: { id }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = updateReviewSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check permissions
    const isOwner = review.clientId === user.id
    const isAdmin = user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only admin can update approval/hidden status
    if (!isAdmin && (data.isApproved !== undefined || data.isHidden !== undefined)) {
      return NextResponse.json(
        { error: 'Only admin can update approval status' },
        { status: 403 }
      )
    }

    // If owner edits, reset approval status
    const needsReapproval = isOwner && !isAdmin && (
      data.rating !== undefined || 
      data.comment !== undefined
    )

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.comment !== undefined && { comment: data.comment }),
        ...(data.projectTitle !== undefined && { projectTitle: data.projectTitle }),
        ...(data.projectCost !== undefined && { projectCost: data.projectCost }),
        ...(data.isApproved !== undefined && isAdmin && { isApproved: data.isApproved }),
        ...(data.isHidden !== undefined && isAdmin && { isHidden: data.isHidden }),
        ...(needsReapproval && { isApproved: false })
      },
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
        },
        client: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Update artisan's average rating if approval status changed
    if (data.isApproved !== undefined && isAdmin) {
      await updateArtisanRating(review.profileId)
    }

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete review
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get review
    const review = await prisma.review.findUnique({
      where: { id }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check permissions - owner or admin
    if (review.clientId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const profileId = review.profileId

    // Delete review
    await prisma.review.delete({
      where: { id }
    })

    // Update artisan's average rating
    await updateArtisanRating(profileId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to update artisan's average rating
async function updateArtisanRating(profileId: string) {
  const aggregation = await prisma.review.aggregate({
    where: {
      profileId,
      isApproved: true,
      isHidden: false
    },
    _avg: { rating: true },
    _count: { id: true }
  })

  await prisma.profile.update({
    where: { id: profileId },
    data: {
      averageRating: aggregation._avg.rating || 0,
      totalReviews: aggregation._count.id
    }
  })
}
