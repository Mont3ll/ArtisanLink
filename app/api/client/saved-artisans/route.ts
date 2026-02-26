import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'

const logger = createLogger('api/client/saved-artisans')

// Validation schema for saving an artisan
const saveArtisanSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
})

// GET - List saved artisans for the current user
export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse query params for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const clampedPage = Math.max(1, page)
    const clampedLimit = Math.min(Math.max(1, limit), 50)
    const skip = (clampedPage - 1) * clampedLimit

    // Get saved artisans with artisan profile details
    const [savedArtisans, total] = await Promise.all([
      prisma.savedArtisan.findMany({
        where: { userId: user.id },
        include: {
          profile: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              specializations: {
                select: {
                  name: true,
                  skillLevel: true,
                },
                take: 5,
              },
              subscription: {
                select: {
                  status: true,
                  endDate: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: clampedLimit,
      }),
      prisma.savedArtisan.count({
        where: { userId: user.id },
      }),
    ])

    // Transform the data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = savedArtisans.map((saved: any) => ({
      id: saved.id,
      savedAt: saved.createdAt,
      artisan: {
        id: saved.profile.user.id,
        profileId: saved.profile.id,
        name: `${saved.profile.user.firstName} ${saved.profile.user.lastName}`,
        profession: saved.profile.profession,
        bio: saved.profile.bio,
        profileImage: saved.profile.profileImage,
        location: {
          city: saved.profile.city,
          county: saved.profile.county,
        },
        experience: saved.profile.experience,
        hourlyRate: saved.profile.hourlyRate,
        isAvailable: saved.profile.isAvailable,
        isVerified: saved.profile.artisanStatus === 'VERIFIED',
        isPremium: saved.profile.subscription?.status === 'ACTIVE' && new Date(saved.profile.subscription?.endDate) > new Date(),
        rating: {
          average: saved.profile.averageRating,
          total: saved.profile.totalReviews,
        },
        specializations: saved.profile.specializations,
      },
    }))

    return NextResponse.json({
      items,
      pagination: {
        page: clampedPage,
        limit: clampedLimit,
        total,
        totalPages: Math.ceil(total / clampedLimit),
      },
    })
  } catch (error) {
    logger.error('Failed to fetch saved artisans', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Save an artisan
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = saveArtisanSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { profileId } = validation.data

    // Check if profile exists and is an artisan
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: { role: true },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.user.role !== 'ARTISAN') {
      return NextResponse.json(
        { error: 'Can only save artisan profiles' },
        { status: 400 }
      )
    }

    // Check if already saved
    const existing = await prisma.savedArtisan.findUnique({
      where: {
        userId_profileId: {
          userId: user.id,
          profileId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Artisan already saved' },
        { status: 409 }
      )
    }

    // Create saved artisan
    const savedArtisan = await prisma.savedArtisan.create({
      data: {
        userId: user.id,
        profileId,
      },
    })

    return NextResponse.json(
      {
        message: 'Artisan saved successfully',
        id: savedArtisan.id,
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Failed to save artisan', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a saved artisan by profileId (bulk unsave support)
export async function DELETE(request: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get profileId from query params
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      )
    }

    // Delete the saved artisan
    const deleted = await prisma.savedArtisan.deleteMany({
      where: {
        userId: user.id,
        profileId,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Saved artisan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Artisan unsaved successfully' })
  } catch (error) {
    logger.error('Failed to unsave artisan', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
