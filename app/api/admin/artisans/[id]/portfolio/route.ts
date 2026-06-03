import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

type PortfolioRecord = {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  imageUrls: string[]
  category: string | null
  tags: string[]
  isPublic: boolean
  createdAt: Date
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const artisan = await prisma.user.findUnique({
      where: { id, role: 'ARTISAN' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: {
          select: {
            id: true,
            portfolioItems: {
              orderBy: { createdAt: 'desc' },
              take: 24,
              select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                imageUrls: true,
                category: true,
                tags: true,
                isPublic: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })

    if (!artisan || !artisan.profile) {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })
    }

    return NextResponse.json({
      artisan: {
        id: artisan.id,
        name: `${artisan.firstName} ${artisan.lastName}`,
        profileId: artisan.profile.id,
      },
      portfolio: (artisan.profile.portfolioItems as PortfolioRecord[]).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        tags: item.tags,
        isPublic: item.isPublic,
        createdAt: item.createdAt.toISOString(),
        images: [item.imageUrl, ...(item.imageUrls ?? [])].filter((url): url is string => Boolean(url)),
        hasImage: Boolean(item.imageUrl) || (item.imageUrls?.length ?? 0) > 0,
      })),
    })
  } catch (error) {
    console.error('Error fetching admin artisan portfolio:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
