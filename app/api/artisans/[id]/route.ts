import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { cachedJsonResponse, CACHE_DURATIONS, STALE_DURATIONS } from '@/lib/cache'

const logger = createLogger('api/artisans/[id]')

/**
 * GET /api/artisans/[id] - Public artisan profile (no auth required)
 * Returns artisan profile data safe for public consumption.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: artisanUserId } = await params

    const artisan = await prisma.user.findUnique({
      where: {
        id: artisanUserId,
        role: 'ARTISAN',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            profession: true,
            profileImage: true,
            bio: true,
            city: true,
            county: true,
            country: true,
            experience: true,
            hourlyRate: true,
            isAvailable: true,
            artisanStatus: true,
            averageRating: true,
            totalReviews: true,
            website: true,
            specializations: {
              select: { name: true, skillLevel: true }
            },
            portfolioItems: {
              where: { isPublic: true },
              orderBy: { createdAt: 'desc' },
              take: 12,
              select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                imageUrls: true,
                category: true,
                tags: true,
                completedAt: true,
              }
            },
            subscription: {
              select: { status: true, endDate: true, plan: true }
            }
          }
        }
      }
    })

    if (!artisan || !artisan.profile) {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })
    }

    // Only show verified artisans publicly
    if (artisan.profile.artisanStatus !== 'VERIFIED') {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })
    }

    const hasActiveSubscription =
      artisan.profile.subscription?.status === 'ACTIVE' &&
      artisan.profile.subscription?.endDate &&
      artisan.profile.subscription.endDate > new Date()

    const result = {
      id: artisan.id,
      name: `${artisan.firstName} ${artisan.lastName}`,
      profession: artisan.profile.profession,
      bio: artisan.profile.bio,
      profileImage: artisan.profile.profileImage,
      location: {
        city: artisan.profile.city,
        county: artisan.profile.county,
        country: artisan.profile.country,
      },
      experience: artisan.profile.experience,
      hourlyRate: artisan.profile.hourlyRate,
      isAvailable: artisan.profile.isAvailable,
      isVerified: true,
      isPremium: !!hasActiveSubscription,
      website: artisan.profile.website,
      rating: {
        average: artisan.profile.averageRating,
        total: artisan.profile.totalReviews,
      },
      specializations: artisan.profile.specializations,
      portfolio: artisan.profile.portfolioItems,
      memberSince: artisan.createdAt,
    }

    return cachedJsonResponse(result, {
      maxAge: CACHE_DURATIONS.SHORT,
      staleWhileRevalidate: STALE_DURATIONS.SHORT,
      isPublic: true,
    })
  } catch (error) {
    logger.error('Failed to fetch public artisan profile', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
