import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating review
const createReviewSchema = z.object({
  profileId: z.string().cuid(), // Artisan's profile ID
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  projectTitle: z.string().max(200).optional(),
  projectCost: z.number().positive().optional()
})

// GET - List reviews (admin or user's own reviews)
export async function GET(request: Request) {
  try {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const status = searchParams.get('status') // 'pending', 'approved', 'all'

    const clampedPage = Math.max(1, page)
    const clampedLimit = Math.min(Math.max(1, limit), 50)
    const skip = (clampedPage - 1) * clampedLimit

    // Build where clause
    const where: Record<string, unknown> = {}

    // Admin can see all reviews
    if (user.role === 'ADMIN') {
      if (status === 'pending') {
        where.isApproved = false
      } else if (status === 'approved') {
        where.isApproved = true
      }
      // 'all' or no status = no filter
    } else {
      // Non-admin can only see their own reviews
      where.clientId = user.id
    }

    // Get reviews
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: clampedLimit
      }),
      prisma.review.count({ where })
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page: clampedPage,
        limit: clampedLimit,
        total,
        totalPages: Math.ceil(total / clampedLimit)
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new review (client only)
export async function POST(request: Request) {
  try {
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

    // Only clients can leave reviews
    if (user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Only clients can leave reviews' },
        { status: 403 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = createReviewSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify profile exists and belongs to an artisan
    const profile = await prisma.profile.findUnique({
      where: { id: data.profileId },
      include: { user: true }
    })

    if (!profile || profile.user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })
    }

    // Check if user already reviewed this artisan
    const existingReview = await prisma.review.findUnique({
      where: {
        profileId_clientId: {
          profileId: data.profileId,
          clientId: user.id
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this artisan' },
        { status: 409 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        profileId: data.profileId,
        clientId: user.id,
        rating: data.rating,
        comment: data.comment,
        projectTitle: data.projectTitle,
        projectCost: data.projectCost,
        isApproved: false // Requires admin approval
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

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
