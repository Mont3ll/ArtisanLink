/**
 * Tests for API routes
 * 
 * These tests mock the Prisma client and Clerk auth to test
 * API route handlers in isolation.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Prisma generated types
vi.mock('@/app/generated/prisma', () => ({
  NotificationType: {
    MESSAGE: 'MESSAGE',
    REVIEW: 'REVIEW',
    SUBSCRIPTION: 'SUBSCRIPTION',
    SYSTEM: 'SYSTEM',
    VERIFICATION: 'VERIFICATION',
  },
}))

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    review: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    profile: {
      findUnique: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Import mocked modules
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Import route handlers after mocks
import { GET as healthGET } from '@/app/api/health/route'
import { GET as reviewsGET, POST as reviewsPOST } from '@/app/api/reviews/route'
import { GET as notificationsGET, POST as notificationsPOST } from '@/app/api/notifications/route'

describe('Health API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/health', () => {
    it('should return healthy status when database is connected', async () => {
      vi.mocked(prisma.user.count)
        .mockResolvedValueOnce(100) // total users
        .mockResolvedValueOnce(5)   // admin users
        .mockResolvedValueOnce(50)  // artisan users
        .mockResolvedValueOnce(45)  // client users

      const request = new Request('http://localhost:3000/api/health')
      const response = await healthGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('healthy')
      expect(data.services.database.status).toBe('connected')
      expect(data.timestamp).toBeDefined()
      expect(data.uptime).toBeDefined()
    })

    it('should return unhealthy status when database fails', async () => {
      vi.mocked(prisma.user.count).mockRejectedValue(new Error('Connection failed'))

      const request = new Request('http://localhost:3000/api/health')
      const response = await healthGET(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
      expect(data.services.database.status).toBe('disconnected')
    })
  })
})

describe('Reviews API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/reviews', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

      const request = new Request('http://localhost:3000/api/reviews')
      const response = await reviewsGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/reviews')
      const response = await reviewsGET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should return reviews for authenticated client', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockReviews = [
        {
          id: 'review_1',
          rating: 5,
          comment: 'Great work!',
          profile: { user: { firstName: 'John', lastName: 'Artisan' } },
          client: { firstName: 'Jane', lastName: 'Client' },
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.review.findMany).mockResolvedValue(mockReviews as never)
      vi.mocked(prisma.review.count).mockResolvedValue(1)

      const request = new Request('http://localhost:3000/api/reviews')
      const response = await reviewsGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reviews).toHaveLength(1)
      expect(data.pagination.total).toBe(1)
    })

    it('should support pagination parameters', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'ADMIN' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.review.findMany).mockResolvedValue([])
      vi.mocked(prisma.review.count).mockResolvedValue(100)

      const request = new Request('http://localhost:3000/api/reviews?page=2&limit=10')
      const response = await reviewsGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.totalPages).toBe(10)
    })
  })

  describe('POST /api/reviews', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

      const request = new Request('http://localhost:3000/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ profileId: 'profile_1', rating: 5 }),
      })
      const response = await reviewsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when non-client tries to create review', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'ARTISAN' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ profileId: 'clxyz123456789012345678', rating: 5 }),
      })
      const response = await reviewsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Only clients can leave reviews')
    })

    it('should return 400 for invalid review data', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ profileId: 'invalid', rating: 10 }), // Invalid rating
      })
      const response = await reviewsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should return 404 when artisan profile not found', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ profileId: 'clxyz123456789012345678', rating: 5 }),
      })
      const response = await reviewsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Artisan not found')
    })

    it('should return 409 when duplicate review exists', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockProfile = { id: 'clxyz123456789012345678', user: { role: 'ARTISAN' } }
      const existingReview = { id: 'review_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockProfile as never)
      vi.mocked(prisma.review.findUnique).mockResolvedValue(existingReview as never)

      const request = new Request('http://localhost:3000/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ profileId: 'clxyz123456789012345678', rating: 5 }),
      })
      const response = await reviewsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('You have already reviewed this artisan')
    })

    it('should create review successfully', async () => {
      const mockUser = { id: 'user_1', clerkId: 'clerk_123', role: 'CLIENT' }
      const mockProfile = { id: 'clxyz123456789012345678', user: { role: 'ARTISAN' } }
      const newReview = {
        id: 'review_new',
        rating: 5,
        comment: 'Excellent!',
        profile: { user: { firstName: 'John', lastName: 'Artisan' } },
        client: { firstName: 'Jane', lastName: 'Client' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockProfile as never)
      vi.mocked(prisma.review.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.review.create).mockResolvedValue(newReview as never)

      const request = new Request('http://localhost:3000/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          profileId: 'clxyz123456789012345678',
          rating: 5,
          comment: 'Excellent!',
        }),
      })
      const response = await reviewsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('review_new')
      expect(data.rating).toBe(5)
    })
  })
})

describe('Notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/notifications', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

      const request = new Request('http://localhost:3000/api/notifications')
      const response = await notificationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/notifications')
      const response = await notificationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should return notifications for authenticated user', async () => {
      const mockUser = { id: 'user_1' }
      const mockNotifications = [
        {
          id: 'notif_1',
          type: 'MESSAGE',
          title: 'New Message',
          message: 'You have a new message',
          data: null,
          linkUrl: '/messages/1',
          isRead: false,
          createdAt: new Date(),
          readAt: null,
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.notification.findMany).mockResolvedValue(mockNotifications as never)
      vi.mocked(prisma.notification.count)
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1) // unread

      const request = new Request('http://localhost:3000/api/notifications')
      const response = await notificationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(1)
      expect(data.unreadCount).toBe(1)
      expect(data.pagination.total).toBe(1)
    })

    it('should filter unread notifications', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.notification.findMany).mockResolvedValue([])
      vi.mocked(prisma.notification.count)
        .mockResolvedValueOnce(0) // total (filtered)
        .mockResolvedValueOnce(0) // unread

      const request = new Request('http://localhost:3000/api/notifications?unread=true')
      const response = await notificationsGET(request)

      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/notifications', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user_1',
          type: 'MESSAGE',
          title: 'Test',
          message: 'Test message',
        }),
      })
      const response = await notificationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for invalid notification data', async () => {
      const mockUser = { id: 'user_1', role: 'ADMIN' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId: '', // Invalid: empty
          type: 'INVALID_TYPE', // Invalid type
          title: '',
          message: '',
        }),
      })
      const response = await notificationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should return 403 when non-admin tries to create notification for another user', async () => {
      const mockRequestingUser = { id: 'user_1', role: 'CLIENT' }
      const mockTargetUser = { id: 'user_2' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockRequestingUser as never) // requesting user
        .mockResolvedValueOnce(mockTargetUser as never) // target user

      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user_2', // Different from requesting user
          type: 'MESSAGE',
          title: 'Test',
          message: 'Test message',
        }),
      })
      const response = await notificationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Not authorized to create notifications for other users')
    })

    it('should allow admin to create notification for any user', async () => {
      const mockAdminUser = { id: 'admin_1', role: 'ADMIN' }
      const mockTargetUser = { id: 'user_2' }
      const newNotification = { id: 'notif_new' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_admin' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockAdminUser as never) // requesting user (admin)
        .mockResolvedValueOnce(mockTargetUser as never) // target user
      vi.mocked(prisma.notification.create).mockResolvedValue(newNotification as never)

      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user_2',
          type: 'MESSAGE',
          title: 'Admin Notification',
          message: 'This is from admin',
        }),
      })
      const response = await notificationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('notif_new')
    })

    it('should allow user to create notification for themselves', async () => {
      const mockUser = { id: 'user_1', role: 'CLIENT' }
      const newNotification = { id: 'notif_new' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as never) // requesting user
        .mockResolvedValueOnce(mockUser as never) // target user (same)
      vi.mocked(prisma.notification.create).mockResolvedValue(newNotification as never)

      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user_1', // Same as requesting user
          type: 'MESSAGE',
          title: 'Self Notification',
          message: 'Test message for myself',
        }),
      })
      const response = await notificationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('notif_new')
    })
  })
})
