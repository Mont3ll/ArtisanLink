import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating portfolio item
const updatePortfolioSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
  completedAt: z.string().datetime().optional().nullable(),
  duration: z.string().max(100).optional().nullable(),
  cost: z.number().positive().optional().nullable(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional()
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET - Get single portfolio item
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
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

    // Get portfolio item
    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id }
    })

    if (!portfolioItem) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    // Verify ownership
    if (portfolioItem.profileId !== user.profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(portfolioItem)
  } catch (error) {
    console.error('Error fetching portfolio item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update portfolio item
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
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

    // Get existing portfolio item
    const existingItem = await prisma.portfolioItem.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    // Verify ownership
    if (existingItem.profileId !== user.profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = updatePortfolioSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update portfolio item
    const portfolioItem = await prisma.portfolioItem.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.imageUrls !== undefined && { imageUrls: data.imageUrls }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.completedAt !== undefined && { completedAt: data.completedAt ? new Date(data.completedAt) : null }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.cost !== undefined && { cost: data.cost }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured })
      }
    })

    return NextResponse.json(portfolioItem)
  } catch (error) {
    console.error('Error updating portfolio item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete portfolio item
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
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

    // Get existing portfolio item
    const existingItem = await prisma.portfolioItem.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    // Verify ownership
    if (existingItem.profileId !== user.profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete portfolio item
    await prisma.portfolioItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting portfolio item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
