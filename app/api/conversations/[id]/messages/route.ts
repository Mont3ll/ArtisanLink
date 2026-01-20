import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating message
const createMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  attachmentUrls: z.array(z.string().url()).optional().default([])
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET - Get messages for a conversation with pagination
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
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

    // Get conversation to verify access
    const conversation = await prisma.conversation.findUnique({
      where: { id }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify user is participant
    if (conversation.clientId !== user.id && conversation.artisanId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params for pagination
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor') // Message ID to paginate from
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const clampedLimit = Math.min(Math.max(1, limit), 100)

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1 // Skip the cursor itself
      }),
      take: clampedLimit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
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
        }
      }
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        receiverId: user.id,
        status: { not: 'READ' }
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    })

    const nextCursor = messages.length === clampedLimit 
      ? messages[messages.length - 1].id 
      : null

    return NextResponse.json({
      messages: messages.reverse(), // Return in chronological order
      nextCursor
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Send a message
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
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

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify user is participant
    if (conversation.clientId !== user.id && conversation.artisanId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if conversation is blocked
    if (conversation.status === 'BLOCKED') {
      return NextResponse.json(
        { error: 'Cannot send messages to blocked conversation' },
        { status: 400 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = createMessageSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Determine receiver
    const receiverId = user.id === conversation.clientId 
      ? conversation.artisanId 
      : conversation.clientId

    // Fetch receiver to determine their role for the notification link
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, role: true }
    })

    // Create message and update conversation
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          receiverId,
          content: data.content,
          attachmentUrls: data.attachmentUrls
        },
        include: {
          sender: {
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
          }
        }
      }),
      prisma.conversation.update({
        where: { id },
        data: { 
          lastMessageAt: new Date(),
          // Reactivate if archived
          ...(conversation.status === 'ARCHIVED' && { status: 'ACTIVE' })
        }
      })
    ])

    // Create notification for the receiver
    if (receiver) {
      const senderName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Someone'
      const messagePreview = data.content.length > 50 
        ? data.content.substring(0, 50) + '...' 
        : data.content
      
      // Determine dashboard path based on receiver's role
      const dashboardPath = receiver.role === 'ARTISAN' 
        ? '/artisan-dashboard/messages' 
        : '/client-dashboard/messages'
      
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'MESSAGE',
          title: `New message from ${senderName}`,
          message: messagePreview,
          linkUrl: `${dashboardPath}?conversation=${id}`
        }
      })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
