/**
 * Tests for Artisan API routes
 * 
 * Covers:
 * - GET /api/artisan/stats - Get artisan dashboard stats
 * - GET /api/artisan/profile - Get artisan profile
 * - PATCH /api/artisan/profile - Update artisan profile
 * - GET /api/artisan/portfolio - List portfolio items
 * - POST /api/artisan/portfolio - Create portfolio item
 * - GET /api/artisan/portfolio/[id] - Get single portfolio item
 * - PUT /api/artisan/portfolio/[id] - Update portfolio item
 * - DELETE /api/artisan/portfolio/[id] - Delete portfolio item
 * - GET /api/artisan/specializations - List specializations
 * - POST /api/artisan/specializations - Create specialization
 * - PUT /api/artisan/specializations/[id] - Update specialization
 * - DELETE /api/artisan/specializations/[id] - Delete specialization
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

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
    profile: {
      update: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    conversation: {
      count: vi.fn(),
    },
    message: {
      count: vi.fn(),
    },
    portfolioItem: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    specialization: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    review: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

// Import mocked modules
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Import route handlers after mocks
import { GET as artisanStatsGET } from '@/app/api/artisan/stats/route'
import { GET as artisanProfileGET, PATCH as artisanProfilePATCH } from '@/app/api/artisan/profile/route'
import { GET as portfolioGET, POST as portfolioPOST } from '@/app/api/artisan/portfolio/route'
import { GET as portfolioByIdGET, PUT as portfolioByIdPUT, DELETE as portfolioByIdDELETE } from '@/app/api/artisan/portfolio/[id]/route'
import { GET as specializationsGET, POST as specializationsPOST } from '@/app/api/artisan/specializations/route'
import { PUT as specializationByIdPUT, DELETE as specializationByIdDELETE } from '@/app/api/artisan/specializations/[id]/route'

// Helper to create route params
const createParams = (id: string) => ({ params: Promise.resolve({ id }) })

describe('Artisan Stats API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/artisan/stats', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new NextRequest('http://localhost/api/artisan/stats')
      const response = await artisanStatsGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when user is not an artisan', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'CLIENT',
        profile: null,
        artisanConversations: [],
      } as never)

      const request = new NextRequest('http://localhost/api/artisan/stats')
      const response = await artisanStatsGET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return artisan stats successfully', async () => {
      const mockArtisanUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        firstName: 'John',
        lastName: 'Artisan',
        email: 'artisan@test.com',
        profile: {
          id: 'profile_1',
          artisanStatus: 'VERIFIED',
          isAvailable: true,
          totalReviews: 10,
          averageRating: 4.5,
          subscription: { status: 'ACTIVE', endDate: new Date('2025-12-31') },
          portfolioItems: [{ id: 'port_1', title: 'Project 1', createdAt: new Date() }],
          reviews: [
            { 
              id: 'rev_1', 
              rating: 5, 
              createdAt: new Date(),
              client: { firstName: 'Jane', lastName: 'Client' }
            }
          ],
          specializations: [{ id: 'spec_1', name: 'Carpentry' }],
        },
        artisanConversations: [
          {
            id: 'conv_1',
            createdAt: new Date(),
            client: { firstName: 'Jane', lastName: 'Client' },
            messages: [{ id: 'msg_1', content: 'Hello', createdAt: new Date() }],
          },
        ],
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockArtisanUser as never)
      vi.mocked(prisma.message.count).mockResolvedValue(3)
      vi.mocked(prisma.conversation.count)
        .mockResolvedValueOnce(5) // total conversations
        .mockResolvedValueOnce(2) // new this month
      vi.mocked(prisma.review.count).mockResolvedValue(5)
      vi.mocked(prisma.review.findMany).mockResolvedValue([] as never)

      const request = new NextRequest('http://localhost/api/artisan/stats')
      const response = await artisanStatsGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.stats).toBeDefined()
      expect(data.stats.isVerified).toBe(true)
      expect(data.stats.totalReviews).toBe(5) // range-filtered review count from prisma.review.count mock
      expect(data.stats.averageRating).toBe(4.5)
      expect(data.stats.unreadMessages).toBe(3)
      expect(data.recentActivity).toBeDefined()
      expect(data.profile).toBeDefined()
    })
  })
})

describe('Artisan Profile API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===========================================
  // GET /api/artisan/profile
  // ===========================================
  describe('GET /api/artisan/profile', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const response = await artisanProfileGET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when user is not an artisan', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'CLIENT',
        profile: null,
      } as never)

      const response = await artisanProfileGET()
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('auto-creates profile when missing (self-healing)', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: 'artisan_1', role: 'ARTISAN', profile: null } as never) // first call: no profile
        .mockResolvedValueOnce({ // second call after profile creation
          id: 'artisan_1', role: 'ARTISAN',
          profile: { id: 'prof_1', artisanStatus: 'PENDING', specializations: [], verificationHistory: [] },
        } as never)
      vi.mocked(prisma.profile.create).mockResolvedValue({ id: 'prof_1' } as never)

      const response = await artisanProfileGET()
      const data = await response.json()

      // Should auto-create profile and return 200
      expect(prisma.profile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'artisan_1', artisanStatus: 'PENDING' })
        })
      )
      expect(response.status).toBe(200)
    })

    it('should return artisan profile with counties', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: {
          id: 'profile_1',
          profession: 'Carpenter',
          bio: 'Experienced carpenter',
          county: 'Nairobi',
          city: 'Nairobi',
          specializations: [{ id: 'spec_1', name: 'Woodworking' }],
        },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const response = await artisanProfileGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile).toBeDefined()
      expect(data.profile.profession).toBe('Carpenter')
      expect(data.counties).toBeDefined()
      expect(data.counties).toContain('Nairobi')
    })
  })

  // ===========================================
  // PATCH /api/artisan/profile
  // ===========================================
  describe('PATCH /api/artisan/profile', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/artisan/profile', {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: true }),
      })
      const response = await artisanProfilePATCH(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when user is not an artisan', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'CLIENT',
        profile: null,
      } as never)

      const request = new Request('http://localhost:3000/api/artisan/profile', {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: true }),
      })
      const response = await artisanProfilePATCH(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return 400 for invalid data', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1', artisanStatus: 'PENDING' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/artisan/profile', {
        method: 'PATCH',
        body: JSON.stringify({ experience: -5 }), // Invalid: negative
      })
      const response = await artisanProfilePATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should return 400 for invalid county', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1', artisanStatus: 'PENDING' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/artisan/profile', {
        method: 'PATCH',
        body: JSON.stringify({ county: 'Invalid County' }),
      })
      const response = await artisanProfilePATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid county. Must be a valid Kenyan county.')
    })

    it('should return 400 when no valid fields to update', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1', artisanStatus: 'PENDING' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/artisan/profile', {
        method: 'PATCH',
        body: JSON.stringify({}), // Empty body
      })
      const response = await artisanProfilePATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No valid fields to update')
    })

    it('should update profile successfully', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1', artisanStatus: 'VERIFIED' },
      }
      const updatedProfile = {
        id: 'profile_1',
        isAvailable: false,
        bio: 'Updated bio',
        county: 'Nairobi',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.profile.update).mockResolvedValue(updatedProfile as never)

      const request = new Request('http://localhost:3000/api/artisan/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          isAvailable: false,
          bio: 'Updated bio',
          county: 'Nairobi',
        }),
      })
      const response = await artisanProfilePATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Profile updated successfully')
      expect(data.profile).toBeDefined()
    })

    it('should set status to PENDING when uploading certificate', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1', artisanStatus: 'UNVERIFIED' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.profile.update).mockResolvedValue({
        id: 'profile_1',
        artisanStatus: 'PENDING',
        certificateUrl: 'https://example.com/cert.pdf',
      } as never)

      const request = new Request('http://localhost:3000/api/artisan/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          certificateUrl: 'https://example.com/cert.pdf',
        }),
      })
      const response = await artisanProfilePATCH(request)

      expect(response.status).toBe(200)
      expect(prisma.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            artisanStatus: 'PENDING',
          }),
        })
      )
    })
  })
})

describe('Portfolio API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===========================================
  // GET /api/artisan/portfolio
  // ===========================================
  describe('GET /api/artisan/portfolio', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio')
      const response = await portfolioGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when user is not an artisan', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'CLIENT',
        profile: null,
      } as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio')
      const response = await portfolioGET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return portfolio items with pagination', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const mockItems = [
        { id: 'port_1', title: 'Project 1', imageUrl: 'https://example.com/img1.jpg' },
        { id: 'port_2', title: 'Project 2', imageUrl: 'https://example.com/img2.jpg' },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.portfolioItem.findMany).mockResolvedValue(mockItems as never)
      vi.mocked(prisma.portfolioItem.count).mockResolvedValue(2)

      const request = new Request('http://localhost:3000/api/artisan/portfolio')
      const response = await portfolioGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(2)
      expect(data.pagination.total).toBe(2)
    })

    it('should filter by category and featured', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.portfolioItem.findMany).mockResolvedValue([])
      vi.mocked(prisma.portfolioItem.count).mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/artisan/portfolio?category=Furniture&featured=true')
      const response = await portfolioGET(request)

      expect(response.status).toBe(200)
      expect(prisma.portfolioItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'Furniture',
            isFeatured: true,
          }),
        })
      )
    })
  })

  // ===========================================
  // POST /api/artisan/portfolio
  // ===========================================
  describe('POST /api/artisan/portfolio', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test', imageUrl: 'https://example.com/img.jpg' }),
      })
      const response = await portfolioPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for invalid data', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio', {
        method: 'POST',
        body: JSON.stringify({ title: '', imageUrl: 'invalid-url' }), // Invalid
      })
      const response = await portfolioPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should create portfolio item successfully', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const newItem = {
        id: 'port_new',
        title: 'New Project',
        description: 'A great project',
        imageUrl: 'https://example.com/img.jpg',
        isFeatured: true,
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.portfolioItem.create).mockResolvedValue(newItem as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Project',
          description: 'A great project',
          imageUrl: 'https://example.com/img.jpg',
          isFeatured: true,
        }),
      })
      const response = await portfolioPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('port_new')
      expect(data.title).toBe('New Project')
    })
  })

  // ===========================================
  // GET /api/artisan/portfolio/[id]
  // ===========================================
  describe('GET /api/artisan/portfolio/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio/port_1')
      const response = await portfolioByIdGET(request, createParams('port_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when portfolio item not found', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.portfolioItem.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/artisan/portfolio/port_1')
      const response = await portfolioByIdGET(request, createParams('port_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Portfolio item not found')
    })

    it('should return 403 when not owner', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const mockItem = { id: 'port_1', profileId: 'other_profile' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.portfolioItem.findUnique).mockResolvedValue(mockItem as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio/port_1')
      const response = await portfolioByIdGET(request, createParams('port_1'))
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return portfolio item successfully', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const mockItem = { id: 'port_1', profileId: 'profile_1', title: 'Project 1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.portfolioItem.findUnique).mockResolvedValue(mockItem as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio/port_1')
      const response = await portfolioByIdGET(request, createParams('port_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('port_1')
      expect(data.title).toBe('Project 1')
    })
  })

  // ===========================================
  // PUT /api/artisan/portfolio/[id]
  // ===========================================
  describe('PUT /api/artisan/portfolio/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio/port_1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated' }),
      })
      const response = await portfolioByIdPUT(request, createParams('port_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when portfolio item not found', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.portfolioItem.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/artisan/portfolio/port_1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated' }),
      })
      const response = await portfolioByIdPUT(request, createParams('port_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Portfolio item not found')
    })

    it('should update portfolio item successfully', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const existingItem = { id: 'port_1', profileId: 'profile_1', title: 'Original' }
      const updatedItem = { id: 'port_1', profileId: 'profile_1', title: 'Updated' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.portfolioItem.findUnique).mockResolvedValue(existingItem as never)
      vi.mocked(prisma.portfolioItem.update).mockResolvedValue(updatedItem as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio/port_1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated' }),
      })
      const response = await portfolioByIdPUT(request, createParams('port_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.title).toBe('Updated')
    })
  })

  // ===========================================
  // DELETE /api/artisan/portfolio/[id]
  // ===========================================
  describe('DELETE /api/artisan/portfolio/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio/port_1', {
        method: 'DELETE',
      })
      const response = await portfolioByIdDELETE(request, createParams('port_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when portfolio item not found', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.portfolioItem.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/artisan/portfolio/port_1', {
        method: 'DELETE',
      })
      const response = await portfolioByIdDELETE(request, createParams('port_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Portfolio item not found')
    })

    it('should delete portfolio item successfully', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const existingItem = { id: 'port_1', profileId: 'profile_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.portfolioItem.findUnique).mockResolvedValue(existingItem as never)
      vi.mocked(prisma.portfolioItem.delete).mockResolvedValue(existingItem as never)

      const request = new Request('http://localhost:3000/api/artisan/portfolio/port_1', {
        method: 'DELETE',
      })
      const response = await portfolioByIdDELETE(request, createParams('port_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

describe('Specializations API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===========================================
  // GET /api/artisan/specializations
  // ===========================================
  describe('GET /api/artisan/specializations', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations')
      const response = await specializationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when user is not an artisan', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'CLIENT',
        profile: null,
      } as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations')
      const response = await specializationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should return only categories when requested', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations?categories=true')
      const response = await specializationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.categories).toBeDefined()
      expect(data.categories).toContain('Carpentry')
      expect(data.specializations).toBeUndefined()
    })

    it('should return specializations with categories', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const mockSpecs = [
        { id: 'spec_1', name: 'Woodworking', skillLevel: 5 },
        { id: 'spec_2', name: 'Furniture Making', skillLevel: 3 },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.specialization.findMany).mockResolvedValue(mockSpecs as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations')
      const response = await specializationsGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.specializations).toHaveLength(2)
      expect(data.categories).toBeDefined()
    })
  })

  // ===========================================
  // POST /api/artisan/specializations
  // ===========================================
  describe('POST /api/artisan/specializations', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations', {
        method: 'POST',
        body: JSON.stringify({ name: 'Woodworking' }),
      })
      const response = await specializationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for invalid data', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations', {
        method: 'POST',
        body: JSON.stringify({ name: '', skillLevel: 10 }), // Invalid
      })
      const response = await specializationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should return 409 when duplicate specialization name', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const existingSpec = { id: 'spec_1', name: 'Woodworking' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.specialization.findUnique).mockResolvedValue(existingSpec as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations', {
        method: 'POST',
        body: JSON.stringify({ name: 'Woodworking' }),
      })
      const response = await specializationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Specialization with this name already exists')
    })

    it('should create specialization successfully', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const newSpec = {
        id: 'spec_new',
        name: 'Furniture Making',
        skillLevel: 4,
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.specialization.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.specialization.create).mockResolvedValue(newSpec as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Furniture Making',
          category: 'Woodworking',
          skillLevel: 4,
          yearsExp: 5,
        }),
      })
      const response = await specializationsPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('spec_new')
      expect(data.name).toBe('Furniture Making')
    })
  })

  // ===========================================
  // PUT /api/artisan/specializations/[id]
  // ===========================================
  describe('PUT /api/artisan/specializations/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations/spec_1', {
        method: 'PUT',
        body: JSON.stringify({ skillLevel: 5 }),
      })
      const response = await specializationByIdPUT(request, createParams('spec_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when specialization not found', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.specialization.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/artisan/specializations/spec_1', {
        method: 'PUT',
        body: JSON.stringify({ skillLevel: 5 }),
      })
      const response = await specializationByIdPUT(request, createParams('spec_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Specialization not found')
    })

    it('should return 409 when updating to duplicate name', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const existingSpec = { id: 'spec_1', profileId: 'profile_1', name: 'Woodworking' }
      const duplicateSpec = { id: 'spec_2', profileId: 'profile_1', name: 'Carpentry' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.specialization.findUnique)
        .mockResolvedValueOnce(existingSpec as never)
        .mockResolvedValueOnce(duplicateSpec as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations/spec_1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Carpentry' }),
      })
      const response = await specializationByIdPUT(request, createParams('spec_1'))
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Specialization with this name already exists')
    })

    it('should update specialization successfully', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const existingSpec = { id: 'spec_1', profileId: 'profile_1', name: 'Woodworking', skillLevel: 3 }
      const updatedSpec = { id: 'spec_1', profileId: 'profile_1', name: 'Woodworking', skillLevel: 5 }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.specialization.findUnique).mockResolvedValue(existingSpec as never)
      vi.mocked(prisma.specialization.update).mockResolvedValue(updatedSpec as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations/spec_1', {
        method: 'PUT',
        body: JSON.stringify({ skillLevel: 5 }),
      })
      const response = await specializationByIdPUT(request, createParams('spec_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.skillLevel).toBe(5)
    })
  })

  // ===========================================
  // DELETE /api/artisan/specializations/[id]
  // ===========================================
  describe('DELETE /api/artisan/specializations/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations/spec_1', {
        method: 'DELETE',
      })
      const response = await specializationByIdDELETE(request, createParams('spec_1'))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when specialization not found', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.specialization.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/artisan/specializations/spec_1', {
        method: 'DELETE',
      })
      const response = await specializationByIdDELETE(request, createParams('spec_1'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Specialization not found')
    })

    it('should delete specialization successfully', async () => {
      const mockUser = {
        id: 'artisan_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1' },
      }
      const existingSpec = { id: 'spec_1', profileId: 'profile_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.specialization.findUnique).mockResolvedValue(existingSpec as never)
      vi.mocked(prisma.specialization.delete).mockResolvedValue(existingSpec as never)

      const request = new Request('http://localhost:3000/api/artisan/specializations/spec_1', {
        method: 'DELETE',
      })
      const response = await specializationByIdDELETE(request, createParams('spec_1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
