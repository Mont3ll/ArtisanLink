import { NextResponse } from 'next/server'
import { cachedJsonResponse, CACHE_DURATIONS, STALE_DURATIONS } from '@/lib/cache'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { ArtisanStatus, SubscriptionStatus, SubscriptionPlan } from '@/app/generated/prisma'

// Type for the artisan query result
type ArtisanQueryResult = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  createdAt: Date
  lastLoginAt: Date | null
  profile: {
    profession: string | null
    city: string | null
    county: string | null
    experience: number | null
    averageRating: number
    artisanStatus: ArtisanStatus | null
    isAvailable: boolean
    subscription: {
      status: SubscriptionStatus
      plan: SubscriptionPlan
      endDate: Date
    } | null
    _count: {
      reviews: number
      portfolioItems: number
    }
  } | null
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') // 'PENDING', 'VERIFIED', 'REJECTED', or empty for all
    const subscriptionStatus = searchParams.get('subscriptionStatus') // 'ACTIVE', 'INACTIVE', 'EXPIRED'

    const clampedPage = Math.max(1, page)
    const clampedLimit = Math.min(Math.max(1, limit), 50)
    const skip = (clampedPage - 1) * clampedLimit

    // Build where clause for artisan users
    type WhereClause = {
      role: 'ARTISAN'
      OR?: Array<{
        firstName?: { contains: string; mode: 'insensitive' }
        lastName?: { contains: string; mode: 'insensitive' }
        email?: { contains: string; mode: 'insensitive' }
        profile?: { profession?: { contains: string; mode: 'insensitive' } } | { city?: { contains: string; mode: 'insensitive' } }
      }>
      profile?: {
        artisanStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'
        subscription?: { status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SUSPENDED' }
      }
    }

    const where: WhereClause = {
      role: 'ARTISAN',
    }

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { profession: { contains: search, mode: 'insensitive' } } },
        { profile: { city: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Status filter
    if (status && ['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      where.profile = {
        ...where.profile,
        artisanStatus: status as 'PENDING' | 'VERIFIED' | 'REJECTED',
      }
    }

    // Subscription status filter
    if (subscriptionStatus && ['ACTIVE', 'INACTIVE', 'EXPIRED'].includes(subscriptionStatus)) {
      where.profile = {
        ...where.profile,
        subscription: {
          status: subscriptionStatus as 'ACTIVE' | 'INACTIVE' | 'EXPIRED',
        },
      }
    }

    // Get artisans with profiles, subscriptions, and review counts
    const [artisans, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: {
            include: {
              subscription: {
                select: {
                  status: true,
                  plan: true,
                  endDate: true,
                },
              },
              _count: {
                select: {
                  reviews: true,
                  portfolioItems: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: clampedLimit,
      }),
      prisma.user.count({ where }),
    ])

    // Transform data
    const transformedArtisans = artisans.map((artisan: ArtisanQueryResult) => ({
      id: artisan.id,
      name: `${artisan.firstName} ${artisan.lastName}`,
      email: artisan.email,
      phone: artisan.phone,
      profession: artisan.profile?.profession || null,
      location: artisan.profile?.city 
        ? `${artisan.profile.city}${artisan.profile.county ? `, ${artisan.profile.county}` : ''}`
        : null,
      experience: artisan.profile?.experience || 0,
      rating: artisan.profile?.averageRating || 0,
      totalReviews: artisan.profile?._count.reviews || 0,
      portfolioItems: artisan.profile?._count.portfolioItems || 0,
      status: artisan.profile?.artisanStatus || 'PENDING',
      isAvailable: artisan.profile?.isAvailable || false,
      joinDate: artisan.createdAt.toISOString(),
      lastActive: artisan.lastLoginAt?.toISOString() || artisan.createdAt.toISOString(),
      subscriptionStatus: artisan.profile?.subscription?.status || 'INACTIVE',
      subscriptionPlan: artisan.profile?.subscription?.plan || null,
      subscriptionEndDate: artisan.profile?.subscription?.endDate?.toISOString() || null,
    }))

    // Get stats
    const [totalArtisans, verifiedCount, pendingCount, activeSubscriptions] = await Promise.all([
      prisma.user.count({ where: { role: 'ARTISAN' } }),
      prisma.profile.count({ 
        where: { 
          user: { role: 'ARTISAN' },
          artisanStatus: 'VERIFIED' 
        } 
      }),
      prisma.profile.count({ 
        where: { 
          user: { role: 'ARTISAN' },
          artisanStatus: 'PENDING' 
        } 
      }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ])

    return cachedJsonResponse({
      artisans: transformedArtisans,
      pagination: {
        page: clampedPage,
        limit: clampedLimit,
        total,
        totalPages: Math.ceil(total / clampedLimit),
      },
      stats: {
        totalArtisans,
        verifiedCount,
        pendingCount,
        activeSubscriptions,
      },
    }, { maxAge: CACHE_DURATIONS.SHORT, staleWhileRevalidate: STALE_DURATIONS.SHORT })
  } catch (error) {
    console.error('Error fetching artisans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
