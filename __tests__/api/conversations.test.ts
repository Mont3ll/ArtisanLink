/**
 * Tests for Conversations API routes
 * 
 * Covers:
 * - GET /api/conversations - List conversations
 * - POST /api/conversations - Create conversation
 * - GET /api/conversations/[id] - Get single conversation
 * - PATCH /api/conversations/[id] - Update conversation status
 * - DELETE /api/conversations/[id] - Archive conversation
 * - GET /api/conversations/[id]/messages - Get messages
 * - POST /api/conversations/[id]/messages - Send message
 * - GET /api/conversations/unread - Get unread count
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    conversation: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    message: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

// Import mocked modules
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Import route handlers after mocks
import { GET as conversationsGET, POST as conversationsPOST } from '@/app/api/conversations/route'
import { GET as conversationByIdGET, PATCH as conversationByIdPATCH, DELETE as conversationByIdDELETE } from '@/app/api/conversations/[id]/route'
import { GET as messagesGET, POST as messagesPOST } from '@/app/api/conversations/[id]/messages/route'
import { GET as unreadGET } from '@/app/api/conversations/unread/route'

// Helper to create route params
const createParams = (id: string) => ({ params: Promise.resolve({ id }) })

describe('Conversations API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===========================================
  // GET /api/conversations - List conversations
  // ===========================================
  describe('GET /api/conversations', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/conversations')
      const response = await conversationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/conversations')
      const response = await conversationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should return conversations for client user', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversations = [
        {
          id: 'conv_1',
          clientId: 'user_1',
          artisanId: 'artisan_1',
          status: 'ACTIVE',
          client: { id: 'user_1', firstName: 'John', lastName: 'Client', profile: null },
          artisan: { id: 'artisan_1', firstName: 'Jane', lastName: 'Artisan', profile: { profession: 'Carpenter' } },
          messages: [{ id: 'msg_1', content: 'Hello', createdAt: new Date(), senderId: 'user_1', status: 'SENT' }],
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findMany).mockResolvedValue(mockConversations as never)
      vi.mocked(prisma.conversation.count).mockResolvedValue(1)
      vi.mocked(prisma.message.count).mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/conversations')
      const response = await conversationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.conversations).toHaveLength(1)
      expect(data.conversations[0].lastMessage).toBeDefined()
      expect(data.pagination.total).toBe(1)
    })

    it('should return conversations for artisan user', async () => {
      const mockUser = { id: 'artisan_1', clerkId: 'clerk_456', role: 'ARTISAN' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_456' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findMany).mockResolvedValue([])
      vi.mocked(prisma.conversation.count).mockResolvedValue(0)
      vi.mocked(prisma.message.count).mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/conversations')
      const response = await conversationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.conversations).toHaveLength(0)
    })

    it('should filter by status', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findMany).mockResolvedValue([])
      vi.mocked(prisma.conversation.count).mockResolvedValue(0)
      vi.mocked(prisma.message.count).mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/conversations?status=ARCHIVED')
      const response = await conversationsGET(request)

      expect(response.status).toBe(200)
      expect(prisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ARCHIVED' }),
        })
      )
    })

    it('should support pagination', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findMany).mockResolvedValue([])
      vi.mocked(prisma.conversation.count).mockResolvedValue(100)
      vi.mocked(prisma.message.count).mockResolvedValue(5)

      const request = new Request('http://localhost:3000/api/conversations?page=2&limit=10')
      const response = await conversationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.totalPages).toBe(10)
      expect(data.unreadCount).toBe(5)
    })
  })

  // ===========================================
  // POST /api/conversations - Create conversation
  // ===========================================
  describe('POST /api/conversations', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ artisanId: 'artisan_1' }),
      })
      const response = await conversationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when non-client tries to create conversation', async () => {
      const mockUser = { id: 'artisan_1', clerkId: 'clerk_123', role: 'ARTISAN' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ artisanId: 'clxyz123456789012345678' }),
      })
      const response = await conversationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Only clients can start conversations')
    })

    it('should return 400 for invalid artisan ID format', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ artisanId: 'invalid' }),
      })
      const response = await conversationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should return 404 when artisan not found', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as never) // requesting user
        .mockResolvedValueOnce(null) // artisan not found

      const request = new Request('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ artisanId: 'clxyz123456789012345678' }),
      })
      const response = await conversationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Artisan not found')
    })

    it('should return 400 when artisan is not verified', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockArtisan = { 
        id: 'clxyz123456789012345678', 
        role: 'ARTISAN',
        profile: { artisanStatus: 'PENDING' }
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as never)
        .mockResolvedValueOnce(mockArtisan as never)

      const request = new Request('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ artisanId: 'clxyz123456789012345678' }),
      })
      const response = await conversationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Cannot message unverified artisan')
    })

    it('should return existing conversation if one exists', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockArtisan = { 
        id: 'clxyz123456789012345678', 
        role: 'ARTISAN',
        profile: { artisanStatus: 'VERIFIED' }
      }
      const existingConversation = { id: 'conv_1', status: 'ACTIVE' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as never)
        .mockResolvedValueOnce(mockArtisan as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(existingConversation as never)

      const request = new Request('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ artisanId: 'clxyz123456789012345678' }),
      })
      const response = await conversationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('conv_1')
    })

    it('should reactivate archived conversation', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockArtisan = { 
        id: 'clxyz123456789012345678', 
        role: 'ARTISAN',
        profile: { artisanStatus: 'VERIFIED' }
      }
      const archivedConversation = { id: 'conv_1', status: 'ARCHIVED' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as never)
        .mockResolvedValueOnce(mockArtisan as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(archivedConversation as never)
      vi.mocked(prisma.conversation.update).mockResolvedValue({ ...archivedConversation, status: 'ACTIVE' } as never)

      const request = new Request('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ artisanId: 'clxyz123456789012345678' }),
      })
      const response = await conversationsPOST(request)

      expect(response.status).toBe(200)
      expect(prisma.conversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conv_1' },
          data: { status: 'ACTIVE' },
        })
      )
    })

    it('should create new conversation successfully', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockArtisan = { 
        id: 'clxyz123456789012345678', 
        role: 'ARTISAN',
        profile: { artisanStatus: 'VERIFIED' }
      }
      const newConversation = {
        id: 'conv_new',
        clientId: 'user_1',
        artisanId: 'clxyz123456789012345678',
        client: { id: 'user_1', firstName: 'John', lastName: 'Client' },
        artisan: { id: 'clxyz123456789012345678', firstName: 'Jane', lastName: 'Artisan', profile: { profession: 'Carpenter' } },
        messages: [],
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as never)
        .mockResolvedValueOnce(mockArtisan as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.conversation.create).mockResolvedValue(newConversation as never)

      const request = new Request('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ 
          artisanId: 'clxyz123456789012345678',
          subject: 'Project inquiry',
          initialMessage: 'Hello, I need your services'
        }),
      })
      const response = await conversationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('conv_new')
    })
  })

  // ===========================================
  // GET /api/conversations/[id] - Get single conversation
  // ===========================================
  describe('GET /api/conversations/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1')
      const response = await conversationByIdGET(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when conversation not found', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/conversations/conv_1')
      const response = await conversationByIdGET(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Conversation not found')
    })

    it('should return 403 when user is not a participant', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = {
        id: 'conv_1',
        clientId: 'other_user',
        artisanId: 'artisan_1',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1')
      const response = await conversationByIdGET(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return conversation with messages and mark as read', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = {
        id: 'conv_1',
        clientId: 'user_1',
        artisanId: 'artisan_1',
        client: { id: 'user_1', firstName: 'John', lastName: 'Client', profile: null },
        artisan: { id: 'artisan_1', firstName: 'Jane', lastName: 'Artisan', profile: { profession: 'Carpenter' } },
        messages: [
          { id: 'msg_1', content: 'Hello', sender: { id: 'user_1', firstName: 'John', lastName: 'Client' } },
        ],
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)
      vi.mocked(prisma.message.updateMany).mockResolvedValue({ count: 1 } as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1')
      const response = await conversationByIdGET(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('conv_1')
      expect(data.messages).toHaveLength(1)
      expect(prisma.message.updateMany).toHaveBeenCalled()
    })
  })

  // ===========================================
  // PATCH /api/conversations/[id] - Update conversation status
  // ===========================================
  describe('PATCH /api/conversations/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ARCHIVED' }),
      })
      const response = await conversationByIdPATCH(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when conversation not found', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/conversations/conv_1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ARCHIVED' }),
      })
      const response = await conversationByIdPATCH(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Conversation not found')
    })

    it('should return 403 when user is not a participant', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = { id: 'conv_1', clientId: 'other_user', artisanId: 'artisan_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ARCHIVED' }),
      })
      const response = await conversationByIdPATCH(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return 400 for invalid status', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = { id: 'conv_1', clientId: 'user_1', artisanId: 'artisan_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'INVALID' }),
      })
      const response = await conversationByIdPATCH(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid status')
    })

    it('should update conversation status successfully', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = { id: 'conv_1', clientId: 'user_1', artisanId: 'artisan_1', status: 'ACTIVE' }
      const updatedConversation = { ...mockConversation, status: 'ARCHIVED' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)
      vi.mocked(prisma.conversation.update).mockResolvedValue(updatedConversation as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ARCHIVED' }),
      })
      const response = await conversationByIdPATCH(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('ARCHIVED')
    })
  })

  // ===========================================
  // DELETE /api/conversations/[id] - Archive conversation
  // ===========================================
  describe('DELETE /api/conversations/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1', {
        method: 'DELETE',
      })
      const response = await conversationByIdDELETE(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when conversation not found', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/conversations/conv_1', {
        method: 'DELETE',
      })
      const response = await conversationByIdDELETE(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Conversation not found')
    })

    it('should return 403 when user is not a participant', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = { id: 'conv_1', clientId: 'other_user', artisanId: 'artisan_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1', {
        method: 'DELETE',
      })
      const response = await conversationByIdDELETE(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should archive conversation successfully', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = { id: 'conv_1', clientId: 'user_1', artisanId: 'artisan_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)
      vi.mocked(prisma.conversation.update).mockResolvedValue({ ...mockConversation, status: 'ARCHIVED' } as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1', {
        method: 'DELETE',
      })
      const response = await conversationByIdDELETE(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(prisma.conversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'ARCHIVED' },
        })
      )
    })
  })

  // ===========================================
  // GET /api/conversations/[id]/messages - Get messages
  // ===========================================
  describe('GET /api/conversations/[id]/messages', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages')
      const response = await messagesGET(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when conversation not found', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages')
      const response = await messagesGET(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Conversation not found')
    })

    it('should return 403 when user is not a participant', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = { id: 'conv_1', clientId: 'other_user', artisanId: 'artisan_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages')
      const response = await messagesGET(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return messages with pagination', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = { id: 'conv_1', clientId: 'user_1', artisanId: 'artisan_1' }
      const mockMessages = [
        { id: 'msg_1', content: 'Hello', sender: { id: 'user_1', firstName: 'John', lastName: 'Client', profile: null } },
        { id: 'msg_2', content: 'Hi there', sender: { id: 'artisan_1', firstName: 'Jane', lastName: 'Artisan', profile: null } },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)
      vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages as never)
      vi.mocked(prisma.message.updateMany).mockResolvedValue({ count: 1 } as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages')
      const response = await messagesGET(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.messages).toHaveLength(2)
      expect(data.nextCursor).toBeNull()
    })

    it('should support cursor-based pagination', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = { id: 'conv_1', clientId: 'user_1', artisanId: 'artisan_1' }
      
      // Return exactly `limit` messages to indicate there might be more
      const mockMessages = Array.from({ length: 50 }, (_, i) => ({
        id: `msg_${i}`,
        content: `Message ${i}`,
        sender: { id: 'user_1', firstName: 'John', lastName: 'Client', profile: null },
      }))

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)
      vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages as never)
      vi.mocked(prisma.message.updateMany).mockResolvedValue({ count: 0 } as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages?cursor=msg_100&limit=50')
      const response = await messagesGET(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.messages).toHaveLength(50)
      expect(data.nextCursor).toBe('msg_49')
    })
  })

  // ===========================================
  // POST /api/conversations/[id]/messages - Send message
  // ===========================================
  describe('POST /api/conversations/[id]/messages', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages', {
        method: 'POST',
        body: JSON.stringify({ content: 'Hello' }),
      })
      const response = await messagesPOST(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when conversation not found', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages', {
        method: 'POST',
        body: JSON.stringify({ content: 'Hello' }),
      })
      const response = await messagesPOST(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Conversation not found')
    })

    it('should return 403 when user is not a participant', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = { id: 'conv_1', clientId: 'other_user', artisanId: 'artisan_1', status: 'ACTIVE' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages', {
        method: 'POST',
        body: JSON.stringify({ content: 'Hello' }),
      })
      const response = await messagesPOST(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return 400 when conversation is blocked', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = { id: 'conv_1', clientId: 'user_1', artisanId: 'artisan_1', status: 'BLOCKED' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages', {
        method: 'POST',
        body: JSON.stringify({ content: 'Hello' }),
      })
      const response = await messagesPOST(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Cannot send messages to blocked conversation')
    })

    it('should return 400 for invalid message content', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockConversation = { id: 'conv_1', clientId: 'user_1', artisanId: 'artisan_1', status: 'ACTIVE' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages', {
        method: 'POST',
        body: JSON.stringify({ content: '' }), // Empty content
      })
      const response = await messagesPOST(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should send message successfully as client', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT', firstName: 'John', lastName: 'Client' }
      const mockConversation = { id: 'conv_1', clientId: 'user_1', artisanId: 'artisan_1', status: 'ACTIVE' }
      const mockReceiver = { id: 'artisan_1', role: 'ARTISAN' }
      const newMessage = {
        id: 'msg_new',
        content: 'Hello',
        senderId: 'user_1',
        receiverId: 'artisan_1',
        sender: { id: 'user_1', firstName: 'John', lastName: 'Client', profile: null },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as never)
        .mockResolvedValueOnce(mockReceiver as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)
      vi.mocked(prisma.$transaction).mockResolvedValue([newMessage] as never)
      vi.mocked(prisma.notification.create).mockResolvedValue({} as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages', {
        method: 'POST',
        body: JSON.stringify({ content: 'Hello' }),
      })
      const response = await messagesPOST(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('msg_new')
      expect(prisma.notification.create).toHaveBeenCalled()
    })

    it('should send message successfully as artisan', async () => {
      const mockUser = { id: 'artisan_1', clerkId: 'clerk_456', role: 'ARTISAN', firstName: 'Jane', lastName: 'Artisan' }
      const mockConversation = { id: 'conv_1', clientId: 'user_1', artisanId: 'artisan_1', status: 'ACTIVE' }
      const mockReceiver = { id: 'user_1', role: 'CLIENT' }
      const newMessage = {
        id: 'msg_new',
        content: 'Thanks for reaching out',
        senderId: 'artisan_1',
        receiverId: 'user_1',
        sender: { id: 'artisan_1', firstName: 'Jane', lastName: 'Artisan', profile: null },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_456' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as never)
        .mockResolvedValueOnce(mockReceiver as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)
      vi.mocked(prisma.$transaction).mockResolvedValue([newMessage] as never)
      vi.mocked(prisma.notification.create).mockResolvedValue({} as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages', {
        method: 'POST',
        body: JSON.stringify({ content: 'Thanks for reaching out' }),
      })
      const response = await messagesPOST(request, createParams('conv_1'))
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('msg_new')
    })

    it('should include attachments in message', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT', firstName: 'John', lastName: 'Client' }
      const mockConversation = { id: 'conv_1', clientId: 'user_1', artisanId: 'artisan_1', status: 'ACTIVE' }
      const mockReceiver = { id: 'artisan_1', role: 'ARTISAN' }
      const newMessage = {
        id: 'msg_new',
        content: 'Check this out',
        attachmentUrls: ['https://example.com/image.jpg'],
        senderId: 'user_1',
        sender: { id: 'user_1', firstName: 'John', lastName: 'Client', profile: null },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as never)
        .mockResolvedValueOnce(mockReceiver as never)
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as never)
      vi.mocked(prisma.$transaction).mockResolvedValue([newMessage] as never)
      vi.mocked(prisma.notification.create).mockResolvedValue({} as never)

      const request = new Request('http://localhost:3000/api/conversations/conv_1/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Check this out',
          attachmentUrls: ['https://example.com/image.jpg'],
        }),
      })
      const response = await messagesPOST(request, createParams('conv_1'))

      expect(response.status).toBe(201)
    })
  })

  // ===========================================
  // GET /api/conversations/unread - Get unread count
  // ===========================================
  describe('GET /api/conversations/unread', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const response = await unreadGET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const response = await unreadGET()
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should return unread count with breakdown by conversation', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.message.count).mockResolvedValue(5)
      vi.mocked(prisma.message.groupBy).mockResolvedValue([
        { conversationId: 'conv_1', _count: { id: 3 } },
        { conversationId: 'conv_2', _count: { id: 2 } },
      ] as never)

      const response = await unreadGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.total).toBe(5)
      expect(data.byConversation).toHaveLength(2)
      expect(data.byConversation[0].conversationId).toBe('conv_1')
      expect(data.byConversation[0].count).toBe(3)
    })

    it('should return zero when no unread messages', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.message.count).mockResolvedValue(0)
      vi.mocked(prisma.message.groupBy).mockResolvedValue([])

      const response = await unreadGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.total).toBe(0)
      expect(data.byConversation).toHaveLength(0)
    })
  })
})
