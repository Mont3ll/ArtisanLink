/**
 * Tests for User API routes
 * 
 * Covers:
 * - POST /api/user/sync - Sync user from Clerk to database
 * - GET /api/user/me - Get current user info
 * - GET /api/user/notification-preferences - Get notification preferences
 * - PATCH /api/user/notification-preferences - Update notification preferences
 * - POST /api/user/notification-preferences - Create notification preferences
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}))

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    notificationPreferences: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

// Import mocked modules
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Import route handlers after mocks
import { POST as userSyncPOST } from '@/app/api/user/sync/route'
import { GET as userMeGET } from '@/app/api/user/me/route'
import { GET as preferencesGET, PATCH as preferencesPATCH, POST as preferencesPOST } from '@/app/api/user/notification-preferences/route'

describe('User Sync API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/user/sync', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)
      vi.mocked(currentUser).mockResolvedValue(null as never)

      const response = await userSyncPOST()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Not authenticated')
    })

    it('should return existing user if already synced', async () => {
      const mockClerkUser = {
        id: 'clerk_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
        phoneNumbers: [],
      }
      const existingUser = {
        id: 'user_1',
        clerkId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CLIENT',
        status: 'ACTIVE',
        profile: {},
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(currentUser).mockResolvedValue(mockClerkUser as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as never)

      const response = await userSyncPOST()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.id).toBe('user_1')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('should create new user if not exists', async () => {
      const mockClerkUser = {
        id: 'clerk_123',
        emailAddresses: [{ emailAddress: 'new@example.com' }],
        firstName: 'New',
        lastName: 'User',
        phoneNumbers: [{ phoneNumber: '+254712345678' }],
        publicMetadata: { role: 'client' }, // role is required for user creation
      }
      const newUser = {
        id: 'user_new',
        clerkId: 'clerk_123',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'CLIENT',
        status: 'ACTIVE',
        profile: {},
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(currentUser).mockResolvedValue(mockClerkUser as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.create).mockResolvedValue(newUser as never)

      const response = await userSyncPOST()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.id).toBe('user_new')
      expect(data.user.role).toBe('CLIENT')
      expect(prisma.user.create).toHaveBeenCalled()
    })
  })
})

describe('User Me API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/user/me', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const response = await userMeGET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Not authenticated')
      expect(data.clerkUserId).toBeNull()
      expect(data.user).toBeNull()
    })

    it('should return null user when not in database', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const response = await userMeGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.clerkUserId).toBe('clerk_123')
      expect(data.user).toBeNull()
    })

    it('should return user with profile', async () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CLIENT',
        status: 'ACTIVE',
        profile: {
          id: 'profile_1',
          bio: 'Test bio',
        },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const response = await userMeGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.clerkUserId).toBe('clerk_123')
      expect(data.user.id).toBe('user_1')
      expect(data.user.role).toBe('CLIENT')
      expect(data.profile.bio).toBe('Test bio')
    })
  })
})

describe('Notification Preferences API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===========================================
  // GET /api/user/notification-preferences
  // ===========================================
  describe('GET /api/user/notification-preferences', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const response = await preferencesGET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const response = await preferencesGET()
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should return existing preferences', async () => {
      const mockUser = {
        id: 'user_1',
        notificationPreferences: {
          emailNotifications: true,
          pushNotifications: false,
          smsNotifications: false,
          messageNotifications: true,
          reviewNotifications: true,
          verificationNotifications: true,
          systemNotifications: false,
          promotionNotifications: false,
          bookingNotifications: true,
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
        },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const response = await preferencesGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.preferences.emailNotifications).toBe(true)
      expect(data.preferences.pushNotifications).toBe(false)
      expect(data.preferences.quietHoursEnabled).toBe(true)
    })

    it('should return default preferences when none exist', async () => {
      const mockUser = {
        id: 'user_1',
        notificationPreferences: null,
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const response = await preferencesGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.preferences.emailNotifications).toBe(true)
      expect(data.preferences.pushNotifications).toBe(true)
      expect(data.preferences.smsNotifications).toBe(false)
      expect(data.preferences.quietHoursEnabled).toBe(false)
    })
  })

  // ===========================================
  // PATCH /api/user/notification-preferences
  // ===========================================
  describe('PATCH /api/user/notification-preferences', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/user/notification-preferences', {
        method: 'PATCH',
        body: JSON.stringify({ emailNotifications: false }),
      })
      const response = await preferencesPATCH(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/user/notification-preferences', {
        method: 'PATCH',
        body: JSON.stringify({ emailNotifications: false }),
      })
      const response = await preferencesPATCH(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should return 400 for invalid data', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/user/notification-preferences', {
        method: 'PATCH',
        body: JSON.stringify({ quietHoursStart: 'invalid-time' }),
      })
      const response = await preferencesPATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should return 400 when enabling quiet hours without times', async () => {
      const mockUser = { id: 'user_1' }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/user/notification-preferences', {
        method: 'PATCH',
        body: JSON.stringify({ quietHoursEnabled: true }), // No times
      })
      const response = await preferencesPATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Quiet hours start and end times are required when quiet hours are enabled')
    })

    it('should update preferences successfully', async () => {
      const mockUser = { id: 'user_1' }
      const updatedPrefs = {
        id: 'prefs_1',
        userId: 'user_1',
        emailNotifications: false,
        pushNotifications: true,
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.notificationPreferences.upsert).mockResolvedValue(updatedPrefs as never)

      const request = new Request('http://localhost:3000/api/user/notification-preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          emailNotifications: false,
          pushNotifications: true,
        }),
      })
      const response = await preferencesPATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Notification preferences updated successfully')
      expect(data.preferences.emailNotifications).toBe(false)
    })

    it('should update quiet hours successfully', async () => {
      const mockUser = { id: 'user_1' }
      const updatedPrefs = {
        id: 'prefs_1',
        userId: 'user_1',
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.notificationPreferences.upsert).mockResolvedValue(updatedPrefs as never)

      const request = new Request('http://localhost:3000/api/user/notification-preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
        }),
      })
      const response = await preferencesPATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.preferences.quietHoursEnabled).toBe(true)
      expect(data.preferences.quietHoursStart).toBe('22:00')
    })
  })

  // ===========================================
  // POST /api/user/notification-preferences
  // ===========================================
  describe('POST /api/user/notification-preferences', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never)

      const request = new Request('http://localhost:3000/api/user/notification-preferences', {
        method: 'POST',
        body: JSON.stringify({ emailNotifications: true }),
      })
      const response = await preferencesPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 409 when preferences already exist', async () => {
      const mockUser = {
        id: 'user_1',
        notificationPreferences: { id: 'prefs_1' },
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const request = new Request('http://localhost:3000/api/user/notification-preferences', {
        method: 'POST',
        body: JSON.stringify({ emailNotifications: true }),
      })
      const response = await preferencesPOST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Notification preferences already exist. Use PATCH to update.')
    })

    it('should create preferences successfully', async () => {
      const mockUser = {
        id: 'user_1',
        notificationPreferences: null,
      }
      const newPrefs = {
        id: 'prefs_new',
        userId: 'user_1',
        emailNotifications: true,
        pushNotifications: false,
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.notificationPreferences.create).mockResolvedValue(newPrefs as never)

      const request = new Request('http://localhost:3000/api/user/notification-preferences', {
        method: 'POST',
        body: JSON.stringify({
          emailNotifications: true,
          pushNotifications: false,
        }),
      })
      const response = await preferencesPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Notification preferences created successfully')
      expect(data.preferences.id).toBe('prefs_new')
    })
  })
})
