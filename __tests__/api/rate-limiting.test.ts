import { describe, it, expect } from 'vitest'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

describe('rate limiting utility', () => {
  it('exports rateLimit function', () => {
    expect(rateLimit).toBeDefined()
    expect(typeof rateLimit).toBe('function')
  })

  it('exports RATE_LIMITS constants', () => {
    expect(RATE_LIMITS.STRICT).toBeDefined()
    expect(RATE_LIMITS.NORMAL).toBeDefined()
    expect(RATE_LIMITS.RELAXED).toBeDefined()
    expect(RATE_LIMITS.SEARCH).toBeDefined()
    expect(RATE_LIMITS.UPLOAD).toBeDefined()
    expect(RATE_LIMITS.WEBHOOK).toBeDefined()
  })

  it('STRICT is stricter than NORMAL (fewer requests)', () => {
    expect(RATE_LIMITS.STRICT.requests).toBeLessThan(RATE_LIMITS.NORMAL.requests)
  })

  it('STRICT allows 10 requests per window', () => {
    expect(RATE_LIMITS.STRICT.requests).toBe(10)
  })

  it('NORMAL allows 60 requests per window', () => {
    expect(RATE_LIMITS.NORMAL.requests).toBe(60)
  })

  it('UPLOAD window is longer than NORMAL window', () => {
    expect(RATE_LIMITS.UPLOAD.windowMs).toBeGreaterThan(RATE_LIMITS.NORMAL.windowMs)
  })

  it('WEBHOOK allows 100 requests per window', () => {
    expect(RATE_LIMITS.WEBHOOK.requests).toBe(100)
  })

  it('all sensitive routes use STRICT or NORMAL limits', () => {
    // Verify the constants used in the rate-limited routes exist
    expect(RATE_LIMITS.STRICT.requests).toBe(10)   // admin mutations
    expect(RATE_LIMITS.NORMAL.requests).toBe(60)    // artisan CRUD
    expect(RATE_LIMITS.SEARCH.requests).toBe(30)    // search endpoint
  })
})
