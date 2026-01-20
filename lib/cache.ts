/**
 * Caching utilities for ArtisanLink API routes
 * 
 * Provides in-memory caching with TTL support and cache header utilities.
 * In production, consider replacing with Redis for distributed caching.
 */

import { NextResponse } from 'next/server'

/**
 * Cache duration presets (in seconds)
 */
export const CACHE_DURATIONS = {
  /** 1 minute - for frequently changing data */
  SHORT: 60,
  /** 5 minutes - for moderately dynamic data */
  MEDIUM: 300,
  /** 15 minutes - for semi-static data */
  LONG: 900,
  /** 1 hour - for relatively static data */
  HOUR: 3600,
  /** 24 hours - for static data */
  DAY: 86400,
} as const

/**
 * Stale-while-revalidate durations (in seconds)
 */
export const STALE_DURATIONS = {
  /** 1 minute stale */
  SHORT: 60,
  /** 5 minutes stale */
  MEDIUM: 300,
  /** 1 hour stale */
  LONG: 3600,
} as const

interface CacheEntry<T> {
  data: T
  expiresAt: number
  staleAt: number
}

/**
 * Simple in-memory cache for server-side caching
 * Note: This cache is per-instance and not shared across serverless functions
 * For production, use Redis or similar distributed cache
 */
class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private maxSize: number = 1000 // Maximum number of entries

  /**
   * Get a cached value
   */
  get<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    
    if (!entry) {
      return null
    }

    const now = Date.now()

    // Check if expired
    if (now > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    // Check if stale (can still be used while revalidating)
    const isStale = now > entry.staleAt

    return { data: entry.data, isStale }
  }

  /**
   * Set a cached value
   */
  set<T>(key: string, data: T, ttlSeconds: number, staleSeconds: number = 0): void {
    // Evict old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    const now = Date.now()
    this.cache.set(key, {
      data,
      staleAt: now + staleSeconds * 1000,
      expiresAt: now + ttlSeconds * 1000,
    })
  }

  /**
   * Delete a cached value
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cached values matching a pattern
   */
  invalidatePattern(pattern: string): number {
    let count = 0
    const regex = new RegExp(pattern)
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    
    return count
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    }
  }

  /**
   * Evict the oldest entry
   */
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value
    if (firstKey) {
      this.cache.delete(firstKey)
    }
  }
}

// Global cache instance
export const cache = new MemoryCache()

/**
 * Generate a cache key from request parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, string | number | boolean | null | undefined>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .filter(key => params[key] !== null && params[key] !== undefined)
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  return `${prefix}:${sortedParams || 'default'}`
}

/**
 * Add cache control headers to a response
 */
export function addCacheHeaders(
  response: NextResponse,
  options: {
    maxAge: number
    staleWhileRevalidate?: number
    isPublic?: boolean
    mustRevalidate?: boolean
  }
): NextResponse {
  const { maxAge, staleWhileRevalidate = 0, isPublic = false, mustRevalidate = false } = options

  const directives: string[] = []

  // Public or private cache
  directives.push(isPublic ? 'public' : 'private')

  // Max age
  directives.push(`max-age=${maxAge}`)

  // Stale-while-revalidate
  if (staleWhileRevalidate > 0) {
    directives.push(`stale-while-revalidate=${staleWhileRevalidate}`)
  }

  // Must revalidate
  if (mustRevalidate) {
    directives.push('must-revalidate')
  }

  response.headers.set('Cache-Control', directives.join(', '))

  return response
}

/**
 * Create a cached JSON response
 */
export function cachedJsonResponse<T>(
  data: T,
  options: {
    maxAge?: number
    staleWhileRevalidate?: number
    isPublic?: boolean
    status?: number
  } = {}
): NextResponse {
  const {
    maxAge = CACHE_DURATIONS.SHORT,
    staleWhileRevalidate = STALE_DURATIONS.SHORT,
    isPublic = false,
    status = 200,
  } = options

  const response = NextResponse.json(data, { status })

  return addCacheHeaders(response, {
    maxAge,
    staleWhileRevalidate,
    isPublic,
  })
}

/**
 * Create a response with no caching
 */
export function noCacheResponse<T>(data: T, status = 200): NextResponse {
  const response = NextResponse.json(data, { status })
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

/**
 * Wrapper for caching API route handlers
 * 
 * @example
 * ```ts
 * export const GET = withCache(
 *   async (request: Request) => {
 *     // Your handler logic
 *     return { data: 'result' }
 *   },
 *   {
 *     keyPrefix: 'api/artisans',
 *     ttl: CACHE_DURATIONS.MEDIUM,
 *     stale: STALE_DURATIONS.SHORT,
 *   }
 * )
 * ```
 */
export function withCache<T>(
  handler: (request: Request) => Promise<T>,
  options: {
    keyPrefix: string
    ttl?: number
    stale?: number
    isPublic?: boolean
    /** Function to extract cache key params from request */
    getKeyParams?: (request: Request) => Record<string, string | number | boolean | null | undefined>
  }
): (request: Request) => Promise<NextResponse> {
  const {
    keyPrefix,
    ttl = CACHE_DURATIONS.MEDIUM,
    stale = STALE_DURATIONS.SHORT,
    isPublic = false,
    getKeyParams = (req) => {
      const url = new URL(req.url)
      return Object.fromEntries(url.searchParams.entries())
    },
  } = options

  return async (request: Request): Promise<NextResponse> => {
    const params = getKeyParams(request)
    const cacheKey = generateCacheKey(keyPrefix, params)

    // Check cache
    const cached = cache.get<T>(cacheKey)
    if (cached && !cached.isStale) {
      return cachedJsonResponse(cached.data, {
        maxAge: ttl,
        staleWhileRevalidate: stale,
        isPublic,
      })
    }

    // Execute handler
    const data = await handler(request)

    // Store in cache
    cache.set(cacheKey, data, ttl + stale, stale)

    // Return response with cache headers
    return cachedJsonResponse(data, {
      maxAge: ttl,
      staleWhileRevalidate: stale,
      isPublic,
    })
  }
}

/**
 * Invalidate cache entries for a specific resource
 */
export function invalidateCache(pattern: string): number {
  return cache.invalidatePattern(pattern)
}

/**
 * Cache key patterns for common resources
 */
export const CACHE_KEYS = {
  ARTISANS_SEARCH: 'search/artisans',
  ARTISAN_PROFILE: (id: string) => `artisan/${id}`,
  ARTISAN_REVIEWS: (id: string) => `artisan/${id}/reviews`,
  USER_STATS: (id: string) => `user/${id}/stats`,
  ADMIN_STATS: 'admin/stats',
  LOCATIONS: 'admin/locations',
  HEALTH: 'health',
} as const
