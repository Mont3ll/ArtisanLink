import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface Conversation {
  id: string
  clientId: string
  artisanId: string
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED'
  subject: string | null
  createdAt: string
  updatedAt: string
  lastMessageAt: string | null
  client: {
    id: string
    firstName: string
    lastName: string
    profile?: {
      profileImage: string | null
    } | null
  }
  artisan: {
    id: string
    firstName: string
    lastName: string
    profile?: {
      profileImage: string | null
      profession: string | null
    } | null
  }
  lastMessage?: {
    id: string
    content: string
    createdAt: string
    senderId: string
    status: 'SENT' | 'DELIVERED' | 'READ'
  } | null
}

export interface ConversationsResponse {
  conversations: Conversation[]
  unreadCount: number
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ConversationFilters {
  page?: number
  limit?: number
  status?: 'ACTIVE' | 'ARCHIVED'
}

// Query keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: ConversationFilters) => [...conversationKeys.lists(), filters] as const,
  detail: (id: string) => [...conversationKeys.all, 'detail', id] as const,
}

// Fetch conversations
async function fetchConversations(filters: ConversationFilters): Promise<ConversationsResponse> {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 20),
    status: filters.status ?? 'ACTIVE',
  })

  const response = await fetch(`/api/conversations?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch conversations')
  }
  return response.json()
}

/**
 * Hook to fetch conversations
 */
export function useConversations(filters: ConversationFilters = {}) {
  return useQuery({
    queryKey: conversationKeys.list(filters),
    queryFn: () => fetchConversations(filters),
  })
}

/**
 * Hook to archive a conversation
 */
export function useArchiveConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      })
      if (!response.ok) throw new Error('Failed to archive conversation')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })
    },
  })
}

/**
 * Hook to create a new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      artisanId: string
      subject?: string
      initialMessage?: string
    }) => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artisanId: params.artisanId.trim(),
          subject: params.subject?.trim() || undefined,
          initialMessage: params.initialMessage?.trim() || undefined,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create conversation')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })
    },
  })
}
