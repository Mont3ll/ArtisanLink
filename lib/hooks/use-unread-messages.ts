import { useQuery } from '@tanstack/react-query'

// Types
interface UnreadResponse {
  total: number
  byConversation: {
    conversationId: string
    count: number
  }[]
}

// Default value
const defaultUnreadResponse: UnreadResponse = {
  total: 0,
  byConversation: [],
}

// Query keys
export const unreadMessagesKeys = {
  all: ['unread-messages'] as const,
  count: () => [...unreadMessagesKeys.all, 'count'] as const,
}

// Fetch function
async function fetchUnreadCount(): Promise<UnreadResponse> {
  try {
    const response = await fetch('/api/conversations/unread')
    
    // Handle 403/404 gracefully
    if (response.status === 403 || response.status === 404) {
      // Don't log warning for unread count - it's called frequently
      return defaultUnreadResponse
    }
    
    if (!response.ok) {
      // Return default silently for server errors (500, etc.) — unread count is non-critical
      return defaultUnreadResponse
    }
    
    return response.json()
  } catch {
    return defaultUnreadResponse
  }
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
