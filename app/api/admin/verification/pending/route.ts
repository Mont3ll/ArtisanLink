import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get pending artisan verifications and stats in parallel
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [pendingArtisans, totalVerified, totalRejected, verifiedThisWeek] = await Promise.all([
      // Pending artisans with profiles
      prisma.user.findMany({
        where: {
          role: 'ARTISAN',
          profile: {
            artisanStatus: 'PENDING'
          }
        },
        include: {
          profile: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      // Count verified artisans
      prisma.profile.count({
        where: { artisanStatus: 'VERIFIED' }
      }),
      // Count rejected artisans
      prisma.profile.count({
        where: { artisanStatus: 'REJECTED' }
      }),
      // Count verified this week
      prisma.profile.count({
        where: {
          artisanStatus: 'VERIFIED',
          verifiedAt: { gte: weekAgo }
        }
      }),
    ])

    // Calculate pending this week
    const pendingThisWeek = pendingArtisans.filter(
      (a: { createdAt: Date }) => new Date(a.createdAt) > weekAgo
    ).length

    // Calculate average processing time from recent verification history
    const recentHistory = await prisma.verificationHistory.findMany({
      where: {
        processedAt: { not: null }
      },
      select: {
        submittedAt: true,
        processedAt: true,
      },
      orderBy: { processedAt: 'desc' },
      take: 50,
    })

    let avgProcessingTime = 2 // default
    if (recentHistory.length > 0) {
      const totalDays = recentHistory.reduce((sum: number, h: { processedAt: Date | null; submittedAt: Date }) => {
        if (h.processedAt && h.submittedAt) {
          const diff = h.processedAt.getTime() - h.submittedAt.getTime()
          return sum + diff / (1000 * 60 * 60 * 24)
        }
        return sum
      }, 0)
      avgProcessingTime = Math.round((totalDays / recentHistory.length) * 10) / 10
    }

    return NextResponse.json({
      pendingArtisans,
      stats: {
        totalPending: pendingArtisans.length,
        totalVerified,
        totalRejected,
        pendingThisWeek,
        verifiedThisWeek,
        avgProcessingTime,
      }
    })
  } catch (error) {
    console.error('Error fetching pending verifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
