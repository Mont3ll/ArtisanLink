import { useQuery } from '@tanstack/react-query'

// Types
interface UnreadResponse {
  total: number
  byConversation: {
    conversationId: string
    count: number
  }[]
}

// Query keys
export const unreadMessagesKeys = {
  all: ['unread-messages'] as const,
  count: () => [...unreadMessagesKeys.all, 'count'] as const,
}

// Fetch function
async function fetchUnreadCount(): Promise<UnreadResponse> {
  const response = await fetch('/api/conversations/unread')
  
  if (!response.ok) {
    throw new Error('Failed to fetch unread count')
  }
  
  return response.json()
}

/**
 * Hook to fetch unread message count
 * Polls every 30 seconds to keep the count updated
 */
export function useUnreadMessages() {
  return useQuery({
    queryKey: unreadMessagesKeys.count(),
    queryFn: fetchUnreadCount,
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    refetchOnWindowFocus: true,
  })
}

/**
 * Get just the total unread count (convenience hook)
 */
export function useUnreadCount() {
  const { data, ...rest } = useUnreadMessages()
  return {
    count: data?.total ?? 0,
    ...rest,
  }
}
