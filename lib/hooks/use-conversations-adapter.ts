/**
 * Conversations Adapter
 * Maps real API Conversation → SourceConversationThread for DashboardMessagesPane.
 */
import { useConversations } from './use-conversations'
import type { Conversation } from './use-conversations'

type SourceStatus = 'PENDING' | 'QUOTED' | 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'VERIFIED'

export interface SourceConversationThread {
  id: string
  conversationId: string
  title: string
  status: SourceStatus
  artisan: string
  client: string
  profession: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  description: string
  budget: string
  quote: string
  location: string
}

export function mapConversationStatus(status: Conversation['status']): SourceStatus {
  switch (status) {
    case 'ACTIVE': return 'ACTIVE'
    case 'ARCHIVED': return 'COMPLETED'
    case 'BLOCKED': return 'REVIEW'
    default: return 'ACTIVE'
  }
}

export function getContactName(conv: Conversation, currentUserId: string): string {
  if (conv.artisanId === currentUserId) {
    return `${conv.client.firstName} ${conv.client.lastName}`
  }
  return `${conv.artisan.firstName} ${conv.artisan.lastName}`
}

export function mapConversationToThread(
  conv: Conversation,
  currentUserId: string,
): SourceConversationThread {
  const clientName = `${conv.client.firstName} ${conv.client.lastName}`
  const artisanName = `${conv.artisan.firstName} ${conv.artisan.lastName}`
  const title = conv.subject || getContactName(conv, currentUserId)

  return {
    id: conv.id,
    conversationId: conv.id,
    title,
    status: mapConversationStatus(conv.status),
    artisan: artisanName,
    client: clientName,
    profession: conv.artisan.profile?.profession ?? null,
    lastMessage: conv.lastMessage?.content ?? null,
    lastMessageAt: conv.lastMessageAt,
    description: conv.lastMessage?.content ?? 'No messages yet',
    budget: '',
    quote: '',
    location: '',
  }
}

export function useConversationsAdapter(currentUserId: string | null) {
  const { data, isLoading, error } = useConversations({ limit: 20 })
  const threads: SourceConversationThread[] = (data?.conversations ?? []).map((conv) =>
    mapConversationToThread(conv, currentUserId ?? ''),
  )
  return { threads, isLoading, error, unreadCount: data?.unreadCount ?? 0 }
}
