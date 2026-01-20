import { 
  UserStatus, 
  ConversationStatus, 
  MessageStatus 
} from '../../app/generated/prisma'
import { prisma, SeedResult, BATCH_SIZE } from './client'
import { MESSAGE_TEMPLATES } from './data'
import { 
  randomElement, 
  randomInt,
  randomDate,
  processBatch,
  log,
  logSuccess
} from './utils'

type UserWithProfile = {
  id: string
  status: UserStatus
  profile: {
    id: string
    isAvailable: boolean | null
  } | null
}

// ============================================================================
// SEED CONVERSATIONS AND MESSAGES
// ============================================================================

export async function seedConversations(
  artisans: UserWithProfile[],
  clients: UserWithProfile[],
  count = 80
): Promise<{ conversations: Awaited<ReturnType<typeof prisma.conversation.create>>[] } & SeedResult> {
  log('💬', `Creating ${count} conversations...`)
  
  const availableArtisans = artisans.filter(a => a.profile?.isAvailable)
  const activeClients = clients.filter(c => c.status === UserStatus.ACTIVE)
  
  // Track used pairs to avoid duplicate conversations
  const usedPairs = new Set<string>()
  const convData: { clientId: string; artisanId: string }[] = []
  
  for (let i = 0; i < count && convData.length < count; i++) {
    const client = randomElement(activeClients)
    const artisan = randomElement(availableArtisans)
    const pairKey = `${client.id}-${artisan.id}`
    
    if (!usedPairs.has(pairKey)) {
      usedPairs.add(pairKey)
      convData.push({ clientId: client.id, artisanId: artisan.id })
    }
  }
  
  const conversations = await processBatch(
    convData,
    BATCH_SIZE,
    async (data) => {
      return prisma.conversation.create({
        data: {
          clientId: data.clientId,
          artisanId: data.artisanId,
          status: randomElement([ConversationStatus.ACTIVE, ConversationStatus.ACTIVE, ConversationStatus.ACTIVE, ConversationStatus.ARCHIVED]),
          subject: randomElement([
            'Project Inquiry',
            'Quote Request',
            'Availability Check',
            'Service Question',
            'Booking Request',
            null
          ]),
          lastMessageAt: randomDate(30),
        }
      })
    }
  )
  
  logSuccess('Created conversations', conversations.length)
  
  return {
    conversations,
    name: 'Conversations',
    count: conversations.length
  }
}

export async function seedMessages(
  conversations: Awaited<ReturnType<typeof prisma.conversation.create>>[],
  artisans: { id: string }[],
  clients: { id: string }[]
): Promise<SeedResult> {
  log('📨', 'Creating messages...')
  
  const messageData: Array<{
    conversationId: string
    senderId: string
    receiverId: string
    content: string
    messageIndex: number
    totalMessages: number
    lastMessageAt: Date
  }> = []
  
  for (const conv of conversations) {
    const numMessages = randomInt(2, 8)
    const client = clients.find(c => c.id === conv.clientId)!
    const artisan = artisans.find(a => a.id === conv.artisanId)!
    
    for (let i = 0; i < numMessages; i++) {
      const isClientMessage = i % 2 === 0
      const sender = isClientMessage ? client : artisan
      const receiver = isClientMessage ? artisan : client
      
      let content: string
      if (i === 0) content = randomElement(MESSAGE_TEMPLATES.clientFirst)
      else if (i === 1) content = randomElement(MESSAGE_TEMPLATES.artisanReply)
      else if (i % 2 === 0) content = randomElement(MESSAGE_TEMPLATES.clientFollowUp)
      else content = randomElement(MESSAGE_TEMPLATES.artisanFollowUp)
      
      messageData.push({
        conversationId: conv.id,
        senderId: sender.id,
        receiverId: receiver.id,
        content,
        messageIndex: i,
        totalMessages: numMessages,
        lastMessageAt: conv.lastMessageAt!
      })
    }
  }
  
  const messages = await processBatch(
    messageData,
    BATCH_SIZE * 2,
    async (data) => {
      const createdAt = new Date(data.lastMessageAt.getTime() - (data.totalMessages - data.messageIndex) * randomInt(1, 24) * 60 * 60 * 1000)
      
      return prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          status: data.messageIndex < data.totalMessages - 1 
            ? MessageStatus.READ 
            : randomElement([MessageStatus.SENT, MessageStatus.DELIVERED, MessageStatus.READ]),
          createdAt,
          readAt: data.messageIndex < data.totalMessages - 1 
            ? new Date(createdAt.getTime() + randomInt(1, 12) * 60 * 60 * 1000) 
            : null,
        }
      })
    }
  )
  
  logSuccess('Created messages', messages.length)
  
  return {
    name: 'Messages',
    count: messages.length
  }
}
