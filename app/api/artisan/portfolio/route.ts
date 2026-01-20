import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating portfolio item
const createPortfolioSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url(),
  imageUrls: z.array(z.string().url()).optional().default([]),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional().default([]),
  completedAt: z.string().datetime().optional(),
  duration: z.string().max(100).optional(),
  cost: z.number().positive().optional(),
  isPublic: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false)
})

// GET - List portfolio items for authenticated artisan
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    })

    if (!user || user.role !== 'ARTISAN' || !user.profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const clampedPage = Math.max(1, page)
    const clampedLimit = Math.min(Math.max(1, limit), 50)
    const skip = (clampedPage - 1) * clampedLimit

    // Build where clause
    const where: {
      profileId: string
      category?: string
      isFeatured?: boolean
    } = {
      profileId: user.profile.id
    }

    if (category) {
      where.category = category
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    // Get portfolio items with pagination
    const [items, total] = await Promise.all([
      prisma.portfolioItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: clampedLimit
      }),
      prisma.portfolioItem.count({ where })
    ])

    return NextResponse.json({
      items,
      pagination: {
        page: clampedPage,
        limit: clampedLimit,
        total,
        totalPages: Math.ceil(total / clampedLimit)
      }
    })
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new portfolio item
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    })

    if (!user || user.role !== 'ARTISAN' || !user.profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = createPortfolioSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create portfolio item
    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        profileId: user.profile.id,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        imageUrls: data.imageUrls,
        category: data.category,
        tags: data.tags,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        duration: data.duration,
        cost: data.cost,
        isPublic: data.isPublic,
        isFeatured: data.isFeatured
      }
    })

    return NextResponse.json(portfolioItem, { status: 201 })
  } catch (error) {
    console.error('Error creating portfolio item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
