/**
 * Auth Flow Integration Tests — ChapaWorks
 *
 * Tests the complete authentication and role-assignment pipeline:
 * - Invite creation → token validation → sign-up with correct role
 * - Critical bug fix: artisan invite recipients landing in client dashboard
 * - Role assignment in after-sign-up with Suspense-fixed cookie
 * - Admin bootstrap email detection
 * - Existing user email-linking (seeded users)
 * - Dashboard routing by role (after-sign-in)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks MUST be defined before any imports that use them

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
  currentUser: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    artisanInvite: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
    },
    profile: { create: vi.fn() },
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/lib/email', () => ({
  sendInviteEmail: vi.fn().mockResolvedValue({ success: true }),
}))

// Static imports after mocks
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Route handlers
import { GET as afterSignUpGET } from '@/app/after-sign-up/route'
import { GET as afterSignInGET } from '@/app/after-sign-in/route'
import { GET as inviteTokenGET, DELETE as inviteTokenDELETE } from '@/app/api/admin/invites/[token]/route'
import { GET as invitesGET, POST as invitesPOST } from '@/app/api/admin/invites/route'

// ─────────────────────────────────────────────────────────────────────────────
// Shared test helpers
// ─────────────────────────────────────────────────────────────────────────────

const mockClerk = {
  users: {
    getUser: vi.fn(),
    updateUserMetadata: vi.fn(),
  },
}

const makeCookieStore = (cookieMap: Record<string, string>) => ({
  get: (name: string) => (cookieMap[name] ? { value: cookieMap[name] } : undefined),
})

const makeClerkUser = (email: string, role?: string, overrides = {}) => ({
  publicMetadata: role ? { role } : {},
  emailAddresses: [{ emailAddress: email }],
  firstName: 'Test',
  lastName: 'User',
  phoneNumbers: [],
  ...overrides,
})

// ─────────────────────────────────────────────────────────────────────────────
// 1. INVITE CREATION
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/admin/invites — Invite creation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clerkClient).mockResolvedValue(mockClerk as never)
    mockClerk.users.getUser.mockResolvedValue(makeClerkUser('admin@test.com'))
    mockClerk.users.updateUserMetadata.mockResolvedValue(makeClerkUser('admin@test.com'))
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const req = new Request('http://localhost/api/admin/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'artisan@test.com' }),
    })
    expect((await invitesPOST(req)).status).toBe(401)
  })

  it('returns 401 when caller is a CLIENT', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'u1' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1', role: 'CLIENT' } as never)
    const req = new Request('http://localhost/api/admin/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'artisan@test.com' }),
    })
    expect((await invitesPOST(req)).status).toBe(401)
  })

  it('creates invite for valid admin + email', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin_clerk' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin1', role: 'ADMIN' } as never)
    vi.mocked(prisma.artisanInvite.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.artisanInvite.create).mockResolvedValue({
      id: 'inv1',
      token: 'abc123',
      email: 'artisan@test.com',
      name: 'Jane Artisan',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      createdAt: new Date(),
    } as never)

    const req = new Request('http://localhost/api/admin/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'artisan@test.com', name: 'Jane Artisan' }),
    })
    const res = await invitesPOST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.invite.token).toBe('abc123')
    expect(data.invite.email).toBe('artisan@test.com')
    expect(prisma.artisanInvite.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'artisan@test.com', invitedBy: 'admin1' }),
      })
    )
  })

  it('rejects duplicate active invite (409)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin_clerk' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin1', role: 'ADMIN' } as never)
    vi.mocked(prisma.artisanInvite.findFirst).mockResolvedValue({
      id: 'existing',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 3600 * 1000),
    } as never)

    const req = new Request('http://localhost/api/admin/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'artisan@test.com' }),
    })
    const res = await invitesPOST(req)
    expect(res.status).toBe(409)
    expect((await res.json()).error).toContain('already exists')
  })

  it('rejects invalid email (400)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin_clerk' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin1', role: 'ADMIN' } as never)
    const req = new Request('http://localhost/api/admin/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    })
    expect((await invitesPOST(req)).status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. INVITE TOKEN VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/admin/invites/[token] — Token validation', () => {
  beforeEach(() => vi.clearAllMocks())

  const makeTokenReq = (token: string) =>
    [new Request(`http://localhost/api/admin/invites/${token}`), { params: Promise.resolve({ token }) }] as const

  it('valid=true for a live PENDING invite', async () => {
    vi.mocked(prisma.artisanInvite.findUnique).mockResolvedValue({
      id: 'i1', email: 'a@test.com', name: 'Artisan', status: 'PENDING',
      expiresAt: new Date(Date.now() + 3600 * 1000), message: null,
    } as never)
    const res = await inviteTokenGET(...makeTokenReq('good-token'))
    const data = await res.json()
    expect(data.valid).toBe(true)
    expect(data.invite.email).toBe('a@test.com')
  })

  it('valid=false + 404 for non-existent token', async () => {
    vi.mocked(prisma.artisanInvite.findUnique).mockResolvedValue(null)
    const res = await inviteTokenGET(...makeTokenReq('ghost'))
    expect(res.status).toBe(404)
    expect((await res.json()).valid).toBe(false)
  })

  it('valid=false for EXPIRED invite', async () => {
    vi.mocked(prisma.artisanInvite.findUnique).mockResolvedValue({
      id: 'i2', email: 'b@test.com', status: 'PENDING',
      expiresAt: new Date(Date.now() - 1000), message: null,
    } as never)
    const res = await inviteTokenGET(...makeTokenReq('expired'))
    expect((await res.json()).valid).toBe(false)
  })

  it('valid=false for ACCEPTED invite (already used)', async () => {
    vi.mocked(prisma.artisanInvite.findUnique).mockResolvedValue({
      id: 'i3', email: 'c@test.com', status: 'ACCEPTED',
      expiresAt: new Date(Date.now() + 3600 * 1000), message: null,
    } as never)
    const res = await inviteTokenGET(...makeTokenReq('used'))
    const data = await res.json()
    expect(data.valid).toBe(false)
    expect(data.error).toContain('already been used')
  })

  it('valid=false for REVOKED invite', async () => {
    vi.mocked(prisma.artisanInvite.findUnique).mockResolvedValue({
      id: 'i4', email: 'd@test.com', status: 'REVOKED',
      expiresAt: new Date(Date.now() + 3600 * 1000), message: null,
    } as never)
    const res = await inviteTokenGET(...makeTokenReq('revoked'))
    expect((await res.json()).valid).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. THE CRITICAL BUG — After Sign-Up role assignment
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /after-sign-up — CRITICAL: correct role assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clerkClient).mockResolvedValue(mockClerk as never)
    mockClerk.users.getUser.mockResolvedValue(makeClerkUser('artisan@test.com'))
    mockClerk.users.updateUserMetadata.mockResolvedValue(makeClerkUser('artisan@test.com', 'artisan'))
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.artisanInvite.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'new_u' } as never)
    vi.mocked(prisma.artisanInvite.updateMany).mockResolvedValue({ count: 1 } as never)
  })

  // THE BUG SCENARIO: invite link → SSR race → cookie='client' → artisan signs up → ends up as client
  it('CRITICAL BUG FIX: invite token cookie overrides a stale client cookie', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_artisan_u' } as never)
    vi.mocked(cookies).mockResolvedValue(makeCookieStore({
      // SSR race: cookie is 'client' (set before hydration corrected it)
      chapaworks_signup_role: 'client',
      // Invite token stored by client-side effect (defense-in-depth)
      chapaworks_invite_token: 'valid-invite-tok',
    }) as never)
    // Invite IS valid
    vi.mocked(prisma.artisanInvite.findUnique).mockResolvedValue({
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 86400 * 1000),
    } as never)

    const res = await afterSignUpGET(new Request('http://localhost/after-sign-up'))

    // MUST force artisan role despite client cookie
    expect(mockClerk.users.updateUserMetadata).toHaveBeenCalledWith(
      'clerk_artisan_u',
      expect.objectContaining({ publicMetadata: { role: 'artisan' } })
    )
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: 'ARTISAN' }) })
    )
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/after-sign-in')
  })

  it('artisan role from cookie (no invite) creates ARTISAN with PENDING status', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_art' } as never)
    vi.mocked(cookies).mockResolvedValue(makeCookieStore({
      chapaworks_signup_role: 'artisan',
    }) as never)

    await afterSignUpGET(new Request('http://localhost/after-sign-up'))

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'ARTISAN',
          profile: expect.objectContaining({
            create: expect.objectContaining({ artisanStatus: 'PENDING', isAvailable: false }),
          }),
        }),
      })
    )
  })

  it('client role from cookie creates CLIENT (no artisanStatus)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_cli' } as never)
    vi.mocked(cookies).mockResolvedValue(makeCookieStore({
      chapaworks_signup_role: 'client',
    }) as never)

    await afterSignUpGET(new Request('http://localhost/after-sign-up'))

    const createCall = vi.mocked(prisma.user.create).mock.calls[0][0]
    expect(createCall.data.role).toBe('CLIENT')
    // Clients don't get artisanStatus
    expect(createCall.data.profile?.create).not.toHaveProperty('artisanStatus')
  })

  it('marks invite ACCEPTED after artisan completes sign-up', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_inv_art' } as never)
    vi.mocked(cookies).mockResolvedValue(makeCookieStore({
      chapaworks_signup_role: 'artisan',
      chapaworks_invite_token: 'tok-to-accept',
    }) as never)
    vi.mocked(prisma.artisanInvite.findUnique).mockResolvedValue({
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 86400 * 1000),
    } as never)

    await afterSignUpGET(new Request('http://localhost/after-sign-up'))

    expect(prisma.artisanInvite.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ token: 'tok-to-accept', status: 'PENDING' }),
        data: expect.objectContaining({ status: 'ACCEPTED' }),
      })
    )
  })

  it('does NOT mark invite ACCEPTED if user signed up as client', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_cli2' } as never)
    vi.mocked(cookies).mockResolvedValue(makeCookieStore({
      chapaworks_signup_role: 'client',
      // No invite token for this user
    }) as never)

    await afterSignUpGET(new Request('http://localhost/after-sign-up'))

    expect(prisma.artisanInvite.updateMany).not.toHaveBeenCalled()
  })

  it('ADMIN BOOTSTRAP: admin email auto-gets admin role regardless of cookie', async () => {
    process.env.ADMIN_BOOTSTRAP_EMAILS = 'superadmin@cw.co.ke'
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_sad' } as never)
    vi.mocked(cookies).mockResolvedValue(makeCookieStore({
      chapaworks_signup_role: 'client', // wrong cookie
    }) as never)
    mockClerk.users.getUser.mockResolvedValue(makeClerkUser('superadmin@cw.co.ke'))
    mockClerk.users.updateUserMetadata.mockResolvedValue(makeClerkUser('superadmin@cw.co.ke', 'admin'))

    await afterSignUpGET(new Request('http://localhost/after-sign-up'))

    // admin role must be set
    const metaCall = mockClerk.users.updateUserMetadata.mock.calls.find(
      (c) => c[1]?.publicMetadata?.role === 'admin'
    )
    expect(metaCall).toBeTruthy()
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: 'ADMIN' }) })
    )

    delete process.env.ADMIN_BOOTSTRAP_EMAILS
  })

  it('links existing seeded DB user by email instead of creating duplicate', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'new_clerk_id' } as never)
    vi.mocked(cookies).mockResolvedValue(makeCookieStore({
      chapaworks_signup_role: 'artisan',
    }) as never)
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(null) // no match by clerkId
      .mockResolvedValueOnce({ // match by email
        id: 'seeded_id', role: 'ARTISAN', firstName: 'Seed', lastName: 'Artisan', phone: null,
      } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({ id: 'seeded_id' } as never)

    await afterSignUpGET(new Request('http://localhost/after-sign-up'))

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'seeded_id' },
        data: expect.objectContaining({ clerkId: 'new_clerk_id' }),
      })
    )
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('redirects to /sign-up when neither cookie nor metadata has a role', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'roleless' } as never)
    vi.mocked(cookies).mockResolvedValue(makeCookieStore({}) as never)
    mockClerk.users.getUser.mockResolvedValue(makeClerkUser('no-role@test.com'))

    const res = await afterSignUpGET(new Request('http://localhost/after-sign-up'))

    expect(res.headers.get('location')).toContain('/sign-up')
  })

  it('returns 307 redirect, not 200, on successful sign-up', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'ok_user' } as never)
    vi.mocked(cookies).mockResolvedValue(makeCookieStore({
      chapaworks_signup_role: 'client',
    }) as never)

    const res = await afterSignUpGET(new Request('http://localhost/after-sign-up'))
    expect(res.status).toBe(307)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. AFTER SIGN-IN — Dashboard routing
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /after-sign-in — Role-based dashboard routing', () => {
  const mockClerkSignIn = { users: { getUser: vi.fn() } }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clerkClient).mockResolvedValue(mockClerkSignIn as never)
  })

  it('admin → /admin-dashboard', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'a', sessionClaims: { publicMetadata: { role: 'admin' } } } as never)
    const res = await afterSignInGET(new Request('http://localhost/after-sign-in'))
    expect(res.headers.get('location')).toMatch(/\/admin($|\/)/)
  })

  it('artisan → /artisan-dashboard', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'b', sessionClaims: { publicMetadata: { role: 'artisan' } } } as never)
    const res = await afterSignInGET(new Request('http://localhost/after-sign-in'))
    expect(res.headers.get('location')).toContain('/artisan/dashboard')
  })

  it('client → /client-dashboard', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'c', sessionClaims: { publicMetadata: { role: 'client' } } } as never)
    const res = await afterSignInGET(new Request('http://localhost/after-sign-in'))
    expect(res.headers.get('location')).toContain('/client/dashboard')
  })

  it('falls back to DB lookup when JWT has no role', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'db_user', sessionClaims: {} } as never)
    mockClerkSignIn.users.getUser.mockResolvedValue({ publicMetadata: {} })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ARTISAN' } as never)
    const res = await afterSignInGET(new Request('http://localhost/after-sign-in'))
    expect(res.headers.get('location')).toContain('/artisan/dashboard')
  })

  it('redirects to /sign-in when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null, sessionClaims: null } as never)
    const res = await afterSignInGET(new Request('http://localhost/after-sign-in'))
    expect(res.headers.get('location')).toContain('/sign-in')
  })

  it('sets verified-role cookie on successful routing', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'c', sessionClaims: { publicMetadata: { role: 'client' } } } as never)
    const res = await afterSignInGET(new Request('http://localhost/after-sign-in'))
    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toContain('chapaworks_verified_role=client')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. INVITE REVOCATION
// ─────────────────────────────────────────────────────────────────────────────

describe('DELETE /api/admin/invites/[token] — Revocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clerkClient).mockResolvedValue(mockClerk as never)
  })

  it('admin can revoke a pending invite', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'adm' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never)
    vi.mocked(prisma.artisanInvite.findUnique).mockResolvedValue({ id: 'i1', token: 'tok1' } as never)
    vi.mocked(prisma.artisanInvite.update).mockResolvedValue({ status: 'REVOKED' } as never)

    const res = await inviteTokenDELETE(
      new Request('http://localhost/api/admin/invites/tok1', { method: 'DELETE' }),
      { params: Promise.resolve({ token: 'tok1' }) }
    )
    expect(res.status).toBe(200)
    expect(prisma.artisanInvite.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'REVOKED' } })
    )
  })

  it('non-admin gets 403', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'cli' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'CLIENT' } as never)
    const res = await inviteTokenDELETE(
      new Request('http://localhost/api/admin/invites/tok1', { method: 'DELETE' }),
      { params: Promise.resolve({ token: 'tok1' }) }
    )
    expect(res.status).toBe(403)
  })
})
