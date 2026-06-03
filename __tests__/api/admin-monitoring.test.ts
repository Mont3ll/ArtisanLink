import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), count: vi.fn() },
  },
}))

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { GET } from '@/app/api/admin/system/monitoring/route'

describe('GET /api/admin/system/monitoring', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns real database response time from a timed count query', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'ADMIN' } as never)
    vi.mocked(prisma.user.count).mockResolvedValueOnce(42)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(typeof data.systemHealth.database.responseTime).toBe('number')
    expect(data.systemHealth.database.responseTime).toBeGreaterThanOrEqual(0)
    expect(typeof data.systemHealth.server.memoryUsed).toBe('number')
    expect(typeof data.systemHealth.server.uptime).toBe('number')
    expect(data.systemHealth.server.uptime).toBeGreaterThan(0)
  })

  it('does not use Math.random in its response', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'ADMIN' } as never)
    vi.mocked(prisma.user.count).mockResolvedValueOnce(10)

    const spy = vi.spyOn(Math, 'random')
    await GET()
    expect(spy).not.toHaveBeenCalled()
  })

  it('rejects non-admin callers', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'client-clerk' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'CLIENT' } as never)

    const response = await GET()
    expect(response.status).toBe(403)
  })
})
