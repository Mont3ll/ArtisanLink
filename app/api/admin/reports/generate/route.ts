/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for report generation
const reportRequestSchema = z.object({
  type: z.enum(['users', 'artisans', 'reviews', 'subscriptions', 'payments', 'activity', 'overview']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['json', 'csv']).default('json'),
  filters: z.object({
    role: z.enum(['CLIENT', 'ARTISAN', 'ADMIN']).optional(),
    status: z.string().optional(),
    county: z.string().optional(),
    profession: z.string().optional()
  }).optional()
})

// POST - Generate report (admin only)
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const admin = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = reportRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { type, startDate, endDate, format, filters } = validationResult.data

    // Build date range filter
    const dateFilter: Record<string, unknown> = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    let reportData: unknown
    let reportMeta: Record<string, unknown> = {
      type,
      generatedAt: new Date().toISOString(),
      generatedBy: admin.email,
      dateRange: { startDate, endDate }
    }

    switch (type) {
      case 'users': {
        const where: Record<string, unknown> = {}
        if (Object.keys(dateFilter).length) {
          where.createdAt = dateFilter
        }
        if (filters?.role) {
          where.role = filters.role
        }
        if (filters?.status) {
          where.status = filters.status
        }

        const users = await prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            status: true,
            createdAt: true,
            lastLoginAt: true,
            profile: {
              select: {
                city: true,
                county: true,
                profession: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        reportData = users
        reportMeta.totalRecords = users.length
        break
      }

      case 'artisans': {
        const where: Record<string, unknown> = {
          user: { role: 'ARTISAN' }
        }
        if (Object.keys(dateFilter).length) {
          where.createdAt = dateFilter
        }
        if (filters?.county) {
          where.county = filters.county
        }
        if (filters?.profession) {
          where.profession = { contains: filters.profession, mode: 'insensitive' }
        }
        if (filters?.status) {
          where.artisanStatus = filters.status
        }

        const artisans = await prisma.profile.findMany({
          where,
          select: {
            id: true,
            profession: true,
            experience: true,
            hourlyRate: true,
            isAvailable: true,
            artisanStatus: true,
            city: true,
            county: true,
            averageRating: true,
            totalReviews: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                status: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        // Calculate summary stats
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const avgRating = artisans.reduce((sum: number, a: any) => sum + a.averageRating, 0) / (artisans.length || 1)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const avgHourlyRate = artisans.filter((a: any) => a.hourlyRate).reduce((sum: number, a: any) => sum + (a.hourlyRate || 0), 0) / (artisans.filter((a: any) => a.hourlyRate).length || 1)

        reportData = artisans
        reportMeta = {
          ...reportMeta,
          totalRecords: artisans.length,
          summary: {
            totalArtisans: artisans.length,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            verified: artisans.filter((a: any) => a.artisanStatus === 'VERIFIED').length,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pending: artisans.filter((a: any) => a.artisanStatus === 'PENDING').length,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            available: artisans.filter((a: any) => a.isAvailable).length,
            averageRating: Math.round(avgRating * 100) / 100,
            averageHourlyRate: Math.round(avgHourlyRate)
          }
        }
        break
      }

      case 'reviews': {
        const where: Record<string, unknown> = {}
        if (Object.keys(dateFilter).length) {
          where.createdAt = dateFilter
        }
        if (filters?.status === 'approved') {
          where.isApproved = true
        } else if (filters?.status === 'pending') {
          where.isApproved = false
          where.isHidden = false
        } else if (filters?.status === 'hidden') {
          where.isHidden = true
        }

        const reviews = await prisma.review.findMany({
          where,
          select: {
            id: true,
            rating: true,
            comment: true,
            projectTitle: true,
            projectCost: true,
            isApproved: true,
            isHidden: true,
            createdAt: true,
            profile: {
              select: {
                profession: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            },
            client: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        const avgRating = reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / (reviews.length || 1)

        reportData = reviews
        reportMeta = {
          ...reportMeta,
          totalRecords: reviews.length,
          summary: {
            totalReviews: reviews.length,
            approved: reviews.filter((r: { isApproved: boolean }) => r.isApproved).length,
            pending: reviews.filter((r: { isApproved: boolean; isHidden: boolean }) => !r.isApproved && !r.isHidden).length,
            hidden: reviews.filter((r: { isHidden: boolean }) => r.isHidden).length,
            averageRating: Math.round(avgRating * 100) / 100,
            ratingDistribution: {
              5: reviews.filter((r: { rating: number }) => r.rating === 5).length,
              4: reviews.filter((r: { rating: number }) => r.rating === 4).length,
              3: reviews.filter((r: { rating: number }) => r.rating === 3).length,
              2: reviews.filter((r: { rating: number }) => r.rating === 2).length,
              1: reviews.filter((r: { rating: number }) => r.rating === 1).length
            }
          }
        }
        break
      }

      case 'subscriptions': {
        const where: Record<string, unknown> = {}
        if (Object.keys(dateFilter).length) {
          where.createdAt = dateFilter
        }
        if (filters?.status) {
          where.status = filters.status
        }

        const subscriptions = await prisma.subscription.findMany({
          where,
          select: {
            id: true,
            plan: true,
            status: true,
            amount: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            profile: {
              select: {
                profession: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        const totalRevenue = subscriptions.filter((s: { status: string }) => s.status === 'ACTIVE').reduce((sum: number, s: { amount: number }) => sum + s.amount, 0)

        reportData = subscriptions
        reportMeta = {
          ...reportMeta,
          totalRecords: subscriptions.length,
          summary: {
            totalSubscriptions: subscriptions.length,
            active: subscriptions.filter((s: { status: string }) => s.status === 'ACTIVE').length,
            expired: subscriptions.filter((s: { status: string }) => s.status === 'EXPIRED').length,
            monthly: subscriptions.filter((s: { plan: string }) => s.plan === 'MONTHLY').length,
            annual: subscriptions.filter((s: { plan: string }) => s.plan === 'ANNUAL').length,
            totalRevenue,
            currency: 'KES'
          }
        }
        break
      }

      case 'payments': {
        const where: Record<string, unknown> = {}
        if (Object.keys(dateFilter).length) {
          where.createdAt = dateFilter
        }
        if (filters?.status) {
          where.status = filters.status
        }

        const payments = await prisma.payment.findMany({
          where,
          select: {
            id: true,
            amount: true,
            currency: true,
            method: true,
            status: true,
            mpesaReceiptNumber: true,
            phoneNumber: true,
            description: true,
            failureReason: true,
            createdAt: true,
            paidAt: true,
            subscription: {
              select: {
                plan: true,
                profile: {
                  select: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        const completedPayments = payments.filter((p: { status: string }) => p.status === 'COMPLETED')
        const totalRevenue = completedPayments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0)

        reportData = payments
        reportMeta = {
          ...reportMeta,
          totalRecords: payments.length,
          summary: {
            totalTransactions: payments.length,
            completed: completedPayments.length,
            pending: payments.filter((p: { status: string }) => p.status === 'PENDING').length,
            failed: payments.filter((p: { status: string }) => p.status === 'FAILED').length,
            refunded: payments.filter((p: { status: string }) => p.status === 'REFUNDED').length,
            totalRevenue,
            currency: 'KES',
            byMethod: {
              mpesa: payments.filter((p: { method: string }) => p.method === 'MPESA').length,
              card: payments.filter((p: { method: string }) => p.method === 'CARD').length,
              bankTransfer: payments.filter((p: { method: string }) => p.method === 'BANK_TRANSFER').length
            }
          }
        }
        break
      }

      case 'activity': {
        const where: Record<string, unknown> = {}
        if (Object.keys(dateFilter).length) {
          where.createdAt = dateFilter
        }

        const logs = await prisma.activityLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 1000 // Limit for performance
        })

        // Group by action type
        const actionGroups: Record<string, number> = {}
        logs.forEach((log: { action: string }) => {
          actionGroups[log.action] = (actionGroups[log.action] || 0) + 1
        })

        reportData = logs
        reportMeta = {
          ...reportMeta,
          totalRecords: logs.length,
          summary: {
            totalActions: logs.length,
            byAction: actionGroups,
            uniqueAdmins: [...new Set(logs.map((l: { adminEmail: string | null }) => l.adminEmail))].length
          }
        }
        break
      }

      case 'overview': {
        // Generate comprehensive overview report
        const [
          totalUsers,
          totalArtisans,
          totalClients,
          activeSubscriptions,
          totalRevenue,
          totalReviews,
          pendingReviews,
          recentSignups,
          topCounties
        ] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { role: 'ARTISAN' } }),
          prisma.user.count({ where: { role: 'CLIENT' } }),
          prisma.subscription.count({ where: { status: 'ACTIVE' } }),
          prisma.payment.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true }
          }),
          prisma.review.count(),
          prisma.review.count({ where: { isApproved: false, isHidden: false } }),
          prisma.user.count({
            where: {
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
          }),
          prisma.profile.groupBy({
            by: ['county'],
            where: { county: { not: null } },
            _count: { county: true },
            orderBy: { _count: { county: 'desc' } },
            take: 10
          })
        ])

        reportData = {
          users: {
            total: totalUsers,
            artisans: totalArtisans,
            clients: totalClients,
            recentSignups
          },
          subscriptions: {
            active: activeSubscriptions,
            totalRevenue: totalRevenue._sum.amount || 0,
            currency: 'KES'
          },
          reviews: {
            total: totalReviews,
            pending: pendingReviews
          },
          geography: {
            topCounties: topCounties.map((c: { county: string | null; _count: { county: number } }) => ({
              county: c.county,
              count: c._count.county
            }))
          }
        }
        reportMeta.summary = reportData
        break
      }
    }

    // Log report generation
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: 'REPORT_GENERATED',
        targetType: 'REPORT',
        targetId: type,
        description: `Generated ${type} report`,
        metadata: { type, startDate, endDate, format, recordCount: reportMeta.totalRecords }
      }
    })

    // Format as CSV if requested
    if (format === 'csv' && Array.isArray(reportData) && reportData.length > 0) {
      const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, string> => {
        const result: Record<string, string> = {}
        for (const [key, value] of Object.entries(obj)) {
          const newKey = prefix ? `${prefix}_${key}` : key
          if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            Object.assign(result, flattenObject(value as Record<string, unknown>, newKey))
          } else if (value instanceof Date) {
            result[newKey] = value.toISOString()
          } else if (Array.isArray(value)) {
            result[newKey] = value.join('; ')
          } else {
            result[newKey] = String(value ?? '')
          }
        }
        return result
      }

      const flatData = (reportData as Record<string, unknown>[]).map(item => flattenObject(item))
      const headers = [...new Set(flatData.flatMap(item => Object.keys(item)))]
      const csvRows = [
        headers.join(','),
        ...flatData.map(item => 
          headers.map(h => {
            const val = item[h] || ''
            // Escape commas and quotes in CSV
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
              return `"${val.replace(/"/g, '""')}"`
            }
            return val
          }).join(',')
        )
      ]

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json({
      meta: reportMeta,
      data: reportData
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
