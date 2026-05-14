/**
 * Rate limiting utility for ChapaWorks API routes
 * 
 * Provides in-memory rate limiting with configurable windows and limits.
 * In production, consider using Redis for distributed rate limiting.
 */

import { NextResponse } from 'next/server'

/**
 * Rate limit configuration presets
 */
export const RATE_LIMITS = {
  /** Very strict - 10 requests per minute (login, sensitive operations) */
  STRICT: { requests: 10, windowMs: 60 * 1000 },
  /** Normal - 60 requests per minute (authenticated API calls) */
  NORMAL: { requests: 60, windowMs: 60 * 1000 },
  /** Relaxed - 120 requests per minute (public endpoints) */
  RELAXED: { requests: 120, windowMs: 60 * 1000 },
  /** Search - 30 requests per minute (search operations) */
  SEARCH: { requests: 30, windowMs: 60 * 1000 },
  /** Upload - 10 requests per 10 minutes (file uploads) */
  UPLOAD: { requests: 10, windowMs: 10 * 60 * 1000 },
  /** Webhook - 100 requests per minute (external webhooks) */
  WEBHOOK: { requests: 100, windowMs: 60 * 1000 },
} as const

interface RateLimitEntry {
  count: number
  resetAt: number
}

/**
 * In-memory rate limit store
 * Note: This is per-instance and not shared across serverless functions
 * For production, use Redis or similar distributed store
 */
class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    // Clean up expired entries every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000)
    }
  }

  /**
   * Check if a request should be rate limited
   * @returns true if request should be allowed, false if rate limited
   */
  check(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = this.store.get(key)

    // If no entry or window has expired, create new entry
    if (!entry || now > entry.resetAt) {
      const resetAt = now + windowMs
      this.store.set(key, { count: 1, resetAt })
      return { allowed: true, remaining: limit - 1, resetAt }
    }

    // Check if limit exceeded
    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }

    // Increment count
    entry.count++
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Get store statistics
   */
  stats(): { size: number } {
    return { size: this.store.size }
  }

  /**
   * Reset a specific key (useful for testing)
   */
  reset(key: string): void {
    this.store.delete(key)
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Cleanup interval when shutting down
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Global rate limit store instance
export const rateLimitStore = new RateLimitStore()

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header if available (for proxied requests),
 * falls back to a placeholder for local development
 */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Get the first IP in the chain (original client)
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback for development
  return 'localhost'
}

/**
 * Create rate limit response headers
 */
function createRateLimitHeaders(remaining: number, resetAt: number, limit: number): Headers {
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', limit.toString())
  headers.set('X-RateLimit-Remaining', Math.max(0, remaining).toString())
  headers.set('X-RateLimit-Reset', Math.ceil(resetAt / 1000).toString())
  return headers
}

/**
 * Rate limit error response
 */
export function rateLimitExceeded(resetAt: number, limit: number): NextResponse {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(resetAt / 1000).toString(),
      },
    }
  )
}

/**
 * Rate limit middleware for API routes
 * 
 * @example
 * ```ts
 * export async function GET(request: Request) {
 *   const rateLimitResult = rateLimit(request, 'api/search', RATE_LIMITS.SEARCH)
 *   if (!rateLimitResult.allowed) {
 *     return rateLimitResult.response
 *   }
 *   // ... rest of handler
 * }
 * ```
 */
export function rateLimit(
  request: Request,
  endpoint: string,
  config: { requests: number; windowMs: number } = RATE_LIMITS.NORMAL
): {
  allowed: boolean
  remaining: number
  resetAt: number
  response?: NextResponse
  headers: Headers
} {
  const clientId = getClientIdentifier(request)
  const key = `${endpoint}:${clientId}`
  
  const { allowed, remaining, resetAt } = rateLimitStore.check(
    key,
    config.requests,
    config.windowMs
  )

  const headers = createRateLimitHeaders(remaining, resetAt, config.requests)

  if (!allowed) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      response: rateLimitExceeded(resetAt, config.requests),
      headers,
    }
  }

  return {
    allowed: true,
    remaining,
    resetAt,
    headers,
  }
}

/**
 * Higher-order function to wrap an API route handler with rate limiting
 * 
 * @example
 * ```ts
 * export const GET = withRateLimit(
 *   async (request: Request) => {
 *     // Your handler logic
 *     return NextResponse.json({ data: 'result' })
 *   },
 *   'api/search/artisans',
 *   RATE_LIMITS.SEARCH
 * )
 * ```
 */
export function withRateLimit<T extends Request>(
  handler: (request: T) => Promise<NextResponse>,
  endpoint: string,
  config: { requests: number; windowMs: number } = RATE_LIMITS.NORMAL
): (request: T) => Promise<NextResponse> {
  return async (request: T): Promise<NextResponse> => {
    const result = rateLimit(request, endpoint, config)

    if (!result.allowed) {
      return result.response!
    }

    // Execute handler and add rate limit headers to response
    const response = await handler(request)
    
    // Add rate limit headers
    result.headers.forEach((value, key) => {
      response.headers.set(key, value)
    })

    return response
  }
}

/**
 * Rate limit by user ID (for authenticated endpoints)
 * More accurate than IP-based limiting for logged-in users
 */
export function rateLimitByUser(
  userId: string,
  endpoint: string,
  config: { requests: number; windowMs: number } = RATE_LIMITS.NORMAL
): {
  allowed: boolean
  remaining: number
  resetAt: number
  response?: NextResponse
  headers: Headers
} {
  const key = `${endpoint}:user:${userId}`
  
  const { allowed, remaining, resetAt } = rateLimitStore.check(
    key,
    config.requests,
    config.windowMs
  )

  const headers = createRateLimitHeaders(remaining, resetAt, config.requests)

  if (!allowed) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      response: rateLimitExceeded(resetAt, config.requests),
      headers,
    }
  }

  return {
    allowed: true,
    remaining,
    resetAt,
    headers,
  }
}
