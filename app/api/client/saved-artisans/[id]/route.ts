import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/client/saved-artisans/[id]')

// GET - Get a specific saved artisan
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the saved artisan
    const savedArtisan = await prisma.savedArtisan.findFirst({
      where: {
        id,
        userId: user.id,
      },
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
            },
          },
        },
      },
    })

    if (!savedArtisan) {
      return NextResponse.json(
        { error: 'Saved artisan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: savedArtisan.id,
      savedAt: savedArtisan.createdAt,
      artisan: {
        id: savedArtisan.profile.user.id,
        profileId: savedArtisan.profile.id,
        name: `${savedArtisan.profile.user.firstName} ${savedArtisan.profile.user.lastName}`,
        profession: savedArtisan.profile.profession,
        bio: savedArtisan.profile.bio,
        profileImage: savedArtisan.profile.profileImage,
        location: {
          city: savedArtisan.profile.city,
          county: savedArtisan.profile.county,
        },
        experience: savedArtisan.profile.experience,
        hourlyRate: savedArtisan.profile.hourlyRate,
        isAvailable: savedArtisan.profile.isAvailable,
        isVerified: savedArtisan.profile.artisanStatus === 'VERIFIED',
        rating: {
          average: savedArtisan.profile.averageRating,
          total: savedArtisan.profile.totalReviews,
        },
        specializations: savedArtisan.profile.specializations,
      },
    })
  } catch (error) {
    logger.error('Failed to fetch saved artisan', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a saved artisan by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if saved artisan exists and belongs to user
    const savedArtisan = await prisma.savedArtisan.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!savedArtisan) {
      return NextResponse.json(
        { error: 'Saved artisan not found' },
        { status: 404 }
      )
    }

    // Delete the saved artisan
    await prisma.savedArtisan.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Artisan unsaved successfully' })
  } catch (error) {
    logger.error('Failed to unsave artisan', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
