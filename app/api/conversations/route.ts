import { NextResponse } from 'next/server'
import { cachedJsonResponse, CACHE_DURATIONS, STALE_DURATIONS } from '@/lib/cache'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating conversation
const createConversationSchema = z.object({
  artisanId: z.string().cuid(),
  subject: z.string().max(200).optional(),
  initialMessage: z.string().min(1).max(5000).optional()
})

// GET - List conversations for authenticated user
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'ACTIVE' | 'ARCHIVED' | 'BLOCKED' | null
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const clampedPage = Math.max(1, page)
    const clampedLimit = Math.min(Math.max(1, limit), 50)
    const skip = (clampedPage - 1) * clampedLimit

    // Build where clause based on user role
    const where: Record<string, unknown> = user.role === 'ARTISAN' 
      ? { artisanId: user.id }
      : { clientId: user.id }

    if (status) {
      where.status = status
    }

    // Get conversations with last message
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profile: {
                select: {
                  profileImage: true
                }
              }
            }
          },
          artisan: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profile: {
                select: {
                  profileImage: true,
                  profession: true
                }
              }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
              status: true
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: clampedLimit
      }),
      prisma.conversation.count({ where })
    ])

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: user.id,
        status: { not: 'READ' }
      }
    })

    return cachedJsonResponse({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conversations: conversations.map((conv: any) => ({
        ...conv,
        lastMessage: conv.messages[0] || null,
        messages: undefined // Remove messages array from response
      })),
      unreadCount,
      pagination: {
        page: clampedPage,
        limit: clampedLimit,
        total,
        totalPages: Math.ceil(total / clampedLimit)
      }
    }, { maxAge: CACHE_DURATIONS.SHORT, staleWhileRevalidate: STALE_DURATIONS.SHORT })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new conversation (client only)
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only clients can start conversations
    if (user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Only clients can start conversations' },
        { status: 403 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = createConversationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify artisan exists and is verified
    const artisan = await prisma.user.findUnique({
      where: { id: data.artisanId },
      include: { profile: true }
    })

    if (!artisan || artisan.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })
    }

    if (artisan.profile?.artisanStatus !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Cannot message unverified artisan' },
        { status: 400 }
      )
    }

    // Check for existing conversation
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        clientId_artisanId: {
          clientId: user.id,
          artisanId: data.artisanId
        }
      }
    })

    if (existingConversation) {
      // If archived, reactivate it
      if (existingConversation.status === 'ARCHIVED') {
        await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { status: 'ACTIVE' }
        })
      }
      return cachedJsonResponse(existingConversation, { maxAge: CACHE_DURATIONS.SHORT, staleWhileRevalidate: STALE_DURATIONS.SHORT })
    }

    // Create conversation with optional initial message
    const conversation = await prisma.conversation.create({
      data: {
        clientId: user.id,
        artisanId: data.artisanId,
        subject: data.subject,
        lastMessageAt: data.initialMessage ? new Date() : null,
        messages: data.initialMessage ? {
          create: {
            senderId: user.id,
            receiverId: data.artisanId,
            content: data.initialMessage
          }
        } : undefined
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        artisan: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profession: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
