import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cachedJsonResponse, CACHE_DURATIONS, STALE_DURATIONS } from '@/lib/cache'

// GET - Get reviews for a specific artisan (public endpoint)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Parse query params for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const sortBy = searchParams.get('sortBy') || 'recent' // 'recent', 'highest', 'lowest'

    const clampedPage = Math.max(1, page)
    const clampedLimit = Math.min(Math.max(1, limit), 50)
    const skip = (clampedPage - 1) * clampedLimit

    // Check if artisan exists by either profile ID or user ID
    let profile = await prisma.profile.findUnique({
      where: { id },
      include: { user: true }
    })

    // If not found by profile ID, try to find by user ID
    if (!profile) {
      profile = await prisma.profile.findFirst({
        where: { userId: id },
        include: { user: true }
      })
    }

    if (!profile || profile.user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })
    }

    // Determine sort order
    let orderBy: Record<string, string>
    switch (sortBy) {
      case 'highest':
        orderBy = { rating: 'desc' }
        break
      case 'lowest':
        orderBy = { rating: 'asc' }
        break
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Get only approved and non-hidden reviews
    const where = {
      profileId: profile.id,
      isApproved: true,
      isHidden: false
    }

    // Get reviews and total count
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy,
        skip,
        take: clampedLimit
      }),
      prisma.review.count({ where })
    ])

    // Get rating breakdown
    const ratingBreakdown = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        profileId: profile.id,
        isApproved: true,
        isHidden: false
      },
      _count: {
        rating: true
      }
    })

    // Format rating breakdown (1-5 stars)
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingBreakdown.forEach((item: { rating: number; _count: { rating: number } }) => {
      breakdown[item.rating] = item._count.rating
    })

    // Return cached response for public reviews
    return cachedJsonResponse({
      artisan: {
        id: profile.user.id,
        profileId: profile.id,
        name: `${profile.user.firstName} ${profile.user.lastName}`,
        profession: profile.profession,
        averageRating: profile.averageRating,
        totalReviews: profile.totalReviews
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reviews: reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        projectTitle: review.projectTitle,
        projectCost: review.projectCost,
        createdAt: review.createdAt,
        client: {
          name: `${review.client.firstName} ${review.client.lastName.charAt(0)}.`
        }
      })),
      ratingBreakdown: breakdown,
      pagination: {
        page: clampedPage,
        limit: clampedLimit,
        total,
        totalPages: Math.ceil(total / clampedLimit)
      }
    }, {
      maxAge: CACHE_DURATIONS.MEDIUM, // 5 minutes
      staleWhileRevalidate: STALE_DURATIONS.SHORT, // 1 minute stale
      isPublic: true // Public reviews can be cached by CDNs
    })
  } catch (error) {
    console.error('Error fetching artisan reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
