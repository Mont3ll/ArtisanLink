import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Get unread message count
export async function GET() {
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

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: user.id,
        status: { not: 'READ' }
      }
    })

    // Get unread count by conversation
    const unreadByConversation = await prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        receiverId: user.id,
        status: { not: 'READ' }
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      total: unreadCount,
      byConversation: unreadByConversation.map((item: { conversationId: string; _count: { id: number } }) => ({
        conversationId: item.conversationId,
        count: item._count.id
      }))
    })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
