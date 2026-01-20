/**
 * Integration tests for Search functionality
 * 
 * Tests the search-related API routes:
 * - Artisan search with filters
 * - Search history management
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    profile: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    specialization: {
      groupBy: vi.fn(),
    },
    searchHistory: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Import route handlers after mocks
import { GET as searchArtisansGET } from '@/app/api/search/artisans/route';
import { GET as searchHistoryGET, POST as searchHistoryPOST, DELETE as searchHistoryDELETE } from '@/app/api/client/search-history/route';

describe('Search Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/search/artisans', () => {
    const mockProfiles = [
      {
        id: 'profile_1',
        profession: 'Carpenter',
        bio: 'Skilled carpenter with 10 years experience',
        profileImage: 'https://example.com/img1.jpg',
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
        createdAt: new Date(),
        user: {
          id: 'user_1',
          firstName: 'John',
          lastName: 'Doe',
          createdAt: new Date(),
        },
        specializations: [
          { name: 'Furniture Making', skillLevel: 'EXPERT' },
        ],
      },
      {
        id: 'profile_2',
        profession: 'Plumber',
        bio: 'Professional plumber',
        profileImage: 'https://example.com/img2.jpg',
        city: 'Mombasa',
        county: 'Mombasa',
        latitude: -4.0435,
        longitude: 39.6682,
        experience: 5,
        hourlyRate: 400,
        isAvailable: true,
        artisanStatus: 'PENDING',
        averageRating: 4.0,
        totalReviews: 10,
        createdAt: new Date(),
        user: {
          id: 'user_2',
          firstName: 'Jane',
          lastName: 'Smith',
          createdAt: new Date(),
        },
        specializations: [],
      },
    ];

    beforeEach(() => {
      // Default mock responses
      vi.mocked(prisma.profile.findMany).mockResolvedValue(mockProfiles as never);
      vi.mocked(prisma.profile.count).mockResolvedValue(2);
      vi.mocked(prisma.profile.groupBy).mockResolvedValue([
        { profession: 'Carpenter', _count: { profession: 5 } },
        { profession: 'Plumber', _count: { profession: 3 } },
      ] as never);
      vi.mocked(prisma.specialization.groupBy).mockResolvedValue([
        { name: 'Furniture Making', _count: { name: 5 } },
      ] as never);
    });

    it('should return artisans with default pagination', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.artisans).toHaveLength(2);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(20);
      expect(data.pagination.total).toBe(2);
    });

    it('should search artisans by query', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?q=carpenter');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.searchParams.query).toBe('carpenter');
    });

    it('should filter artisans by profession', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?profession=Plumber');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.searchParams.profession).toBe('Plumber');
    });

    it('should filter artisans by county', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?county=Nairobi');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.searchParams.county).toBe('Nairobi');
    });

    it('should filter artisans by city', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?city=Mombasa');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
    });

    it('should filter by minimum rating', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?minRating=4');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.searchParams.minRating).toBe(4);
    });

    it('should filter by availability', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?available=true');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.searchParams.availableOnly).toBe(true);
    });

    it('should filter by verified status', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?verified=true');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.searchParams.verifiedOnly).toBe(true);
    });

    it('should filter by specialization', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?specialization=Furniture');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
    });

    it('should support pagination parameters', async () => {
      vi.mocked(prisma.profile.count).mockResolvedValue(100);

      const request = new Request('http://localhost:3000/api/search/artisans?page=2&limit=10');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.totalPages).toBe(10);
    });

    it('should clamp pagination limits', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?page=0&limit=100');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(1); // Clamped to minimum 1
      expect(data.pagination.limit).toBe(50); // Clamped to maximum 50
    });

    it('should sort by rating (default)', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.searchParams.sortBy).toBe('rating');
      expect(data.searchParams.sortOrder).toBe('desc');
    });

    it('should sort by reviews count', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?sortBy=reviews&sortOrder=desc');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.searchParams.sortBy).toBe('reviews');
    });

    it('should sort by hourly rate', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?sortBy=rate&sortOrder=asc');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.searchParams.sortBy).toBe('rate');
    });

    it('should sort by recent', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?sortBy=recent');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.searchParams.sortBy).toBe('recent');
    });

    it('should calculate distance for geospatial search', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?lat=-1.2921&lng=36.8219&radius=1000');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // First artisan should have distance 0 (same location)
      expect(data.artisans[0].distance).toBe(0);
      // Second artisan (if returned) should have distance > 0
      if (data.artisans.length > 1) {
        expect(data.artisans[1].distance).toBeGreaterThan(0);
      }
    });

    it('should filter by radius for geospatial search', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?lat=-1.2921&lng=36.8219&radius=100');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // All returned artisans should be within the radius
      data.artisans.forEach((artisan: { distance: number | null }) => {
        expect(artisan.distance === null || artisan.distance <= 100).toBe(true);
      });
    });

    it('should sort by distance when requested', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?lat=-1.2921&lng=36.8219&sortBy=distance&sortOrder=asc');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
    });

    it('should return facets for filtering', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.facets).toBeDefined();
      expect(data.facets.professions).toBeDefined();
      expect(data.facets.counties).toBeDefined();
      expect(data.facets.specializations).toBeDefined();
    });

    it('should transform artisan data correctly', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const artisan = data.artisans[0];
      expect(artisan.id).toBe('user_1');
      expect(artisan.profileId).toBe('profile_1');
      expect(artisan.name).toBe('John Doe');
      expect(artisan.profession).toBe('Carpenter');
      expect(artisan.location.city).toBe('Nairobi');
      expect(artisan.location.county).toBe('Nairobi');
      expect(artisan.rating.average).toBe(4.5);
      expect(artisan.rating.total).toBe(25);
      expect(artisan.isVerified).toBe(true);
    });

    it('should filter by hourly rate range', async () => {
      const request = new Request('http://localhost:3000/api/search/artisans?minRate=300&maxRate=600');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(prisma.profile.findMany).mockRejectedValue(new Error('Database error'));

      const request = new Request('http://localhost:3000/api/search/artisans');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should return empty results when no matches', async () => {
      vi.mocked(prisma.profile.findMany).mockResolvedValue([]);
      vi.mocked(prisma.profile.count).mockResolvedValue(0);

      const request = new Request('http://localhost:3000/api/search/artisans?q=nonexistent');
      const response = await searchArtisansGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.artisans).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
    });
  });

  describe('GET /api/client/search-history', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never);

      const request = new Request('http://localhost:3000/api/client/search-history');
      const response = await searchHistoryGET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/client/search-history');
      const response = await searchHistoryGET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return search history for authenticated user', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.searchHistory.findMany).mockResolvedValue([
        {
          id: 'search_1',
          query: 'carpenter',
          profession: 'Carpenter',
          location: 'Nairobi',
          minRating: 4,
          maxRadius: null,
          filters: null,
          resultCount: 10,
          latitude: null,
          longitude: null,
          createdAt: new Date(),
        },
      ] as never);
      vi.mocked(prisma.searchHistory.count).mockResolvedValue(1);

      const request = new Request('http://localhost:3000/api/client/search-history');
      const response = await searchHistoryGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].query).toBe('carpenter');
      expect(data.total).toBe(1);
    });

    it('should support limit parameter', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.searchHistory.findMany).mockResolvedValue([]);
      vi.mocked(prisma.searchHistory.count).mockResolvedValue(0);

      const request = new Request('http://localhost:3000/api/client/search-history?limit=5');
      const response = await searchHistoryGET(request);

      expect(response.status).toBe(200);
    });

    it('should filter unique searches when requested', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.searchHistory.findMany).mockResolvedValue([
        { id: 'search_1', query: 'carpenter', profession: null, location: 'Nairobi', createdAt: new Date() },
        { id: 'search_2', query: 'carpenter', profession: null, location: 'Nairobi', createdAt: new Date() },
        { id: 'search_3', query: 'plumber', profession: null, location: 'Mombasa', createdAt: new Date() },
      ] as never);
      vi.mocked(prisma.searchHistory.count).mockResolvedValue(3);

      const request = new Request('http://localhost:3000/api/client/search-history?unique=true');
      const response = await searchHistoryGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(2); // Duplicates filtered
    });
  });

  describe('POST /api/client/search-history', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never);

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({ query: 'carpenter' }),
      });
      const response = await searchHistoryPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({ query: 'carpenter' }),
      });
      const response = await searchHistoryPOST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should skip empty searches', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({}), // No query, profession, or location
      });
      const response = await searchHistoryPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('not recorded');
    });

    it('should return 400 for invalid data', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({ minRating: 10 }), // Invalid rating (max 5)
      });
      const response = await searchHistoryPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should create search history entry', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.searchHistory.findFirst).mockResolvedValue(null); // No recent duplicate
      vi.mocked(prisma.searchHistory.create).mockResolvedValue({ id: 'search_new' } as never);
      vi.mocked(prisma.searchHistory.findMany).mockResolvedValue([]); // No old entries to clean
      vi.mocked(prisma.searchHistory.deleteMany).mockResolvedValue({ count: 0 });

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({
          query: 'carpenter',
          profession: 'Carpenter',
          location: 'Nairobi',
          minRating: 4,
          resultCount: 15,
        }),
      });
      const response = await searchHistoryPOST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toContain('recorded successfully');
      expect(data.id).toBe('search_new');
    });

    it('should skip duplicate recent searches', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.searchHistory.findFirst).mockResolvedValue({
        id: 'search_existing',
        resultCount: 10,
      } as never);

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({
          query: 'carpenter',
          location: 'Nairobi',
        }),
      });
      const response = await searchHistoryPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('already recorded');
      expect(data.id).toBe('search_existing');
    });

    it('should update result count for existing recent search', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.searchHistory.findFirst).mockResolvedValue({
        id: 'search_existing',
        resultCount: 10,
      } as never);
      vi.mocked(prisma.searchHistory.update).mockResolvedValue({} as never);

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({
          query: 'carpenter',
          resultCount: 20, // Different result count
        }),
      });
      const response = await searchHistoryPOST(request);

      expect(response.status).toBe(200);
      expect(prisma.searchHistory.update).toHaveBeenCalled();
    });

    it('should cleanup old entries', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.searchHistory.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.searchHistory.create).mockResolvedValue({ id: 'search_new' } as never);
      vi.mocked(prisma.searchHistory.findMany).mockResolvedValue([
        { id: 'old_1' },
        { id: 'old_2' },
      ] as never);
      vi.mocked(prisma.searchHistory.deleteMany).mockResolvedValue({ count: 2 });

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'POST',
        body: JSON.stringify({ query: 'carpenter' }),
      });
      const response = await searchHistoryPOST(request);

      expect(response.status).toBe(201);
      expect(prisma.searchHistory.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['old_1', 'old_2'] } },
      });
    });
  });

  describe('DELETE /api/client/search-history', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never);

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'DELETE',
      });
      const response = await searchHistoryDELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'DELETE',
      });
      const response = await searchHistoryDELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should delete specific search history entry', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.searchHistory.deleteMany).mockResolvedValue({ count: 1 });

      const request = new Request('http://localhost:3000/api/client/search-history?id=search_1', {
        method: 'DELETE',
      });
      const response = await searchHistoryDELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('entry deleted');
    });

    it('should return 404 when specific entry not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.searchHistory.deleteMany).mockResolvedValue({ count: 0 });

      const request = new Request('http://localhost:3000/api/client/search-history?id=nonexistent', {
        method: 'DELETE',
      });
      const response = await searchHistoryDELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should clear all search history', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.searchHistory.deleteMany).mockResolvedValue({ count: 15 });

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'DELETE',
      });
      const response = await searchHistoryDELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('cleared');
      expect(data.deletedCount).toBe(15);
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.searchHistory.deleteMany).mockRejectedValue(new Error('Database error'));

      const request = new Request('http://localhost:3000/api/client/search-history', {
        method: 'DELETE',
      });
      const response = await searchHistoryDELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
