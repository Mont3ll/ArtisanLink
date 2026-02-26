/**
 * Client Analytics API
 *
 * GET /api/client/analytics - Returns analytics data for the authenticated client
 * Supports ?range=7d|30d|90d|1y query param (default: 30d)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Parse a time range string into a start Date.
 */
function getRangeStartDate(range: string | null): Date {
  const now = new Date()
  switch (range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    case '30d':
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true }
    })

    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const range = request.nextUrl.searchParams.get('range')
    const rangeStart = getRangeStartDate(range)

    // Fetch all jobs for this client in range
    const jobs = await prisma.job.findMany({
      where: {
        clientId: user.id,
        createdAt: { gte: rangeStart }
      },
      select: {
        id: true,
        status: true,
        category: true,
        agreedPrice: true,
        depositAmount: true,
        depositPaid: true,
        finalPaid: true,
        createdAt: true,
        completedAt: true,
      }
    })

    type JobRow = (typeof jobs)[number]

    // Aggregate stats
    const totalJobs = jobs.length
    const activeJobs = jobs.filter((j: JobRow) =>
      ['REQUESTED', 'QUOTED', 'ACCEPTED', 'DEPOSIT_PAID', 'IN_PROGRESS'].includes(j.status)
    ).length
    const completedJobs = jobs.filter((j: JobRow) =>
      ['COMPLETED', 'PAID'].includes(j.status)
    ).length
    const cancelledJobs = jobs.filter((j: JobRow) =>
      ['CANCELLED', 'DECLINED'].includes(j.status)
    ).length

    // Total spent = sum of agreedPrice for paid/completed jobs
    const totalSpent = jobs
      .filter((j: JobRow) => ['COMPLETED', 'PAID'].includes(j.status) && j.agreedPrice)
      .reduce((sum: number, j: JobRow) => sum + (j.agreedPrice || 0), 0)

    // Average job value
    const jobsWithPrice = jobs.filter((j: JobRow) => j.agreedPrice !== null && j.agreedPrice > 0)
    const averageJobValue = jobsWithPrice.length > 0
      ? jobsWithPrice.reduce((sum: number, j: JobRow) => sum + (j.agreedPrice || 0), 0) / jobsWithPrice.length
      : 0

    // Job status breakdown for chart
    const statusBreakdown: Record<string, number> = {}
    for (const job of jobs) {
      statusBreakdown[job.status] = (statusBreakdown[job.status] || 0) + 1
    }

    // Spending by category
    const categorySpending: Record<string, number> = {}
    for (const job of jobs) {
      if (job.agreedPrice && ['COMPLETED', 'PAID'].includes(job.status)) {
        const cat = job.category || 'Uncategorized'
        categorySpending[cat] = (categorySpending[cat] || 0) + job.agreedPrice
      }
    }

    // Reviews given in range
    const reviewsGiven = await prisma.review.count({
      where: {
        clientId: user.id,
        createdAt: { gte: rangeStart }
      }
    })

    // Saved artisans count (all-time -- not range-filtered)
    const savedArtisans = await prisma.savedArtisan.count({
      where: { userId: user.id }
    })

    // Conversations in range
    const conversationsStarted = await prisma.conversation.count({
      where: {
        clientId: user.id,
        createdAt: { gte: rangeStart }
      }
    })

    // Monthly spending trend (up to 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlySpending = new Map<string, number>()

    // Pre-populate months based on range
    const monthsToShow = range === '7d' ? 1 : range === '90d' ? 3 : range === '1y' ? 12 : 2
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      monthlySpending.set(key, 0)
    }

    for (const job of jobs) {
      if (job.agreedPrice && ['COMPLETED', 'PAID'].includes(job.status)) {
        const d = new Date(job.completedAt || job.createdAt)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        monthlySpending.set(key, (monthlySpending.get(key) || 0) + job.agreedPrice)
      }
    }

    const spendingTrend = Array.from(monthlySpending.entries()).map(([key, amount]) => {
      const [, monthIdx] = key.split('-')
      return {
        month: monthNames[parseInt(monthIdx, 10)],
        amount: Math.round(amount * 100) / 100
      }
    })

    return NextResponse.json({
      stats: {
        totalJobs,
        activeJobs,
        completedJobs,
        cancelledJobs,
        totalSpent: Math.round(totalSpent * 100) / 100,
        averageJobValue: Math.round(averageJobValue * 100) / 100,
        reviewsGiven,
        savedArtisans,
        conversationsStarted,
      },
      statusBreakdown,
      categorySpending,
      spendingTrend,
    })
  } catch (error) {
    console.error('Error fetching client analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
