import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/cron/subscriptions')

// Secret key for cron authentication (should be set in environment)
const CRON_SECRET = process.env.CRON_SECRET

/**
 * POST - Process subscription renewals and expirations
 * 
 * This endpoint should be called periodically (e.g., daily via cron job or Vercel Cron)
 * It handles:
 * 1. Sending renewal reminders for subscriptions expiring soon (7 days, 3 days, 1 day)
 * 2. Marking expired subscriptions as EXPIRED
 * 3. Creating notifications for users
 * 
 * Authentication: Requires CRON_SECRET header or query param
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const secretParam = searchParams.get('secret')
    
    const providedSecret = authHeader?.replace('Bearer ', '') || secretParam
    
    if (CRON_SECRET && providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const results = {
      reminders: {
        sevenDay: 0,
        threeDay: 0,
        oneDay: 0,
      },
      expired: 0,
      errors: [] as string[],
    }

    // Calculate reminder dates
    const sevenDaysFromNow = new Date(now)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    
    const oneDayFromNow = new Date(now)
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1)

    // Helper to check if date is within a day range
    const isWithinDay = (date: Date, targetDate: Date) => {
      const start = new Date(targetDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(targetDate)
      end.setHours(23, 59, 59, 999)
      return date >= start && date <= end
    }

    // 1. Find active subscriptions and process reminders
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        profile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                email: true,
              },
            },
          },
        },
      },
    })

    for (const subscription of activeSubscriptions) {
      const endDate = new Date(subscription.endDate)
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const userId = subscription.profile.user.id

      // Determine which reminder to send
      let reminderType: '7_day' | '3_day' | '1_day' | null = null
      let reminderMessage = ''

      if (isWithinDay(endDate, sevenDaysFromNow)) {
        reminderType = '7_day'
        reminderMessage = `Your subscription expires in 7 days (${endDate.toLocaleDateString('en-KE')}). Renew now to avoid interruption.`
        results.reminders.sevenDay++
      } else if (isWithinDay(endDate, threeDaysFromNow)) {
        reminderType = '3_day'
        reminderMessage = `Your subscription expires in 3 days! Renew now to keep your premium features.`
        results.reminders.threeDay++
      } else if (isWithinDay(endDate, oneDayFromNow)) {
        reminderType = '1_day'
        reminderMessage = `URGENT: Your subscription expires tomorrow! Renew now to avoid losing access.`
        results.reminders.oneDay++
      }

      if (reminderType) {
        // Check if we already sent this type of reminder
        const existingReminder = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'SUBSCRIPTION',
            metadata: {
              contains: `"reminderType":"${reminderType}"`,
            },
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Within last 24 hours
            },
          },
        })

        if (!existingReminder) {
          try {
            await prisma.notification.create({
              data: {
                userId,
                type: 'SUBSCRIPTION',
                title: 'Subscription Renewal Reminder',
                message: reminderMessage,
                metadata: JSON.stringify({
                  subscriptionId: subscription.id,
                  reminderType,
                  daysRemaining,
                  endDate: subscription.endDate,
                }),
              },
            })
            logger.info('Sent renewal reminder', { 
              userId, 
              subscriptionId: subscription.id, 
              reminderType,
              daysRemaining,
            })
          } catch (err) {
            const errorMsg = `Failed to create reminder for subscription ${subscription.id}`
            logger.error(errorMsg, err)
            results.errors.push(errorMsg)
          }
        }
      }
    }

    // 2. Find and expire overdue subscriptions
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: now,
        },
      },
      include: {
        profile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
              },
            },
          },
        },
      },
    })

    for (const subscription of expiredSubscriptions) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) => {
          // Mark subscription as expired
          await tx.subscription.update({
            where: { id: subscription.id },
            data: { status: 'EXPIRED' },
          })

          // Create expiration notification
          await tx.notification.create({
            data: {
              userId: subscription.profile.user.id,
              type: 'SUBSCRIPTION',
              title: 'Subscription Expired',
              message: `Your ${subscription.plan.toLowerCase()} subscription has expired. Renew now to restore your premium features and visibility.`,
              metadata: JSON.stringify({
                subscriptionId: subscription.id,
                expiredAt: now.toISOString(),
                plan: subscription.plan,
              }),
            },
          })
        })

        results.expired++
        logger.info('Expired subscription', { 
          subscriptionId: subscription.id, 
          userId: subscription.profile.user.id,
        })
      } catch (err) {
        const errorMsg = `Failed to expire subscription ${subscription.id}`
        logger.error(errorMsg, err)
        results.errors.push(errorMsg)
      }
    }

    logger.info('Subscription processing completed', results)

    return NextResponse.json({
      success: true,
      message: 'Subscription processing completed',
      results,
      processedAt: now.toISOString(),
    })
  } catch (error) {
    logger.error('Failed to process subscriptions', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET - Get subscription status summary (for monitoring)
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const secretParam = searchParams.get('secret')
    
    const providedSecret = authHeader?.replace('Bearer ', '') || secretParam
    
    if (CRON_SECRET && providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const sevenDaysFromNow = new Date(now)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    // Get subscription counts by status
    const statusCounts = await prisma.subscription.groupBy({
      by: ['status'],
      _count: true,
    })

    // Get subscriptions expiring soon
    const expiringSoon = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
    })

    // Get already expired but not yet processed
    const pendingExpiration = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: now,
        },
      },
    })

    return NextResponse.json({
      statusCounts: statusCounts.reduce((acc: Record<string, number>, item: { status: string; _count: number }) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>),
      expiringSoon,
      pendingExpiration,
      checkedAt: now.toISOString(),
    })
  } catch (error) {
    logger.error('Failed to get subscription status', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
