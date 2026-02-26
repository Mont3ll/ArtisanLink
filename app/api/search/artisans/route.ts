import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { 
  cachedJsonResponse, 
  CACHE_DURATIONS, 
  STALE_DURATIONS,
} from '@/lib/cache'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const logger = createLogger('api/search/artisans')

// GET - Search artisans with filters (public endpoint)
export async function GET(request: Request) {
  // Apply rate limiting for search endpoint
  const rateLimitResult = rateLimit(request, 'search/artisans', RATE_LIMITS.SEARCH)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!
  }

  try {
    // Parse query params
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const clampedPage = Math.max(1, page)
    const clampedLimit = Math.min(Math.max(1, limit), 50)
    const skip = (clampedPage - 1) * clampedLimit

    // Search and filters
    const query = searchParams.get('q') || searchParams.get('query') // Search query
    const profession = searchParams.get('profession')
    const county = searchParams.get('county')
    const city = searchParams.get('city')
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const maxRate = parseFloat(searchParams.get('maxRate') || '0')
    const minRate = parseFloat(searchParams.get('minRate') || '0')
    const availableOnly = searchParams.get('available') === 'true'
    const verifiedOnly = searchParams.get('verified') === 'true'
    const specialization = searchParams.get('specialization')
    
    // Geospatial search
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const radius = parseFloat(searchParams.get('radius') || '50') // km
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'rating' // 'rating', 'reviews', 'rate', 'distance', 'recent'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    // Build where clause for profiles
    // Only show verified artisans in search results (subscription is optional boost, not a gate)
    const where: Record<string, unknown> = {
      user: {
        role: 'ARTISAN',
        status: 'ACTIVE'
      },
      artisanStatus: 'VERIFIED',
    }

    // Text search on profession, bio, name
    if (query) {
      where.OR = [
        { profession: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
        { user: { firstName: { contains: query, mode: 'insensitive' } } },
        { user: { lastName: { contains: query, mode: 'insensitive' } } }
      ]
    }

    // Profession filter
    if (profession) {
      where.profession = { contains: profession, mode: 'insensitive' }
    }

    // Location filters
    if (county) {
      where.county = { equals: county, mode: 'insensitive' }
    }
    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    // Rating filter
    if (minRating > 0) {
      where.averageRating = { gte: minRating }
    }

    // Hourly rate filter
    if (minRate > 0 || maxRate > 0) {
      where.hourlyRate = {}
      if (minRate > 0) {
        (where.hourlyRate as Record<string, unknown>).gte = minRate
      }
      if (maxRate > 0) {
        (where.hourlyRate as Record<string, unknown>).lte = maxRate
      }
    }

    // Availability filter
    if (availableOnly) {
      where.isAvailable = true
    }

    // Note: artisanStatus: 'VERIFIED' is already enforced in the base WHERE clause.
    // The verifiedOnly param is kept for backwards compatibility but has no additional effect.

    // Specialization filter
    if (specialization) {
      where.specializations = {
        some: {
          name: { contains: specialization, mode: 'insensitive' }
        }
      }
    }

    // Determine sort order
    let orderBy: Record<string, unknown>[]
    switch (sortBy) {
      case 'reviews':
        orderBy = [{ totalReviews: sortOrder }]
        break
      case 'rate':
        orderBy = [{ hourlyRate: sortOrder }]
        break
      case 'recent':
        orderBy = [{ createdAt: sortOrder }]
        break
      case 'rating':
      default:
        orderBy = [{ averageRating: sortOrder }, { totalReviews: 'desc' }]
    }

    // Get artisans
    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              createdAt: true
            }
          },
          specializations: {
            select: {
              name: true,
              skillLevel: true
            }
          },
          subscription: {
            select: {
              status: true,
              endDate: true,
              plan: true,
            }
          }
        },
        orderBy,
        skip,
        take: clampedLimit
      }),
      prisma.profile.count({ where })
    ])

    // Calculate distance if geospatial search
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let results = profiles.map((profile: any) => {
      // Determine if artisan has an active subscription (premium/boosted)
      const hasActiveSubscription = profile.subscription?.status === 'ACTIVE' 
        && profile.subscription?.endDate > new Date()

      const artisan = {
        id: profile.user.id,
        profileId: profile.id,
        name: `${profile.user.firstName} ${profile.user.lastName}`,
        profession: profile.profession,
        bio: profile.bio,
        profileImage: profile.profileImage,
        location: {
          city: profile.city,
          county: profile.county,
          latitude: profile.latitude,
          longitude: profile.longitude
        },
        experience: profile.experience,
        hourlyRate: profile.hourlyRate,
        isAvailable: profile.isAvailable,
        isVerified: profile.artisanStatus === 'VERIFIED',
        isPremium: hasActiveSubscription,
        rating: {
          average: profile.averageRating,
          total: profile.totalReviews
        },
        specializations: profile.specializations,
        memberSince: profile.user.createdAt,
        distance: null as number | null
      }

      // Calculate distance using Haversine formula
      if (lat && lng && profile.latitude && profile.longitude) {
        const R = 6371 // Earth's radius in km
        const dLat = ((profile.latitude - lat) * Math.PI) / 180
        const dLng = ((profile.longitude - lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((profile.latitude * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        artisan.distance = Math.round(R * c * 10) / 10 // km with 1 decimal
      }

      return artisan
    })

    // Filter by radius if geospatial search is active
    if (lat && lng && radius) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results = results.filter((a: any) => a.distance === null || a.distance <= radius)
    }

    // Sort by distance if requested
    if (sortBy === 'distance' && lat && lng) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results.sort((a: any, b: any) => {
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance
      })
    }

    // Boost premium artisans to the top of results (stable sort preserves existing order within groups)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results.sort((a: any, b: any) => {
      if (a.isPremium && !b.isPremium) return -1
      if (!a.isPremium && b.isPremium) return 1
      return 0
    })

    // Get available filter options for faceted search (all verified artisans)
    const facetWhere = {
      user: { role: 'ARTISAN' as const, status: 'ACTIVE' as const },
      artisanStatus: 'VERIFIED' as const,
    }
    const [professions, counties, specializations] = await Promise.all([
      prisma.profile.groupBy({
        by: ['profession'],
        where: {
          ...facetWhere,
          profession: { not: null }
        },
        _count: { profession: true },
        orderBy: { _count: { profession: 'desc' } },
        take: 20
      }),
      prisma.profile.groupBy({
        by: ['county'],
        where: {
          ...facetWhere,
          county: { not: null }
        },
        _count: { county: true },
        orderBy: { _count: { county: 'desc' } },
        take: 47 // Kenya has 47 counties
      }),
      prisma.specialization.groupBy({
        by: ['name'],
        _count: { name: true },
        orderBy: { _count: { name: 'desc' } },
        take: 30
      })
    ])

    // Return cached response for public search results
    return cachedJsonResponse({
      artisans: results,
      facets: {
        professions: professions.map((p: { profession: string | null; _count: { profession: number } }) => ({ name: p.profession, count: p._count.profession })),
        counties: counties.map((c: { county: string | null; _count: { county: number } }) => ({ name: c.county, count: c._count.county })),
        specializations: specializations.map((s: { name: string; _count: { name: number } }) => ({ name: s.name, count: s._count.name }))
      },
      pagination: {
        page: clampedPage,
        limit: clampedLimit,
        total,
        totalPages: Math.ceil(total / clampedLimit)
      },
      searchParams: {
        query,
        profession,
        county,
        city,
        minRating,
        availableOnly,
        verifiedOnly,
        sortBy,
        sortOrder
      }
    }, {
      maxAge: CACHE_DURATIONS.MEDIUM, // 5 minutes
      staleWhileRevalidate: STALE_DURATIONS.SHORT, // 1 minute stale
      isPublic: true // Public search results can be cached by CDNs
    })
  } catch (error) {
    logger.error('Failed to search artisans', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
