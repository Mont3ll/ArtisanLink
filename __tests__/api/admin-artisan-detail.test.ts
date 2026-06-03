import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    profile: { update: vi.fn() },
  },
}))
vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: { STRICT: { windowMs: 60_000, max: 10 }, NORMAL: { windowMs: 60_000, max: 30 } },
  rateLimit: vi.fn(() => ({ allowed: true })),
}))

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { GET, PATCH } from '@/app/api/admin/artisans/[id]/route'

const mockParams = (id: string) => ({ params: Promise.resolve({ id }) })

describe('GET /api/admin/artisans/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns artisan detail for admin', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ role: 'ADMIN' } as never)
      .mockResolvedValueOnce({
        id: 'artisan-1',
        firstName: 'Grace',
        lastName: 'Wanjiku',
        email: 'grace@test.com',
        createdAt: new Date('2026-01-01'),
        profile: {
          id: 'profile-1',
          profession: 'Carpenter',
          city: 'Nairobi',
          county: 'Nairobi',
          isAvailable: true,
          artisanStatus: 'VERIFIED',
          averageRating: 4.9,
          totalReviews: 12,
          idDocumentUrl: 'https://cdn.test/id.jpg',
          certificateUrl: 'https://cdn.test/cert.jpg',
          _count: { portfolioItems: 5 },
          subscription: null,
        },
      } as never)

    const response = await GET(new Request('http://localhost'), mockParams('artisan-1'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.artisan.name).toBe('Grace Wanjiku')
    expect(data.artisan.verificationStatus).toBe('VERIFIED')
    expect(data.artisan.isAvailable).toBe(true)
    expect(data.artisan.documents).toContain('National ID')
    expect(data.artisan.documents).toContain('Certificate')
    expect(data.artisan.portfolioCount).toBe(5)
  })

  it('returns 403 for non-admin', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'client-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'CLIENT' } as never)

    const response = await GET(new Request('http://localhost'), mockParams('artisan-1'))
    expect(response.status).toBe(403)
  })

  it('returns 404 for unknown artisan', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ role: 'ADMIN' } as never)
      .mockResolvedValueOnce(null)

    const response = await GET(new Request('http://localhost'), mockParams('unknown'))
    expect(response.status).toBe(404)
  })
})

describe('PATCH /api/admin/artisans/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates isAvailable for admin', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ id: 'admin-db', role: 'ADMIN' } as never)
      .mockResolvedValueOnce({ id: 'artisan-1', role: 'ARTISAN', profile: { id: 'profile-1' } } as never)
    vi.mocked(prisma.profile.update).mockResolvedValueOnce({
      id: 'profile-1',
      isAvailable: false,
      artisanStatus: 'VERIFIED',
    } as never)

    const request = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable: false }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await PATCH(request, mockParams('artisan-1'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.profile.update).toHaveBeenCalledWith({
      where: { id: 'profile-1' },
      data: { isAvailable: false },
      select: { id: true, isAvailable: true, artisanStatus: true },
    })
    expect(data.profile.isAvailable).toBe(false)
  })

  it('rejects non-admin callers', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'client-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: 'client-id', role: 'CLIENT' } as never)

    const request = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable: false }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await PATCH(request, mockParams('artisan-1'))
    expect(response.status).toBe(403)
    expect(prisma.profile.update).not.toHaveBeenCalled()
  })
})
