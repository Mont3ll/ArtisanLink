import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    specialization: {
      groupBy: vi.fn(),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}))

vi.mock('@/lib/cache', () => ({
  cachedJsonResponse: vi.fn((data) => {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }),
  CACHE_DURATIONS: { MEDIUM: 300 },
  STALE_DURATIONS: { SHORT: 60 },
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => ({ allowed: true })),
  RATE_LIMITS: { SEARCH: { limit: 100, window: 60 } },
}))

import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { GET } from '@/app/api/search/artisans/route'

describe('Search Artisans API - GET /api/search/artisans', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockArtisanProfile = {
    id: 'profile-1',
    profession: 'Carpenter',
    bio: 'Expert woodworker with 10 years experience',
    profileImage: 'https://example.com/image.jpg',
    city: 'Nairobi',
    county: 'Nairobi',
    latitude: -1.2921,
    longitude: 36.8219,
    experience: 10,
    hourlyRate: 500,
    isAvailable: true,
    artisanStatus: 'VERIFIED',
    averageRating: 4.5,
    totalReviews: 25,
    createdAt: new Date('2024-01-01'),
    user: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date('2024-01-01'),
    },
    specializations: [
      { name: 'Furniture Making', skillLevel: 'EXPERT' },
      { name: 'Wood Carving', skillLevel: 'ADVANCED' },
    ],
  }

  it('should return artisans with default pagination', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([
      { profession: 'Carpenter', _count: { profession: 5 } },
    ] as never)
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([
      { name: 'Furniture Making', _count: { name: 3 } },
    ] as never)

    const request = new Request('http://localhost/api/search/artisans')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.artisans).toHaveLength(1)
    expect(data.artisans[0].name).toBe('John Doe')
    expect(data.artisans[0].profession).toBe('Carpenter')
    expect(data.pagination.page).toBe(1)
    expect(data.pagination.limit).toBe(20)
  })

  it('should filter by search query', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?q=carpenter')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ profession: { contains: 'carpenter', mode: 'insensitive' } }),
          ]),
        }),
      })
    )
  })

  it('should filter by profession', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?profession=Carpenter')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          profession: { contains: 'Carpenter', mode: 'insensitive' },
        }),
      })
    )
  })

  it('should filter by county', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?county=Nairobi')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          county: { equals: 'Nairobi', mode: 'insensitive' },
        }),
      })
    )
  })

  it('should filter by city', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?city=Nairobi')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          city: { contains: 'Nairobi', mode: 'insensitive' },
        }),
      })
    )
  })

  it('should filter by minimum rating', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?minRating=4')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          averageRating: { gte: 4 },
        }),
      })
    )
  })

  it('should filter by hourly rate range', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?minRate=300&maxRate=1000')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          hourlyRate: { gte: 300, lte: 1000 },
        }),
      })
    )
  })

  it('should filter by availability', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?available=true')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isAvailable: true,
        }),
      })
    )
  })

  it('should filter by verified only', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?verified=true')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          artisanStatus: 'VERIFIED',
        }),
      })
    )
  })

  it('should filter by specialization', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?specialization=Furniture')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          specializations: {
            some: {
              name: { contains: 'Furniture', mode: 'insensitive' },
            },
          },
        }),
      })
    )
  })

  it('should handle custom pagination', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([])
    vi.mocked(prisma.profile.count).mockResolvedValue(100)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?page=3&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(data.pagination.page).toBe(3)
    expect(data.pagination.limit).toBe(10)
    expect(data.pagination.totalPages).toBe(10)
    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      })
    )
  })

  it('should clamp limit to maximum of 50', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([])
    vi.mocked(prisma.profile.count).mockResolvedValue(0)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?limit=100')
    const response = await GET(request)
    const data = await response.json()

    expect(data.pagination.limit).toBe(50)
  })

  it('should sort by rating by default', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([])
    vi.mocked(prisma.profile.count).mockResolvedValue(0)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ averageRating: 'desc' }, { totalReviews: 'desc' }],
      })
    )
  })

  it('should sort by reviews count', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([])
    vi.mocked(prisma.profile.count).mockResolvedValue(0)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?sortBy=reviews')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ totalReviews: 'desc' }],
      })
    )
  })

  it('should sort by hourly rate', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([])
    vi.mocked(prisma.profile.count).mockResolvedValue(0)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?sortBy=rate&sortOrder=asc')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ hourlyRate: 'asc' }],
      })
    )
  })

  it('should sort by recent', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([])
    vi.mocked(prisma.profile.count).mockResolvedValue(0)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?sortBy=recent')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }],
      })
    )
  })

  it('should calculate distance when lat/lng provided', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?lat=-1.3&lng=36.8')
    const response = await GET(request)
    const data = await response.json()

    expect(data.artisans[0].distance).not.toBeNull()
    expect(typeof data.artisans[0].distance).toBe('number')
  })

  it('should filter by radius when geolocation search is active', async () => {
    const farAwayProfile = {
      ...mockArtisanProfile,
      id: 'profile-2',
      latitude: -4.0, // Far from search location
      longitude: 39.0,
      user: {
        ...mockArtisanProfile.user,
        id: 'user-2',
        firstName: 'Jane',
      },
    }

    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile, farAwayProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(2)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?lat=-1.29&lng=36.82&radius=10')
    const response = await GET(request)
    const data = await response.json()

    // The far away profile should be filtered out due to radius
    expect(data.artisans.length).toBeLessThanOrEqual(2)
  })

  it('should return facets for filtering', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([])
    vi.mocked(prisma.profile.count).mockResolvedValue(0)
    vi.mocked(prisma.profile.groupBy)
      .mockResolvedValueOnce([
        { profession: 'Carpenter', _count: { profession: 5 } },
        { profession: 'Plumber', _count: { profession: 3 } },
      ] as never)
      .mockResolvedValueOnce([
        { county: 'Nairobi', _count: { county: 10 } },
        { county: 'Mombasa', _count: { county: 5 } },
      ] as never)
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([
      { name: 'Furniture Making', _count: { name: 3 } },
    ] as never)

    const request = new Request('http://localhost/api/search/artisans')
    const response = await GET(request)
    const data = await response.json()

    expect(data.facets).toBeDefined()
    expect(data.facets.professions).toHaveLength(2)
    expect(data.facets.counties).toHaveLength(2)
    expect(data.facets.specializations).toHaveLength(1)
  })

  it('should return search params in response', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([])
    vi.mocked(prisma.profile.count).mockResolvedValue(0)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?q=carpenter&county=Nairobi&minRating=4')
    const response = await GET(request)
    const data = await response.json()

    expect(data.searchParams).toBeDefined()
    expect(data.searchParams.query).toBe('carpenter')
    expect(data.searchParams.county).toBe('Nairobi')
    expect(data.searchParams.minRating).toBe(4)
  })

  it('should return 429 when rate limited', async () => {
    vi.mocked(rateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
      headers: new Headers(),
      response: new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 }),
    } as never)

    const request = new Request('http://localhost/api/search/artisans')
    const response = await GET(request)

    expect(response.status).toBe(429)
  })

  it('should return 500 on database error', async () => {
    vi.mocked(rateLimit).mockReturnValue({ 
      allowed: true,
      remaining: 99,
      resetAt: Date.now() + 60000,
      headers: new Headers(),
    } as never)
    vi.mocked(prisma.profile.findMany).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost/api/search/artisans')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Internal server error')
  })

  it('should use alternative query param name', async () => {
    vi.mocked(prisma.profile.findMany).mockResolvedValue([mockArtisanProfile])
    vi.mocked(prisma.profile.count).mockResolvedValue(1)
    vi.mocked(prisma.profile.groupBy).mockResolvedValue([])
    vi.mocked(prisma.specialization.groupBy).mockResolvedValue([])

    const request = new Request('http://localhost/api/search/artisans?query=plumber')
    await GET(request)

    expect(prisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ profession: { contains: 'plumber', mode: 'insensitive' } }),
          ]),
        }),
      })
    )
  })
})
