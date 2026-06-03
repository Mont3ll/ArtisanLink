import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: { STRICT: { windowMs: 60_000, max: 10 } },
  rateLimit: vi.fn(() => ({ allowed: true })),
}))

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PATCH } from '@/app/api/admin/users/[id]/route'

describe('PATCH /api/admin/users/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('suspends a user when called by an admin', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: 'admin-id', role: 'ADMIN' } as never)
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: 'target-id',
      status: 'SUSPENDED',
      email: 'target@example.com',
      firstName: 'Target',
      lastName: 'User',
      role: 'CLIENT',
    } as never)

    const request = new Request('http://localhost/api/admin/users/target-id', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'SUSPENDED' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'target-id' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'target-id' },
      data: { status: 'SUSPENDED' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    })
    expect(data.user.status).toBe('SUSPENDED')
  })

  it('rejects non-admin callers', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'client-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: 'client-id', role: 'CLIENT' } as never)

    const request = new Request('http://localhost/api/admin/users/target-id', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'SUSPENDED' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'target-id' }) })

    expect(response.status).toBe(403)
    expect(prisma.user.update).not.toHaveBeenCalled()
  })
})
