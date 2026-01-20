/**
 * Integration tests for Authentication flows
 * 
 * Tests the authentication-related API routes and middleware behavior
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    profile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}));

import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Import route handlers after mocks
import { POST as userSyncPOST } from '@/app/api/user/sync/route';
import { GET as userMeGET } from '@/app/api/user/me/route';

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Sync API', () => {
    describe('POST /api/user/sync', () => {
      it('should return 401 when not authenticated', async () => {
        vi.mocked(auth).mockResolvedValue({ userId: null } as never);
        vi.mocked(currentUser).mockResolvedValue(null);

        const response = await userSyncPOST();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Not authenticated');
      });

      it('should create new user on first sync', async () => {
        const clerkUser = {
          id: 'clerk_123',
          firstName: 'John',
          lastName: 'Doe',
          emailAddresses: [{ emailAddress: 'john@example.com' }],
          phoneNumbers: [],
          imageUrl: 'https://example.com/avatar.png',
          publicMetadata: {},
        };

        const newUser = {
          id: 'user_1',
          clerkId: 'clerk_123',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CLIENT',
          status: 'ACTIVE',
          profile: { id: 'profile_1', bio: null, country: 'Kenya' },
        };

        vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
        vi.mocked(currentUser).mockResolvedValue(clerkUser as never);
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.user.create).mockResolvedValue(newUser as never);

        const response = await userSyncPOST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.user.id).toBe('user_1');
        expect(data.user.email).toBe('john@example.com');
        expect(data.user.role).toBe('CLIENT');
      });

      it('should return existing user on subsequent sync', async () => {
        const clerkUser = {
          id: 'clerk_123',
          firstName: 'John',
          lastName: 'Doe',
          emailAddresses: [{ emailAddress: 'john@example.com' }],
          phoneNumbers: [],
          imageUrl: 'https://example.com/avatar.png',
          publicMetadata: {},
        };

        const existingUser = {
          id: 'user_1',
          clerkId: 'clerk_123',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'ARTISAN',
          status: 'ACTIVE',
          profile: { id: 'profile_1', bio: 'Skilled artisan', country: 'Kenya' },
        };

        vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
        vi.mocked(currentUser).mockResolvedValue(clerkUser as never);
        vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as never);

        const response = await userSyncPOST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.user.role).toBe('ARTISAN');
        // Verify create was NOT called since user exists
        expect(prisma.user.create).not.toHaveBeenCalled();
      });

      it('should handle database errors gracefully', async () => {
        const clerkUser = {
          id: 'clerk_123',
          firstName: 'John',
          lastName: 'Doe',
          emailAddresses: [{ emailAddress: 'john@example.com' }],
          phoneNumbers: [],
        };

        vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
        vi.mocked(currentUser).mockResolvedValue(clerkUser as never);
        vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database connection failed'));

        const response = await userSyncPOST();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to sync user');
      });
    });
  });

  describe('User Me API', () => {
    describe('GET /api/user/me', () => {
      it('should return 401 when not authenticated', async () => {
        vi.mocked(auth).mockResolvedValue({ userId: null } as never);

        const response = await userMeGET();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Not authenticated');
        expect(data.user).toBe(null);
      });

      it('should return user info for authenticated user', async () => {
        const dbUser = {
          id: 'user_1',
          clerkId: 'clerk_123',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CLIENT',
          status: 'ACTIVE',
          profile: { id: 'profile_1', bio: 'Hello world' },
        };

        vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
        vi.mocked(prisma.user.findUnique).mockResolvedValue(dbUser as never);

        const response = await userMeGET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.clerkUserId).toBe('clerk_123');
        expect(data.user.id).toBe('user_1');
        expect(data.user.email).toBe('john@example.com');
        expect(data.user.role).toBe('CLIENT');
      });

      it('should return null user when not found in database', async () => {
        vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const response = await userMeGET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.clerkUserId).toBe('clerk_123');
        expect(data.user).toBe(null);
      });

      it('should include profile data when available', async () => {
        const dbUser = {
          id: 'user_1',
          clerkId: 'clerk_123',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'ARTISAN',
          status: 'ACTIVE',
          profile: {
            id: 'profile_1',
            bio: 'Skilled carpenter',
            profession: 'Carpenter',
            county: 'Nairobi',
            isVerified: true,
          },
        };

        vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
        vi.mocked(prisma.user.findUnique).mockResolvedValue(dbUser as never);

        const response = await userMeGET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.profile).toBeDefined();
        expect(data.profile.bio).toBe('Skilled carpenter');
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('should identify CLIENT role correctly', async () => {
      const clientUser = {
        id: 'user_1',
        clerkId: 'clerk_123',
        email: 'client@example.com',
        firstName: 'Client',
        lastName: 'User',
        role: 'CLIENT',
        status: 'ACTIVE',
        profile: null,
      };

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(clientUser as never);

      const response = await userMeGET();
      const data = await response.json();

      expect(data.user.role).toBe('CLIENT');
    });

    it('should identify ARTISAN role correctly', async () => {
      const artisanUser = {
        id: 'user_2',
        clerkId: 'clerk_456',
        email: 'artisan@example.com',
        firstName: 'Artisan',
        lastName: 'User',
        role: 'ARTISAN',
        status: 'ACTIVE',
        profile: { id: 'profile_2', profession: 'Carpenter' },
      };

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_456' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(artisanUser as never);

      const response = await userMeGET();
      const data = await response.json();

      expect(data.user.role).toBe('ARTISAN');
    });

    it('should identify ADMIN role correctly', async () => {
      const adminUser = {
        id: 'user_3',
        clerkId: 'clerk_789',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE',
        profile: null,
      };

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_789' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as never);

      const response = await userMeGET();
      const data = await response.json();

      expect(data.user.role).toBe('ADMIN');
    });
  });
});
