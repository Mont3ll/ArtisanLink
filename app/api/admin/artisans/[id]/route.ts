import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } })
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const artisan = await prisma.user.findUnique({
      where: { id, role: 'ARTISAN' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            profession: true,
            city: true,
            county: true,
            hourlyRate: true,
            isAvailable: true,
            artisanStatus: true,
            averageRating: true,
            totalReviews: true,
            idDocumentUrl: true,
            certificateUrl: true,
            _count: { select: { portfolioItems: true } },
            subscription: { select: { status: true, plan: true, endDate: true } },
          },
        },
      },
    })

    if (!artisan || !artisan.profile) {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })
    }

    const documents: string[] = []
    if (artisan.profile.idDocumentUrl) documents.push('National ID')
    if (artisan.profile.certificateUrl) documents.push('Certificate')

    return NextResponse.json({
      artisan: {
        id: artisan.id,
        name: `${artisan.firstName} ${artisan.lastName}`,
        email: artisan.email,
        profession: artisan.profile.profession,
        location: { city: artisan.profile.city, county: artisan.profile.county },
        isAvailable: artisan.profile.isAvailable,
        verificationStatus: artisan.profile.artisanStatus ?? 'PENDING',
        rating: { average: artisan.profile.averageRating, total: artisan.profile.totalReviews },
        portfolioCount: artisan.profile._count.portfolioItems,
        documents,
        idDocumentUrl: artisan.profile.idDocumentUrl ?? null,
        certificateUrl: artisan.profile.certificateUrl ?? null,
        isPremium: artisan.profile.subscription?.status === 'ACTIVE',
        memberSince: artisan.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching admin artisan detail:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const patchSchema = z.object({
  isAvailable: z.boolean(),
})

export async function PATCH(request: Request, { params }: RouteContext) {
  const rl = rateLimit(request, 'admin/artisans/update', RATE_LIMITS.STRICT)
  if (!rl.allowed) return rl.response!

  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } })
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const artisan = await prisma.user.findUnique({
      where: { id, role: 'ARTISAN' },
      select: { id: true, profile: { select: { id: true } } },
    })
    if (!artisan?.profile) return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })

    const parsed = patchSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const profile = await prisma.profile.update({
      where: { id: artisan.profile.id },
      data: { isAvailable: parsed.data.isAvailable },
      select: { id: true, isAvailable: true, artisanStatus: true },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating artisan availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
