/**
 * Admin Payouts Management API
 * 
 * GET /api/admin/payouts - List all payouts with filtering
 * 
 * Admin only endpoint for managing artisan payouts.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import type { PayoutStatus, PayoutType } from '@/app/generated/prisma'

const logger = createLogger('api/admin/payouts')

/**
 * GET - List payouts with filtering
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const status = searchParams.get('status') as PayoutStatus | null
    const type = searchParams.get('type') as PayoutType | null
    const requiresReview = searchParams.get('requiresReview') === 'true'
    const artisanId = searchParams.get('artisanId')
    const search = searchParams.get('search')

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (requiresReview) {
      where.requiresManualReview = true
    }

    if (artisanId) {
      where.artisanId = artisanId
    }

    if (search) {
      where.OR = [
        { artisan: { firstName: { contains: search, mode: 'insensitive' } } },
        { artisan: { lastName: { contains: search, mode: 'insensitive' } } },
        { mpesaTransactionId: { contains: search } },
        { mpesaReceiptNumber: { contains: search } },
      ]
    }

    // Get payouts with pagination
    const [payouts, total] = await Promise.all([
      prisma.artisanPayout.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          artisan: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              artisanProfile: {
                select: { businessName: true },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              agreedPrice: true,
            },
          },
        },
      }),
      prisma.artisanPayout.count({ where }),
    ])

    // Get summary statistics
    const stats = await prisma.artisanPayout.groupBy({
      by: ['status'],
      _count: true,
      _sum: { netAmount: true },
    })

    const statistics = {
      total,
      byStatus: stats.reduce((acc: Record<string, { count: number; amount: number }>, s: { status: string; _count: number; _sum: { netAmount: number | null } }) => {
        acc[s.status] = { count: s._count, amount: s._sum.netAmount || 0 }
        return acc
      }, {} as Record<string, { count: number; amount: number }>),
    }

    return NextResponse.json({
      payouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics,
    })
  } catch (error) {
    logger.error('Failed to list payouts', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
