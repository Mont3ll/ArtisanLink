import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'

const logger = createLogger('api/client/search-history')

// Validation schema for creating search history
const createSearchHistorySchema = z.object({
  query: z.string().optional(),
  profession: z.string().optional(),
  location: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxRadius: z.number().positive().optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  resultCount: z.number().int().nonnegative().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

// GET - List search history for the current user
export async function GET(request: Request) {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '10', 10)), 50)
    const unique = searchParams.get('unique') === 'true' // Only return unique searches

    // Get search history
    const searchHistory = await prisma.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: unique ? limit * 3 : limit, // Get more if we need to filter duplicates
    })

    // If unique, filter to only unique combinations of query/profession/location
    let items = searchHistory
    if (unique) {
      const seen = new Set<string>()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items = searchHistory.filter((item: any) => {
        const key = `${item.query || ''}-${item.profession || ''}-${item.location || ''}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      }).slice(0, limit)
    }

    // Transform the data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedItems = items.map((item: any) => ({
      id: item.id,
      query: item.query,
      profession: item.profession,
      location: item.location,
      minRating: item.minRating,
      maxRadius: item.maxRadius,
      filters: item.filters,
      resultCount: item.resultCount,
      latitude: item.latitude,
      longitude: item.longitude,
      createdAt: item.createdAt,
    }))

    return NextResponse.json({
      items: transformedItems,
      total: await prisma.searchHistory.count({ where: { userId: user.id } }),
    })
  } catch (error) {
    logger.error('Failed to fetch search history', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new search history entry
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
    const validation = createSearchHistorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Skip empty searches (no query, profession, or location)
    if (!data.query && !data.profession && !data.location) {
      return NextResponse.json(
        { message: 'Search not recorded (no search criteria)' },
        { status: 200 }
      )
    }

    // Check if same search was made recently (within last 5 minutes) to avoid duplicates
    const recentSearch = await prisma.searchHistory.findFirst({
      where: {
        userId: user.id,
        query: data.query || null,
        profession: data.profession || null,
        location: data.location || null,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
    })

    if (recentSearch) {
      // Update result count if it changed
      if (data.resultCount !== undefined && recentSearch.resultCount !== data.resultCount) {
        await prisma.searchHistory.update({
          where: { id: recentSearch.id },
          data: { resultCount: data.resultCount },
        })
      }
      return NextResponse.json({
        message: 'Search already recorded recently',
        id: recentSearch.id,
      })
    }

    // Create search history entry
    const searchEntry = await prisma.searchHistory.create({
      data: {
        userId: user.id,
        query: data.query,
        profession: data.profession,
        location: data.location,
        minRating: data.minRating,
        maxRadius: data.maxRadius,
        filters: data.filters,
        resultCount: data.resultCount,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    })

    // Cleanup old entries (keep only last 100 searches per user)
    const oldEntries = await prisma.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: 100,
      select: { id: true },
    })

    if (oldEntries.length > 0) {
      await prisma.searchHistory.deleteMany({
        where: {
          id: { in: oldEntries.map((e: { id: string }) => e.id) },
        },
      })
    }

    return NextResponse.json(
      {
        message: 'Search recorded successfully',
        id: searchEntry.id,
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Failed to record search', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Clear search history
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

    // Check for specific ID to delete
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Delete specific entry
      const deleted = await prisma.searchHistory.deleteMany({
        where: {
          id,
          userId: user.id,
        },
      })

      if (deleted.count === 0) {
        return NextResponse.json(
          { error: 'Search history entry not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: 'Search history entry deleted' })
    }

    // Delete all search history for user
    const deleted = await prisma.searchHistory.deleteMany({
      where: { userId: user.id },
    })

    return NextResponse.json({
      message: 'Search history cleared',
      deletedCount: deleted.count,
    })
  } catch (error) {
    logger.error('Failed to delete search history', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
