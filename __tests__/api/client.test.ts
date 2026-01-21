/**
 * Tests for Client API routes
 * 
 * Covers:
 * - GET /api/client/stats - Get client dashboard stats
 * - GET /api/client/saved-artisans - List saved artisans
 * - POST /api/client/saved-artisans - Save an artisan
 * - DELETE /api/client/saved-artisans - Remove saved artisan by profileId
 * - GET /api/client/saved-artisans/[id] - Get specific saved artisan
 * - DELETE /api/client/saved-artisans/[id] - Remove saved artisan by ID
 * - GET /api/client/search-history - Get search history
 * - POST /api/client/search-history - Record search
 * - DELETE /api/client/search-history - Clear search history
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
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
    },
    profile: {
      findUnique: vi.fn(),
    },
    conversation: {
      count: vi.fn(),
    },
    message: {
      count: vi.fn(),
    },
    savedArtisan: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    searchHistory: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Import mocked modules
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Import route handlers after mocks
import { GET as clientStatsGET } from '@/app/api/client/stats/route'
import { GET as savedArtisansGET, POST as savedArtisansPOST, DELETE as savedArtisansDELETE } from '@/app/api/client/saved-artisans/route'
import { GET as savedArtisanByIdGET, DELETE as savedArtisanByIdDELETE } from '@/app/api/client/saved-artisans/[id]/route'
import { GET as searchHistoryGET, POST as searchHistoryPOST, DELETE as searchHistoryDELETE } from '@/app/api/client/search-history/route'

// Helper to create route params
const createParams = (id: string) => ({ params: Promise.resolve({ id }) })

describe('Client Stats API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/client/stats', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const response = await clientStatsGET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when user is not a client', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'ARTISAN',
        profile: null,
        clientConversations: [],
        reviews: [],
      } as never)

      const response = await clientStatsGET()
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return client stats successfully', async () => {
      const mockClientUser = {
        id: 'user_1',
        role: 'CLIENT',
        profile: null,
        clientConversations: [
          {
            id: 'conv_1',
            status: 'ACTIVE',
            createdAt: new Date(),
            artisan: {
              firstName: 'John',
              lastName: 'Artisan',
              profile: { profession: 'Carpenter', averageRating: 4.5, city: 'Nairobi' },
            },
            messages: [{ id: 'msg_1', content: 'Hello', createdAt: new Date() }],
          },
        ],
        reviews: [
          {
            id: 'review_1',
            rating: 5,
            createdAt: new Date(),
            projectCost: 5000,
            profile: { user: { firstName: 'Jane', lastName: 'Artisan' } },
          },
        ],
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockClientUser as never)
      vi.mocked(prisma.user.findMany).mockResolvedValue([]) // recommended artisans
      vi.mocked(prisma.message.count).mockResolvedValue(2)
      vi.mocked(prisma.conversation.count).mockResolvedValue(1)

      const response = await clientStatsGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.stats).toBeDefined()
      expect(data.stats.activeConversations).toBe(1)
      expect(data.stats.reviewsGiven).toBe(1)
      expect(data.stats.unreadMessages).toBe(2)
      expect(data.recentActivity).toBeDefined()
      expect(data.recommendedArtisans).toBeDefined()
    })
  })
})

describe('Saved Artisans API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===========================================
  // GET /api/client/saved-artisans
  // ===========================================
  describe('GET /api/client/saved-artisans', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans')
      const response = await savedArtisansGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/client/saved-artisans')
      const response = await savedArtisansGET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should return saved artisans with pagination', async () => {
      const mockUser = { id: 'user_1', role: 'CLIENT' }
      const mockSavedArtisans = [
        {
          id: 'saved_1',
          createdAt: new Date(),
          profile: {
            id: 'profile_1',
            profession: 'Carpenter',
            bio: 'Experienced carpenter',
            profileImage: 'https://example.com/image.jpg',
            city: 'Nairobi',
            county: 'Nairobi',
            experience: 5,
            hourlyRate: 1000,
            isAvailable: true,
            artisanStatus: 'VERIFIED',
            averageRating: 4.5,
            totalReviews: 10,
            user: { id: 'artisan_1', firstName: 'John', lastName: 'Artisan' },
            specializations: [{ name: 'Woodworking', skillLevel: 'EXPERT' }],
          },
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.savedArtisan.findMany).mockResolvedValue(mockSavedArtisans as never)
      vi.mocked(prisma.savedArtisan.count).mockResolvedValue(1)

      const request = new Request('http://localhost:3000/api/client/saved-artisans')
      const response = await savedArtisansGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(1)
      expect(data.items[0].artisan.name).toBe('John Artisan')
      expect(data.items[0].artisan.isVerified).toBe(true)
      expect(data.pagination.total).toBe(1)
    })

    it('should support pagination parameters', async () => {
      const mockUser = { id: 'user_1', role: 'CLIENT' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.savedArtisan.findMany).mockResolvedValue([])
      vi.mocked(prisma.savedArtisan.count).mockResolvedValue(50)

      const request = new Request('http://localhost:3000/api/client/saved-artisans?page=2&limit=10')
      const response = await savedArtisansGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.totalPages).toBe(5)
    })
  })

  // ===========================================
  // POST /api/client/saved-artisans
  // ===========================================
  describe('POST /api/client/saved-artisans', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans', {
        method: 'POST',
        body: JSON.stringify({ profileId: 'profile_1' }),
      })
      const response = await savedArtisansPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for invalid profile ID', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans', {
        method: 'POST',
        body: JSON.stringify({ profileId: '' }), // Empty profileId
      })
      const response = await savedArtisansPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should return 404 when profile not found', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/client/saved-artisans', {
        method: 'POST',
        body: JSON.stringify({ profileId: 'profile_1' }),
      })
      const response = await savedArtisansPOST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Profile not found')
    })

    it('should return 400 when trying to save non-artisan profile', async () => {
      const mockUser = { id: 'user_1' }
      const mockProfile = { id: 'profile_1', user: { role: 'CLIENT' } }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockProfile as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans', {
        method: 'POST',
        body: JSON.stringify({ profileId: 'profile_1' }),
      })
      const response = await savedArtisansPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Can only save artisan profiles')
    })

    it('should return 409 when artisan already saved', async () => {
      const mockUser = { id: 'user_1' }
      const mockProfile = { id: 'profile_1', user: { role: 'ARTISAN' } }
      const existingSaved = { id: 'saved_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockProfile as never)
      vi.mocked(prisma.savedArtisan.findUnique).mockResolvedValue(existingSaved as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans', {
        method: 'POST',
        body: JSON.stringify({ profileId: 'profile_1' }),
      })
      const response = await savedArtisansPOST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Artisan already saved')
    })

    it('should save artisan successfully', async () => {
      const mockUser = { id: 'user_1' }
      const mockProfile = { id: 'profile_1', user: { role: 'ARTISAN' } }
      const newSaved = { id: 'saved_new' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockProfile as never)
      vi.mocked(prisma.savedArtisan.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.savedArtisan.create).mockResolvedValue(newSaved as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans', {
        method: 'POST',
        body: JSON.stringify({ profileId: 'profile_1' }),
      })
      const response = await savedArtisansPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Artisan saved successfully')
      expect(data.id).toBe('saved_new')
    })
  })

  // ===========================================
  // DELETE /api/client/saved-artisans
  // ===========================================
  describe('DELETE /api/client/saved-artisans', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans?profileId=profile_1', {
        method: 'DELETE',
      })
      const response = await savedArtisansDELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 when profileId is missing', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans', {
        method: 'DELETE',
      })
      const response = await savedArtisansDELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Profile ID is required')
    })

    it('should return 404 when saved artisan not found', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.savedArtisan.deleteMany).mockResolvedValue({ count: 0 } as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans?profileId=profile_1', {
        method: 'DELETE',
      })
      const response = await savedArtisansDELETE(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Saved artisan not found')
    })

    it('should unsave artisan successfully', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.savedArtisan.deleteMany).mockResolvedValue({ count: 1 } as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans?profileId=profile_1', {
        method: 'DELETE',
      })
      const response = await savedArtisansDELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Artisan unsaved successfully')
    })
  })

  // ===========================================
  // GET /api/client/saved-artisans/[id]
  // ===========================================
  describe('GET /api/client/saved-artisans/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans/saved_1')
      const response = await savedArtisanByIdGET(request, createParams('saved_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when saved artisan not found', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.savedArtisan.findFirst).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/client/saved-artisans/saved_1')
      const response = await savedArtisanByIdGET(request, createParams('saved_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Saved artisan not found')
    })

    it('should return saved artisan details', async () => {
      const mockUser = { id: 'user_1' }
      const mockSavedArtisan = {
        id: 'saved_1',
        createdAt: new Date(),
        profile: {
          id: 'profile_1',
          profession: 'Carpenter',
          bio: 'Experienced carpenter',
          profileImage: 'https://example.com/image.jpg',
          city: 'Nairobi',
          county: 'Nairobi',
          experience: 5,
          hourlyRate: 1000,
          isAvailable: true,
          artisanStatus: 'VERIFIED',
          averageRating: 4.5,
          totalReviews: 10,
          user: { id: 'artisan_1', firstName: 'John', lastName: 'Artisan' },
          specializations: [{ name: 'Woodworking', skillLevel: 'EXPERT' }],
        },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.savedArtisan.findFirst).mockResolvedValue(mockSavedArtisan as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans/saved_1')
      const response = await savedArtisanByIdGET(request, createParams('saved_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('saved_1')
      expect(data.artisan.name).toBe('John Artisan')
      expect(data.artisan.isVerified).toBe(true)
    })
  })

  // ===========================================
  // DELETE /api/client/saved-artisans/[id]
  // ===========================================
  describe('DELETE /api/client/saved-artisans/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans/saved_1', {
        method: 'DELETE',
      })
      const response = await savedArtisanByIdDELETE(request, createParams('saved_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when saved artisan not found', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.savedArtisan.findFirst).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/client/saved-artisans/saved_1', {
        method: 'DELETE',
      })
      const response = await savedArtisanByIdDELETE(request, createParams('saved_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Saved artisan not found')
    })

    it('should delete saved artisan successfully', async () => {
      const mockUser = { id: 'user_1' }
      const mockSavedArtisan = { id: 'saved_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.savedArtisan.findFirst).mockResolvedValue(mockSavedArtisan as never)
      vi.mocked(prisma.savedArtisan.delete).mockResolvedValue(mockSavedArtisan as never)

      const request = new Request('http://localhost:3000/api/client/saved-artisans/saved_1', {
        method: 'DELETE',
      })
      const response = await savedArtisanByIdDELETE(request, createParams('saved_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Artisan unsaved successfully')
    })
  })
})

describe('Search History API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===========================================
  // GET /api/client/search-history
  // ===========================================
  describe('GET /api/client/search-history', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/client/search-history')
      const response = await searchHistoryGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/client/search-history')
      const response = await searchHistoryGET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should return search history', async () => {
      const mockUser = { id: 'user_1' }
      const mockHistory = [
        {
          id: 'search_1',
          query: 'plumber',
          profession: 'Plumber',
          location: 'Nairobi',
          minRating: 4,
          maxRadius: 10,
          filters: {},
          resultCount: 15,
          latitude: -1.2921,
          longitude: 36.8219,
          createdAt: new Date(),
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.searchHistory.findMany).mockResolvedValue(mockHistory as never)
      vi.mocked(prisma.searchHistory.count).mockResolvedValue(1)

      const request = new Request('http://localhost:3000/api/client/search-history')
      const response = await searchHistoryGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(1)
      expect(data.items[0].query).toBe('plumber')
      expect(data.total).toBe(1)
    })

    it('should filter unique searches when requested', async () => {
      const mockUser = { id: 'user_1' }
      const mockHistory = [
        { id: 'search_1', query: 'plumber', profession: 'Plumber', location: 'Nairobi', createdAt: new Date() },
        { id: 'search_2', query: 'plumber', profession: 'Plumber', location: 'Nairobi', createdAt: new Date() }, // Duplicate
        { id: 'search_3', query: 'carpenter', profession: 'Carpenter', location: 'Mombasa', createdAt: new Date() },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.searchHistory.findMany).mockResolvedValue(mockHistory as never)
      vi.mocked(prisma.searchHistory.count).mockResolvedValue(3)

      const request = new Request('http://localhost:3000/api/client/search-history?unique=true&limit=10')
      const response = await searchHistoryGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(2) // Only unique searches
    })
  })

  // ===========================================
  // POST /api/client/search-history
  // ===========================================
  describe('POST /api/client/search-history', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({ query: 'plumber' }),
      })
      const response = await searchHistoryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should not record empty searches', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({}), // Empty search
      })
      const response = await searchHistoryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Search not recorded (no search criteria)')
    })

    it('should return existing search if searched recently', async () => {
      const mockUser = { id: 'user_1' }
      const recentSearch = { id: 'search_1', resultCount: 10 }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.searchHistory.findFirst).mockResolvedValue(recentSearch as never)

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({ query: 'plumber', profession: 'Plumber' }),
      })
      const response = await searchHistoryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Search already recorded recently')
      expect(data.id).toBe('search_1')
    })

    it('should create new search history entry', async () => {
      const mockUser = { id: 'user_1' }
      const newSearch = { id: 'search_new' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.searchHistory.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.searchHistory.create).mockResolvedValue(newSearch as never)
      vi.mocked(prisma.searchHistory.findMany).mockResolvedValue([]) // No old entries to cleanup
      vi.mocked(prisma.searchHistory.deleteMany).mockResolvedValue({ count: 0 } as never)

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({
          query: 'plumber',
          profession: 'Plumber',
          location: 'Nairobi',
          minRating: 4,
          resultCount: 15,
        }),
      })
      const response = await searchHistoryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Search recorded successfully')
      expect(data.id).toBe('search_new')
    })

    it('should return 400 for invalid data', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({
          minRating: 10, // Invalid: max is 5
        }),
      })
      const response = await searchHistoryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })
  })

  // ===========================================
  // DELETE /api/client/search-history
  // ===========================================
  describe('DELETE /api/client/search-history', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'DELETE',
      })
      const response = await searchHistoryDELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when deleting non-existent specific entry', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.searchHistory.deleteMany).mockResolvedValue({ count: 0 } as never)

      const request = new Request('http://localhost:3000/api/client/search-history?id=search_1', {
        method: 'DELETE',
      })
      const response = await searchHistoryDELETE(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Search history entry not found')
    })

    it('should delete specific search history entry', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.searchHistory.deleteMany).mockResolvedValue({ count: 1 } as never)

      const request = new Request('http://localhost:3000/api/client/search-history?id=search_1', {
        method: 'DELETE',
      })
      const response = await searchHistoryDELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Search history entry deleted')
    })

    it('should clear all search history', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.searchHistory.deleteMany).mockResolvedValue({ count: 25 } as never)

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'DELETE',
      })
      const response = await searchHistoryDELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Search history cleared')
      expect(data.deletedCount).toBe(25)
    })
  })
})
