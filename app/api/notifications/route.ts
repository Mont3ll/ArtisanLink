import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'

// NotificationType enum - defined locally as Prisma client wasn't regenerated
// This matches the enum in prisma/schema.prisma
const NotificationType = {
  SYSTEM: 'SYSTEM',
  MESSAGE: 'MESSAGE',
  REVIEW: 'REVIEW',
  PAYMENT: 'PAYMENT',
  VERIFICATION: 'VERIFICATION',
  SUBSCRIPTION: 'SUBSCRIPTION',
  BOOKING: 'BOOKING',
} as const
type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

const logger = createLogger('api/notifications')

// Validation schema for creating a notification
const createNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  data: z.record(z.string(), z.unknown()).optional(),
  linkUrl: z.string().url().optional(),
})

// GET - List notifications for the current user
export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 50)
    const skip = (page - 1) * limit
    const unreadOnly = searchParams.get('unread') === 'true'
    const type = searchParams.get('type') as NotificationType | null

    // Build where clause
    const where: {
      userId: string
      isRead?: boolean
      type?: NotificationType
    } = { userId: user.id }

    if (unreadOnly) {
      where.isRead = false
    }
    if (type && Object.values(NotificationType).includes(type)) {
      where.type = type
    }

    // Get notifications
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ])

    return NextResponse.json({
      items: notifications.map((n: {
        id: string
        type: string
        title: string
        message: string
        data: unknown
        linkUrl: string | null
        isRead: boolean
        createdAt: Date
        readAt: Date | null
      }) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data,
        linkUrl: n.linkUrl,
        isRead: n.isRead,
        createdAt: n.createdAt,
        readAt: n.readAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    })
  } catch (error) {
    logger.error('Failed to fetch notifications', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a notification (admin/system use)
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get requesting user
    const requestingUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!requestingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only admins can create notifications for other users
    // Regular users can only create notifications for themselves (e.g., test notifications)
    
    // Parse and validate body
    const body = await request.json()
    const validation = createNotificationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Only allow creating notifications for self unless admin
    if (data.userId !== requestingUser.id && requestingUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to create notifications for other users' },
        { status: 403 }
      )
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        linkUrl: data.linkUrl,
      },
    })

    return NextResponse.json(
      {
        message: 'Notification created successfully',
        id: notification.id,
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Failed to create notification', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
