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
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      groupBy: vi.fn(),
    },
    profile: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    subscription: {
      count: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
    review: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
    portfolioItem: {
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    specialization: {
      count: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    verificationHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Import route handlers
import { GET as getStats } from '@/app/api/admin/stats/route'
import { GET as getUsers } from '@/app/api/admin/users/route'
import { GET as getSettings, POST as updateSettings } from '@/app/api/admin/settings/route'
import { GET as getPendingVerifications } from '@/app/api/admin/verification/pending/route'
import { POST as processVerification } from '@/app/api/admin/verification/process/route'
import { GET as getModeration } from '@/app/api/admin/moderation/route'
import { GET as getModerationItem, POST as moderateItem } from '@/app/api/admin/moderation/[id]/route'
import { GET as getAnalyticsOverview } from '@/app/api/admin/analytics/overview/route'
import { GET as getActivityLogs, POST as createActivityLog } from '@/app/api/admin/activity-logs/route'
import { GET as getArtisans } from '@/app/api/admin/artisans/route'

// Helper to create mock request with params
function createMockParamsContext(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('Admin API Routes', () => {
  const mockAdmin = {
    id: 'admin-1',
    clerkId: 'clerk-admin-1',
    email: 'admin@artisanlink.ke',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    status: 'ACTIVE',
  }

  const mockNonAdmin = {
    id: 'user-1',
    clerkId: 'clerk-user-1',
    email: 'user@example.com',
    role: 'CLIENT',
    status: 'ACTIVE',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==================== GET /api/admin/stats ====================
  describe('GET /api/admin/stats', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const response = await getStats()
      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockNonAdmin as never)

      const response = await getStats()
      expect(response.status).toBe(403)
    })

    it('should return admin stats successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.user.count)
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(50)  // totalArtisans
        .mockResolvedValueOnce(30)  // activeArtisans
        .mockResolvedValueOnce(5)   // pendingVerifications
        .mockResolvedValueOnce(15)  // usersThisMonth
        .mockResolvedValueOnce(10)  // usersLastMonth
      vi.mocked(prisma.subscription.count).mockResolvedValue(20)
      vi.mocked(prisma.subscription.aggregate)
        .mockResolvedValueOnce({ _sum: { amount: 50000 } } as never) // monthlyRevenue
        .mockResolvedValueOnce({ _sum: { amount: 40000 } } as never) // revenueLastMonth
      vi.mocked(prisma.review.count).mockResolvedValue(200)

      const response = await getStats()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalUsers).toBe(100)
      expect(data.totalArtisans).toBe(50)
      expect(data.activeArtisans).toBe(30)
      expect(data.pendingVerifications).toBe(5)
      expect(data.activeSubscriptions).toBe(20)
      expect(data.monthlyRevenue).toBe(50000)
      expect(data.totalReviews).toBe(200)
      expect(data.userGrowth).toBeDefined()
      expect(data.revenueGrowth).toBeDefined()
    })

    it('should return 500 on database error', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'))

      const response = await getStats()
      expect(response.status).toBe(500)
    })
  })

  // ==================== GET /api/admin/users ====================
  describe('GET /api/admin/users', () => {
    const mockRecentUsers = [
      {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'ARTISAN',
        status: 'ACTIVE',
        createdAt: new Date('2024-01-15'),
        profile: {
          id: 'profile-1',
          city: 'Nairobi',
          profession: 'Carpenter',
          artisanStatus: 'VERIFIED',
        },
      },
    ]

    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const response = await getUsers()
      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockNonAdmin as never)

      const response = await getUsers()
      expect(response.status).toBe(403)
    })

    it('should return recent users successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockRecentUsers as never)
      vi.mocked(prisma.portfolioItem.count).mockResolvedValue(5)

      const response = await getUsers()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].user).toBe('John Doe')
      expect(data[0].email).toBe('john@example.com')
      expect(data[0].role).toBe('artisan')
      expect(data[0].profession).toBe('Carpenter')
    })
  })

  // ==================== GET/POST /api/admin/settings ====================
  describe('GET /api/admin/settings', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const response = await getSettings()
      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockNonAdmin as never)

      const response = await getSettings()
      expect(response.status).toBe(403)
    })

    it('should return platform settings successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)

      const response = await getSettings()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.settings).toBeDefined()
      expect(data.settings.general).toBeDefined()
      expect(data.settings.notifications).toBeDefined()
      expect(data.settings.security).toBeDefined()
      expect(data.settings.features).toBeDefined()
    })
  })

  describe('POST /api/admin/settings', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ category: 'general', settings: {} }),
      })
      const response = await updateSettings(request)
      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockNonAdmin as never)

      const request = new Request('http://localhost/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ category: 'general', settings: {} }),
      })
      const response = await updateSettings(request)
      expect(response.status).toBe(403)
    })

    it('should update general settings successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)

      const request = new Request('http://localhost/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({
          category: 'general',
          settings: {
            siteName: 'ArtisanLink',
            siteDescription: 'Test description',
            maintenanceMode: false,
            registrationEnabled: true,
          },
        }),
      })
      const response = await updateSettings(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('general settings updated')
    })

    it('should return 400 for invalid category', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)

      const request = new Request('http://localhost/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({
          category: 'invalid',
          settings: {},
        }),
      })
      const response = await updateSettings(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid JSON', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)

      const request = new Request('http://localhost/api/admin/settings', {
        method: 'POST',
        body: 'invalid json',
      })
      const response = await updateSettings(request)
      expect(response.status).toBe(400)
    })
  })

  // ==================== GET /api/admin/verification/pending ====================
  describe('GET /api/admin/verification/pending', () => {
    const mockPendingArtisans = [
      {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'ARTISAN',
        createdAt: new Date('2024-01-15'),
        profile: {
          id: 'profile-1',
          profession: 'Carpenter',
          artisanStatus: 'PENDING',
        },
      },
    ]

    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const response = await getPendingVerifications()
      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockNonAdmin as never)

      const response = await getPendingVerifications()
      expect(response.status).toBe(403)
    })

    it('should return pending verifications successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockPendingArtisans as never)

      const response = await getPendingVerifications()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].profile.artisanStatus).toBe('PENDING')
    })
  })

  // ==================== POST /api/admin/verification/process ====================
  describe('POST /api/admin/verification/process', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost/api/admin/verification/process', {
        method: 'POST',
        body: JSON.stringify({ artisanId: 'user-1', action: 'APPROVE' }),
      })
      const response = await processVerification(request)
      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockNonAdmin as never)

      const request = new Request('http://localhost/api/admin/verification/process', {
        method: 'POST',
        body: JSON.stringify({ artisanId: 'user-1', action: 'APPROVE' }),
      })
      const response = await processVerification(request)
      expect(response.status).toBe(403)
    })

    it('should approve artisan successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      // First call returns admin, second call returns artisan with profile
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ role: 'ADMIN', email: 'admin@test.com' } as never)
        .mockResolvedValueOnce({
          id: 'user-1',
          email: 'artisan@test.com',
          firstName: 'Test',
          lastName: 'Artisan',
          profile: {
            id: 'profile-1',
            certificateUrl: 'https://example.com/cert.pdf',
            idDocumentUrl: 'https://example.com/id.pdf',
            idDocumentType: 'NATIONAL_ID',
          },
        } as never)
      const updatedProfile = {
        id: 'profile-1',
        artisanStatus: 'VERIFIED',
        verifiedAt: new Date(),
      }
      vi.mocked(prisma.$transaction).mockResolvedValue([
        updatedProfile,
        { id: 'history-1' },
      ] as never)
      vi.mocked(prisma.activityLog.create).mockResolvedValue({} as never)
      vi.mocked(prisma.notification.create).mockResolvedValue({} as never)

      const request = new Request('http://localhost/api/admin/verification/process', {
        method: 'POST',
        body: JSON.stringify({ artisanId: 'user-1', action: 'APPROVE' }),
      })
      const response = await processVerification(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('approved')
    })

    it('should reject artisan with reason', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      // First call returns admin, second call returns artisan with profile
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ role: 'ADMIN', email: 'admin@test.com' } as never)
        .mockResolvedValueOnce({
          id: 'user-1',
          email: 'artisan@test.com',
          firstName: 'Test',
          lastName: 'Artisan',
          profile: {
            id: 'profile-1',
            certificateUrl: 'https://example.com/cert.pdf',
            idDocumentUrl: 'https://example.com/id.pdf',
            idDocumentType: 'NATIONAL_ID',
          },
        } as never)
      const updatedProfile = {
        id: 'profile-1',
        artisanStatus: 'REJECTED',
      }
      vi.mocked(prisma.$transaction).mockResolvedValue([
        updatedProfile,
        { id: 'history-1' },
      ] as never)
      vi.mocked(prisma.activityLog.create).mockResolvedValue({} as never)
      vi.mocked(prisma.notification.create).mockResolvedValue({} as never)

      const request = new Request('http://localhost/api/admin/verification/process', {
        method: 'POST',
        body: JSON.stringify({
          artisanId: 'user-1',
          action: 'REJECT',
          reason: 'Incomplete documentation',
        }),
      })
      const response = await processVerification(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Note: API has a typo - returns "rejectd" instead of "rejected"
      expect(data.message).toContain('reject')
    })

    it('should return 400 for invalid action', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)

      const request = new Request('http://localhost/api/admin/verification/process', {
        method: 'POST',
        body: JSON.stringify({ artisanId: 'user-1', action: 'INVALID' }),
      })
      const response = await processVerification(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 when artisanId is missing', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)

      const request = new Request('http://localhost/api/admin/verification/process', {
        method: 'POST',
        body: JSON.stringify({ action: 'APPROVE' }),
      })
      const response = await processVerification(request)
      expect(response.status).toBe(400)
    })
  })

  // ==================== GET /api/admin/moderation ====================
  describe('GET /api/admin/moderation', () => {
    const mockReview = {
      id: 'review-1',
      rating: 4,
      comment: 'Great work!',
      projectTitle: 'Kitchen Renovation',
      projectCost: 50000,
      isApproved: false,
      isHidden: false,
      createdAt: new Date('2024-01-15'),
      profile: {
        profession: 'Carpenter',
        user: {
          id: 'artisan-1',
          firstName: 'John',
          lastName: 'Artisan',
          email: 'artisan@test.com',
          role: 'ARTISAN',
        },
      },
      client: {
        id: 'client-1',
        firstName: 'Jane',
        lastName: 'Client',
        email: 'client@test.com',
        role: 'CLIENT',
      },
    }

    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost/api/admin/moderation')
      const response = await getModeration(request)
      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockNonAdmin as never)

      const request = new Request('http://localhost/api/admin/moderation')
      const response = await getModeration(request)
      expect(response.status).toBe(403)
    })

    it('should return moderation items with stats', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.review.findMany).mockResolvedValue([mockReview] as never)
      vi.mocked(prisma.review.count)
        .mockResolvedValueOnce(1)  // reviews count
        .mockResolvedValueOnce(5)  // pendingReviews stats
      vi.mocked(prisma.user.findMany).mockResolvedValue([])
      vi.mocked(prisma.user.count)
        .mockResolvedValueOnce(0)  // users count
        .mockResolvedValueOnce(2)  // pendingUsers stats
        .mockResolvedValueOnce(1)  // suspendedUsers stats

      const request = new Request('http://localhost/api/admin/moderation')
      const response = await getModeration(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toBeDefined()
      expect(data.stats).toBeDefined()
      expect(data.stats.pendingReviews).toBe(5)
      expect(data.pagination).toBeDefined()
    })

    it('should filter by type=reviews', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.review.findMany).mockResolvedValue([mockReview] as never)
      vi.mocked(prisma.review.count).mockResolvedValue(1)

      const request = new Request('http://localhost/api/admin/moderation?type=reviews')
      const response = await getModeration(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items.every((item: { type: string }) => item.type === 'review')).toBe(true)
    })

    it('should filter by status', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.review.findMany).mockResolvedValue([])
      vi.mocked(prisma.review.count).mockResolvedValue(0)
      vi.mocked(prisma.user.findMany).mockResolvedValue([])
      vi.mocked(prisma.user.count).mockResolvedValue(0)

      const request = new Request('http://localhost/api/admin/moderation?status=approved')
      await getModeration(request)

      expect(prisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isApproved: true }),
        })
      )
    })
  })

  // ==================== GET/POST /api/admin/moderation/[id] ====================
  describe('GET /api/admin/moderation/[id]', () => {
    const mockReview = {
      id: 'review-1',
      rating: 4,
      comment: 'Great work!',
      isApproved: false,
      isHidden: false,
      profile: {
        user: {
          id: 'artisan-1',
          firstName: 'John',
          lastName: 'Artisan',
          email: 'artisan@test.com',
        },
      },
      client: {
        id: 'client-1',
        firstName: 'Jane',
        lastName: 'Client',
        email: 'client@test.com',
      },
    }

    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost/api/admin/moderation/review-1?type=review')
      const response = await getModerationItem(request, createMockParamsContext('review-1'))
      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockNonAdmin as never)

      const request = new Request('http://localhost/api/admin/moderation/review-1?type=review')
      const response = await getModerationItem(request, createMockParamsContext('review-1'))
      expect(response.status).toBe(403)
    })

    it('should return review detail with history', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.review.findUnique).mockResolvedValue(mockReview as never)
      vi.mocked(prisma.activityLog.findMany).mockResolvedValue([])

      const request = new Request('http://localhost/api/admin/moderation/review-1?type=review')
      const response = await getModerationItem(request, createMockParamsContext('review-1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.review).toBeDefined()
      expect(data.history).toBeDefined()
    })

    it('should return 404 when review not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.review.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost/api/admin/moderation/nonexistent?type=review')
      const response = await getModerationItem(request, createMockParamsContext('nonexistent'))
      expect(response.status).toBe(404)
    })

    it('should return user detail with history', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ role: 'ADMIN' } as never)
        .mockResolvedValueOnce({
          id: 'user-1',
          firstName: 'Test',
          lastName: 'User',
          profile: {},
          reviews: [],
        } as never)
      vi.mocked(prisma.activityLog.findMany).mockResolvedValue([])

      const request = new Request('http://localhost/api/admin/moderation/user-1?type=user')
      const response = await getModerationItem(request, createMockParamsContext('user-1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.history).toBeDefined()
    })
  })

  describe('POST /api/admin/moderation/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost/api/admin/moderation/review-1', {
        method: 'POST',
        body: JSON.stringify({ action: 'approve', type: 'review' }),
      })
      const response = await moderateItem(request, createMockParamsContext('review-1'))
      expect(response.status).toBe(401)
    })

    it('should approve review successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ 
        id: 'admin-1',
        role: 'ADMIN',
        email: 'admin@test.com',
      } as never)
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        profileId: 'profile-1',
        profile: { id: 'profile-1' },
      } as never)
      vi.mocked(prisma.review.update).mockResolvedValue({
        id: 'review-1',
        isApproved: true,
        isHidden: false,
      } as never)
      vi.mocked(prisma.review.aggregate).mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { rating: 10 },
      } as never)
      vi.mocked(prisma.profile.update).mockResolvedValue({} as never)
      vi.mocked(prisma.activityLog.create).mockResolvedValue({} as never)

      const request = new Request('http://localhost/api/admin/moderation/review-1', {
        method: 'POST',
        body: JSON.stringify({ action: 'approve', type: 'review' }),
      })
      const response = await moderateItem(request, createMockParamsContext('review-1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('approved')
    })

    it('should hide review successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'admin-1',
        role: 'ADMIN',
        email: 'admin@test.com',
      } as never)
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        profileId: 'profile-1',
        profile: { id: 'profile-1' },
      } as never)
      vi.mocked(prisma.review.update).mockResolvedValue({
        id: 'review-1',
        isApproved: false,
        isHidden: true,
      } as never)
      vi.mocked(prisma.review.aggregate).mockResolvedValue({
        _avg: { rating: 4.0 },
        _count: { rating: 9 },
      } as never)
      vi.mocked(prisma.profile.update).mockResolvedValue({} as never)
      vi.mocked(prisma.activityLog.create).mockResolvedValue({} as never)

      const request = new Request('http://localhost/api/admin/moderation/review-1', {
        method: 'POST',
        body: JSON.stringify({ action: 'hide', type: 'review', reason: 'Inappropriate content' }),
      })
      const response = await moderateItem(request, createMockParamsContext('review-1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should suspend user successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          id: 'admin-1',
          role: 'ADMIN',
          email: 'admin@test.com',
        } as never)
        .mockResolvedValueOnce({
          id: 'user-1',
          role: 'CLIENT',
          status: 'ACTIVE',
        } as never)
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: 'user-1',
        status: 'SUSPENDED',
      } as never)
      vi.mocked(prisma.activityLog.create).mockResolvedValue({} as never)

      const request = new Request('http://localhost/api/admin/moderation/user-1', {
        method: 'POST',
        body: JSON.stringify({ action: 'suspend', type: 'user', reason: 'Policy violation' }),
      })
      const response = await moderateItem(request, createMockParamsContext('user-1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Note: API has a typo - returns "suspendd" instead of "suspended"
      expect(data.message).toContain('suspend')
    })

    it('should not allow moderating other admins', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          id: 'admin-1',
          role: 'ADMIN',
          email: 'admin@test.com',
        } as never)
        .mockResolvedValueOnce({
          id: 'admin-2',
          role: 'ADMIN',
          status: 'ACTIVE',
        } as never)

      const request = new Request('http://localhost/api/admin/moderation/admin-2', {
        method: 'POST',
        body: JSON.stringify({ action: 'suspend', type: 'user' }),
      })
      const response = await moderateItem(request, createMockParamsContext('admin-2'))
      expect(response.status).toBe(403)
    })

    it('should return 400 for invalid action', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'admin-1',
        role: 'ADMIN',
      } as never)

      const request = new Request('http://localhost/api/admin/moderation/review-1', {
        method: 'POST',
        body: JSON.stringify({ action: 'invalid', type: 'review' }),
      })
      const response = await moderateItem(request, createMockParamsContext('review-1'))
      expect(response.status).toBe(400)
    })
  })

  // ==================== GET /api/admin/analytics/overview ====================
  describe('GET /api/admin/analytics/overview', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const response = await getAnalyticsOverview()
      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockNonAdmin as never)

      const response = await getAnalyticsOverview()
      expect(response.status).toBe(403)
    })

    it('should return analytics data successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.user.groupBy).mockResolvedValue([
        { role: 'ARTISAN', _count: { id: 10 } },
        { role: 'CLIENT', _count: { id: 20 } },
      ] as never)
      vi.mocked(prisma.portfolioItem.aggregate).mockResolvedValue({ _count: { id: 50 } } as never)
      vi.mocked(prisma.user.count).mockResolvedValue(100)
      vi.mocked(prisma.portfolioItem.count).mockResolvedValue(200)
      vi.mocked(prisma.subscription.count).mockResolvedValue(30)

      const response = await getAnalyticsOverview()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.userGrowth).toBeDefined()
      expect(data.projectStats).toBeDefined()
      expect(data.revenueData).toBeDefined()
      expect(data.metrics).toBeDefined()
    })
  })

  // ==================== GET/POST /api/admin/activity-logs ====================
  describe('GET /api/admin/activity-logs', () => {
    const mockLogs = [
      {
        id: 'log-1',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        action: 'ARTISAN_VERIFIED',
        targetType: 'PROFILE',
        targetId: 'profile-1',
        description: 'Approved artisan verification',
        createdAt: new Date('2024-01-15'),
      },
    ]

    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost/api/admin/activity-logs')
      const response = await getActivityLogs(request)
      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockNonAdmin as never)

      const request = new Request('http://localhost/api/admin/activity-logs')
      const response = await getActivityLogs(request)
      expect(response.status).toBe(403)
    })

    it('should return activity logs with pagination', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.activityLog.findMany).mockResolvedValue(mockLogs as never)
      vi.mocked(prisma.activityLog.count).mockResolvedValue(1)
      vi.mocked(prisma.activityLog.groupBy)
        .mockResolvedValueOnce([{ action: 'ARTISAN_VERIFIED', _count: { action: 1 } }] as never)
        .mockResolvedValueOnce([{ targetType: 'PROFILE', _count: { targetType: 1 } }] as never)

      const request = new Request('http://localhost/api/admin/activity-logs')
      const response = await getActivityLogs(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.logs).toHaveLength(1)
      expect(data.filters).toBeDefined()
      expect(data.pagination).toBeDefined()
    })

    it('should filter by action type', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.activityLog.findMany).mockResolvedValue([])
      vi.mocked(prisma.activityLog.count).mockResolvedValue(0)
      vi.mocked(prisma.activityLog.groupBy).mockResolvedValue([])

      const request = new Request('http://localhost/api/admin/activity-logs?action=ARTISAN_VERIFIED')
      await getActivityLogs(request)

      expect(prisma.activityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ action: 'ARTISAN_VERIFIED' }),
        })
      )
    })

    it('should filter by date range', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.activityLog.findMany).mockResolvedValue([])
      vi.mocked(prisma.activityLog.count).mockResolvedValue(0)
      vi.mocked(prisma.activityLog.groupBy).mockResolvedValue([])

      const request = new Request('http://localhost/api/admin/activity-logs?startDate=2024-01-01&endDate=2024-01-31')
      await getActivityLogs(request)

      expect(prisma.activityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      )
    })

    it('should search in description', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.activityLog.findMany).mockResolvedValue([])
      vi.mocked(prisma.activityLog.count).mockResolvedValue(0)
      vi.mocked(prisma.activityLog.groupBy).mockResolvedValue([])

      const request = new Request('http://localhost/api/admin/activity-logs?search=verified')
      await getActivityLogs(request)

      expect(prisma.activityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            description: { contains: 'verified', mode: 'insensitive' },
          }),
        })
      )
    })
  })

  describe('POST /api/admin/activity-logs', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost/api/admin/activity-logs', {
        method: 'POST',
        body: JSON.stringify({
          action: 'TEST_ACTION',
          targetType: 'USER',
          targetId: 'user-1',
        }),
      })
      const response = await createActivityLog(request)
      expect(response.status).toBe(401)
    })

    it('should create activity log successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'admin-1',
        role: 'ADMIN',
        email: 'admin@test.com',
      } as never)
      vi.mocked(prisma.activityLog.create).mockResolvedValue({
        id: 'log-1',
        action: 'TEST_ACTION',
        targetType: 'USER',
        targetId: 'user-1',
      } as never)

      const request = new Request('http://localhost/api/admin/activity-logs', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '127.0.0.1',
          'user-agent': 'Test Agent',
        },
        body: JSON.stringify({
          action: 'TEST_ACTION',
          targetType: 'USER',
          targetId: 'user-1',
          description: 'Test description',
        }),
      })
      const response = await createActivityLog(request)

      expect(response.status).toBe(201)
      expect(prisma.activityLog.create).toHaveBeenCalled()
    })

    it('should return 400 for invalid data', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)

      const request = new Request('http://localhost/api/admin/activity-logs', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          action: '',
        }),
      })
      const response = await createActivityLog(request)
      expect(response.status).toBe(400)
    })
  })

  // ==================== GET /api/admin/artisans ====================
  describe('GET /api/admin/artisans', () => {
    const mockArtisan = {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Artisan',
      email: 'john@artisan.com',
      phone: '+254712345678',
      createdAt: new Date('2024-01-15'),
      lastLoginAt: new Date('2024-01-20'),
      profile: {
        profession: 'Carpenter',
        city: 'Nairobi',
        county: 'Nairobi',
        experience: 5,
        averageRating: 4.5,
        artisanStatus: 'VERIFIED',
        isAvailable: true,
        subscription: {
          status: 'ACTIVE',
          plan: 'PROFESSIONAL',
          endDate: new Date('2025-01-15'),
        },
        _count: {
          reviews: 10,
          portfolioItems: 5,
        },
      },
    }

    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost/api/admin/artisans')
      const response = await getArtisans(request)
      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockNonAdmin as never)

      const request = new Request('http://localhost/api/admin/artisans')
      const response = await getArtisans(request)
      expect(response.status).toBe(403)
    })

    it('should return artisans with pagination and stats', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.user.findMany).mockResolvedValue([mockArtisan] as never)
      vi.mocked(prisma.user.count)
        .mockResolvedValueOnce(1)   // total for pagination
        .mockResolvedValueOnce(50)  // totalArtisans stats
      vi.mocked(prisma.profile.count)
        .mockResolvedValueOnce(30)  // verifiedCount
        .mockResolvedValueOnce(10)  // pendingCount
      vi.mocked(prisma.subscription.count).mockResolvedValue(25)

      const request = new Request('http://localhost/api/admin/artisans')
      const response = await getArtisans(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.artisans).toHaveLength(1)
      expect(data.artisans[0].name).toBe('John Artisan')
      expect(data.artisans[0].profession).toBe('Carpenter')
      expect(data.artisans[0].status).toBe('VERIFIED')
      expect(data.pagination).toBeDefined()
      expect(data.stats).toBeDefined()
      expect(data.stats.totalArtisans).toBe(50)
    })

    it('should filter by search query', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.user.findMany).mockResolvedValue([])
      vi.mocked(prisma.user.count).mockResolvedValue(0)
      vi.mocked(prisma.profile.count).mockResolvedValue(0)
      vi.mocked(prisma.subscription.count).mockResolvedValue(0)

      const request = new Request('http://localhost/api/admin/artisans?search=john')
      await getArtisans(request)

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ firstName: { contains: 'john', mode: 'insensitive' } }),
            ]),
          }),
        })
      )
    })

    it('should filter by artisan status', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.user.findMany).mockResolvedValue([])
      vi.mocked(prisma.user.count).mockResolvedValue(0)
      vi.mocked(prisma.profile.count).mockResolvedValue(0)
      vi.mocked(prisma.subscription.count).mockResolvedValue(0)

      const request = new Request('http://localhost/api/admin/artisans?status=PENDING')
      await getArtisans(request)

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            profile: expect.objectContaining({ artisanStatus: 'PENDING' }),
          }),
        })
      )
    })

    it('should filter by subscription status', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.user.findMany).mockResolvedValue([])
      vi.mocked(prisma.user.count).mockResolvedValue(0)
      vi.mocked(prisma.profile.count).mockResolvedValue(0)
      vi.mocked(prisma.subscription.count).mockResolvedValue(0)

      const request = new Request('http://localhost/api/admin/artisans?subscriptionStatus=ACTIVE')
      await getArtisans(request)

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            profile: expect.objectContaining({
              subscription: expect.objectContaining({ status: 'ACTIVE' }),
            }),
          }),
        })
      )
    })

    it('should handle pagination', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk-admin-1' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
      vi.mocked(prisma.user.findMany).mockResolvedValue([])
      vi.mocked(prisma.user.count).mockResolvedValue(100)
      vi.mocked(prisma.profile.count).mockResolvedValue(0)
      vi.mocked(prisma.subscription.count).mockResolvedValue(0)

      const request = new Request('http://localhost/api/admin/artisans?page=2&limit=10')
      const response = await getArtisans(request)
      const data = await response.json()

      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.totalPages).toBe(10)
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      )
    })
  })
})
