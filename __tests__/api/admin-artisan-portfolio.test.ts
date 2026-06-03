import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}))

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { GET } from '@/app/api/admin/artisans/[id]/portfolio/route'

describe('GET /api/admin/artisans/[id]/portfolio', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns portfolio item images for an admin', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ role: 'ADMIN' } as never)
      .mockResolvedValueOnce({
        id: 'artisan-1',
        firstName: 'Grace',
        lastName: 'Wanjiku',
        profile: {
          id: 'profile-1',
          portfolioItems: [
            { id: 'p1', title: 'Walnut table', description: 'Solid joinery', imageUrl: 'https://cdn.test/table.jpg', imageUrls: ['https://cdn.test/table-2.jpg'], category: 'Furniture', tags: ['wood'], isPublic: true, createdAt: new Date('2026-01-01') },
          ],
        },
      } as never)

    const response = await GET(new Request('http://localhost/api/admin/artisans/artisan-1/portfolio'), {
      params: Promise.resolve({ id: 'artisan-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.artisan.name).toBe('Grace Wanjiku')
    expect(data.portfolio).toHaveLength(1)
    expect(data.portfolio[0].images).toEqual(['https://cdn.test/table.jpg', 'https://cdn.test/table-2.jpg'])
  })

  it('rejects non-admin callers', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'client-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'CLIENT' } as never)

    const response = await GET(new Request('http://localhost/api/admin/artisans/artisan-1/portfolio'), {
      params: Promise.resolve({ id: 'artisan-1' }),
    })

    expect(response.status).toBe(403)
  })
})
