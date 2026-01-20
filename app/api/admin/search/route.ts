import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

/* eslint-disable @typescript-eslint/no-explicit-any */

const logger = createLogger('api/admin/search')

// GET - Admin search across users, artisans, activities (admin only)
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
    const query = searchParams.get('q') || searchParams.get('query') || ''
    const type = searchParams.get('type') || 'all' // 'all', 'users', 'artisans', 'activities'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50)

    interface SearchResults {
      users: Array<{
        id: string
        name: string
        email: string
        role: string
        status: string
        joinDate: Date
        profileImage?: string | null
      }>
      artisans: Array<{
        id: string
        name: string
        email: string
        profession: string | null
        status: string
        isVerified: boolean
        rating: number
        totalReviews: number
        county: string | null
        hourlyRate: number | null
      }>
      activities: Array<{
        id: string
        action: string
        details: string | null
        timestamp: Date
        type: string
        adminEmail: string
      }>
    }

    const results: SearchResults = {
      users: [],
      artisans: [],
      activities: []
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: query ? {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        } : {},
        include: {
          profile: {
            select: { profileImage: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      results.users = users.map((u: any) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.role,
        status: u.status,
        joinDate: u.createdAt,
        profileImage: u.profile?.profileImage
      }))
    }

    // Search artisans
    if (type === 'all' || type === 'artisans') {
      const artisans = await prisma.profile.findMany({
        where: {
          user: {
            role: 'ARTISAN',
            ...(query ? {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
              ]
            } : {})
          },
          ...(query ? {
            OR: [
              { profession: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } },
              { county: { contains: query, mode: 'insensitive' } }
            ]
          } : {})
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true
            }
          }
        },
        orderBy: { averageRating: 'desc' },
        take: limit
      })

      results.artisans = artisans.map((a: any) => ({
        id: a.user.id,
        name: `${a.user.firstName} ${a.user.lastName}`,
        email: a.user.email,
        profession: a.profession,
        status: a.user.status,
        isVerified: a.artisanStatus === 'VERIFIED',
        rating: a.averageRating,
        totalReviews: a.totalReviews,
        county: a.county,
        hourlyRate: a.hourlyRate
      }))
    }

    // Search activities
    if (type === 'all' || type === 'activities') {
      const activities = await prisma.activityLog.findMany({
        where: query ? {
          OR: [
            { action: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { adminEmail: { contains: query, mode: 'insensitive' } }
          ]
        } : {},
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      results.activities = activities.map((a: any) => ({
        id: a.id,
        action: a.action,
        details: a.description,
        timestamp: a.createdAt,
        type: a.targetType,
        adminEmail: a.adminEmail
      }))
    }

    // Get counts
    const [userCount, artisanCount, activityCount] = await Promise.all([
      query && (type === 'all' || type === 'users')
        ? prisma.user.count({
            where: {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
              ]
            }
          })
        : prisma.user.count(),
      query && (type === 'all' || type === 'artisans')
        ? prisma.profile.count({
            where: {
              user: { role: 'ARTISAN' },
              OR: [
                { profession: { contains: query, mode: 'insensitive' } },
                { user: { firstName: { contains: query, mode: 'insensitive' } } },
                { user: { lastName: { contains: query, mode: 'insensitive' } } }
              ]
            }
          })
        : prisma.profile.count({ where: { user: { role: 'ARTISAN' } } }),
      query && (type === 'all' || type === 'activities')
        ? prisma.activityLog.count({
            where: {
              OR: [
                { action: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
              ]
            }
          })
        : prisma.activityLog.count()
    ])

    return NextResponse.json({
      results,
      counts: {
        users: userCount,
        artisans: artisanCount,
        activities: activityCount,
        total: userCount + artisanCount + activityCount
      },
      query,
      type
    })
  } catch (error) {
    logger.error('Error in admin search', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
