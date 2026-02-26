import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationKeys } from './use-conversations'

// Types
export interface MessageSender {
  id: string
  firstName: string
  lastName: string
  profile?: {
    profileImage: string | null
  } | null
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  status: 'SENT' | 'DELIVERED' | 'READ'
  attachmentUrls: string[]
  createdAt: string
  readAt: string | null
  sender: MessageSender
}

export interface ConversationParticipant {
  id: string
  firstName: string
  lastName: string
  profile?: {
    profileImage: string | null
    profession?: string | null
  } | null
}

export interface ConversationDetail {
  id: string
  clientId: string
  artisanId: string
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED'
  subject: string | null
  createdAt: string
  client: ConversationParticipant
  artisan: ConversationParticipant
  messages: Message[]
}

export interface MessagesResponse {
  messages: Message[]
  nextCursor: string | null
}

export interface SendMessageData {
  content: string
  attachmentUrls?: string[]
}

// Query keys
export const conversationMessagesKeys = {
  all: ['conversation-messages'] as const,
  detail: (id: string) => [...conversationMessagesKeys.all, 'detail', id] as const,
  messages: (id: string) => [...conversationMessagesKeys.all, 'messages', id] as const,
}

// Fetch conversation with messages
async function fetchConversation(id: string): Promise<ConversationDetail> {
  const response = await fetch(`/api/conversations/${id}`)
  
  if (response.status === 404) {
    throw new Error('Conversation not found')
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch conversation')
  }
  
  return response.json()
}

// Fetch messages only (for polling)
async function fetchMessages(id: string, limit: number = 50): Promise<MessagesResponse> {
  const response = await fetch(`/api/conversations/${id}/messages?limit=${limit}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch messages')
  }
  
  return response.json()
}

// Send message
async function sendMessage(conversationId: string, data: SendMessageData): Promise<Message> {
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error('Failed to send message')
  }
  
  return response.json()
}

// Update conversation status
async function updateConversationStatus(
  id: string, 
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED'
): Promise<{ id: string; status: string }> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update conversation')
  }
  
  return response.json()
}

/**
 * Hook to fetch conversation details with messages
 */
export function useConversation(id: string) {
  return useQuery({
    queryKey: conversationMessagesKeys.detail(id),
    queryFn: () => fetchConversation(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (error instanceof Error && error.message === 'Conversation not found') {
        return false
      }
      return failureCount < 3
    },
  })
}

/**
 * Hook to poll messages for real-time updates
 */
export function useConversationMessages(
  conversationId: string, 
  options?: { 
    enabled?: boolean
    refetchInterval?: number 
  }
) {
  return useQuery({
    queryKey: conversationMessagesKeys.messages(conversationId),
    queryFn: () => fetchMessages(conversationId),
    enabled: options?.enabled !== false && !!conversationId,
    refetchInterval: options?.refetchInterval ?? 5000, // Poll every 5 seconds by default
    // Keep previous data while refetching for smoother UX
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook to send a message with optimistic update
 */
export function useSendMessage(conversationId: string, currentUserId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SendMessageData) => sendMessage(conversationId, data),
    onMutate: async (newMessageData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: conversationMessagesKeys.messages(conversationId) 
      })
      await queryClient.cancelQueries({ 
        queryKey: conversationMessagesKeys.detail(conversationId) 
      })
      
      // Snapshot previous values
      const previousMessages = queryClient.getQueryData<MessagesResponse>(
        conversationMessagesKeys.messages(conversationId)
      )
      const previousConversation = queryClient.getQueryData<ConversationDetail>(
        conversationMessagesKeys.detail(conversationId)
      )
      
      // Determine sender/receiver based on who is actually sending
      const isClient = previousConversation?.clientId === currentUserId
      const senderParticipant = isClient ? previousConversation?.client : previousConversation?.artisan
      
      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: currentUserId,
        receiverId: isClient
          ? previousConversation?.artisanId || ''
          : previousConversation?.clientId || '',
        content: newMessageData.content,
        status: 'SENT',
        attachmentUrls: newMessageData.attachmentUrls || [],
        createdAt: new Date().toISOString(),
        readAt: null,
        sender: {
          id: currentUserId,
          firstName: senderParticipant?.firstName || '',
          lastName: senderParticipant?.lastName || '',
          profile: senderParticipant?.profile,
        },
      }
      
      // Optimistically update messages
      if (previousMessages) {
        queryClient.setQueryData<MessagesResponse>(
          conversationMessagesKeys.messages(conversationId),
          {
            ...previousMessages,
            messages: [...previousMessages.messages, optimisticMessage],
          }
        )
      }
      
      // Optimistically update conversation detail
      if (previousConversation) {
        queryClient.setQueryData<ConversationDetail>(
          conversationMessagesKeys.detail(conversationId),
          {
            ...previousConversation,
            messages: [...previousConversation.messages, optimisticMessage],
          }
        )
      }
      
      return { previousMessages, previousConversation, optimisticMessage }
    },
    onError: (_err, _newMessage, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          conversationMessagesKeys.messages(conversationId),
          context.previousMessages
        )
      }
      if (context?.previousConversation) {
        queryClient.setQueryData(
          conversationMessagesKeys.detail(conversationId),
          context.previousConversation
        )
      }
    },
    onSuccess: (sentMessage, _variables, context) => {
      // Replace optimistic message with real one
      const updateMessages = (messages: Message[]) =>
        messages.map((m) =>
          m.id === context?.optimisticMessage.id ? sentMessage : m
        )
      
      queryClient.setQueryData<MessagesResponse>(
        conversationMessagesKeys.messages(conversationId),
        (old) => old ? { ...old, messages: updateMessages(old.messages) } : old
      )
      
      queryClient.setQueryData<ConversationDetail>(
        conversationMessagesKeys.detail(conversationId),
        (old) => old ? { ...old, messages: updateMessages(old.messages) } : old
      )
      
      // Invalidate conversations list to update last message
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
    },
  })
}

/**
 * Hook to archive a conversation
 */
export function useArchiveConversationDetail(conversationId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => updateConversationStatus(conversationId, 'ARCHIVED'),
    onSuccess: () => {
      // Update conversation detail
      queryClient.setQueryData<ConversationDetail>(
        conversationMessagesKeys.detail(conversationId),
        (old) => old ? { ...old, status: 'ARCHIVED' } : old
      )
      
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
    },
  })
}
