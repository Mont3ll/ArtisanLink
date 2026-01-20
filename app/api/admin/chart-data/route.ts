import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
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

    // Parse query parameters for date range (default: last 30 days)
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)
    const clampedDays = Math.min(Math.max(days, 7), 365) // Between 7 and 365 days

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - clampedDays)

    // Get all users created in the date range
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        createdAt: true,
        role: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get all subscriptions activated in the date range
    const subscriptions = await prisma.subscription.findMany({
      where: {
        startDate: {
          gte: startDate,
          lte: endDate
        },
        status: 'ACTIVE'
      },
      select: {
        startDate: true,
        amount: true
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    // Get all reviews created in the date range
    const reviews = await prisma.review.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Aggregate data by date
    const dataByDate = new Map<string, {
      users: number
      artisans: number
      clients: number
      subscriptions: number
      revenue: number
      reviews: number
    }>()

    // Initialize all dates in range with zeros
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      dataByDate.set(dateStr, {
        users: 0,
        artisans: 0,
        clients: 0,
        subscriptions: 0,
        revenue: 0,
        reviews: 0
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Populate user data
    for (const u of users) {
      const dateStr = u.createdAt.toISOString().split('T')[0]
      const data = dataByDate.get(dateStr)
      if (data) {
        data.users++
        if (u.role === 'ARTISAN') data.artisans++
        if (u.role === 'CLIENT') data.clients++
      }
    }

    // Populate subscription data
    for (const s of subscriptions) {
      const dateStr = s.startDate.toISOString().split('T')[0]
      const data = dataByDate.get(dateStr)
      if (data) {
        data.subscriptions++
        data.revenue += s.amount
      }
    }

    // Populate review data
    for (const r of reviews) {
      const dateStr = r.createdAt.toISOString().split('T')[0]
      const data = dataByDate.get(dateStr)
      if (data) {
        data.reviews++
      }
    }

    // Convert to array format for charts
    const chartData = Array.from(dataByDate.entries()).map(([date, data]) => ({
      date,
      users: data.users,
      artisans: data.artisans,
      clients: data.clients,
      subscriptions: data.subscriptions,
      revenue: data.revenue,
      reviews: data.reviews
    }))

    // Calculate summary statistics
    const summary = {
      totalUsers: users.length,
      totalArtisans: users.filter((u: { role: string }) => u.role === 'ARTISAN').length,
      totalClients: users.filter((u: { role: string }) => u.role === 'CLIENT').length,
      totalSubscriptions: subscriptions.length,
      totalRevenue: subscriptions.reduce((sum: number, s: { amount: number }) => sum + s.amount, 0),
      totalReviews: reviews.length,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: clampedDays
      }
    }

    return NextResponse.json({
      chartData,
      summary
    })
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
