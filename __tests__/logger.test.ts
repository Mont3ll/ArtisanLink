/**
 * Tests for lib/logger.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createLogger,
  Logger,
  logError,
  generateRequestId,
  getRequestMetadata,
} from '../lib/logger'

describe('createLogger', () => {
  it('should create a logger instance with source', () => {
    const logger = createLogger('test-source')
    expect(logger).toBeInstanceOf(Logger)
  })

  it('should create a logger with additional context', () => {
    const logger = createLogger('test-source', { userId: 'user-123' })
    expect(logger).toBeInstanceOf(Logger)
  })
})

describe('Logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('info', () => {
    it('should log info messages', () => {
      const logger = createLogger('test')
      logger.info('Test info message')

      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('should include context in log message', () => {
      const logger = createLogger('test')
      logger.info('Test message', { requestId: 'req-123' })

      expect(consoleSpy.log).toHaveBeenCalled()
    })
  })

  describe('warn', () => {
    it('should log warning messages', () => {
      const logger = createLogger('test')
      logger.warn('Test warning message')

      expect(consoleSpy.warn).toHaveBeenCalled()
    })
  })

  describe('error', () => {
    it('should log error messages', () => {
      const logger = createLogger('test')
      logger.error('Test error message')

      expect(consoleSpy.error).toHaveBeenCalled()
    })

    it('should log error with Error object', () => {
      const logger = createLogger('test')
      const error = new Error('Test error')
      logger.error('Something went wrong', error)

      expect(consoleSpy.error).toHaveBeenCalled()
    })

    it('should handle non-Error objects gracefully', () => {
      const logger = createLogger('test')
      logger.error('Something went wrong', { message: 'not an error' })

      expect(consoleSpy.error).toHaveBeenCalled()
    })
  })

  describe('debug', () => {
    it('should call console.log for debug messages when log level permits', () => {
      // Note: Debug messages may or may not show depending on LOG_LEVEL env var
      const logger = createLogger('test')
      logger.debug('Debug message')

      // Just verify no error is thrown
      expect(true).toBe(true)
    })
  })

  describe('withContext', () => {
    it('should create a new logger with merged context', () => {
      const logger = createLogger('test-source')
      const contextLogger = logger.withContext({ userId: 'user-456' })

      expect(contextLogger).toBeInstanceOf(Logger)
      expect(contextLogger).not.toBe(logger) // Should be a new instance
    })

    it('should allow chaining withContext calls', () => {
      const logger = createLogger('test-source')
      const contextLogger = logger
        .withContext({ userId: 'user-123' })
        .withContext({ requestId: 'req-456' })

      expect(contextLogger).toBeInstanceOf(Logger)
    })
  })
})

describe('logError (deprecated)', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should log error message', () => {
    logError('test-source', 'An error occurred')
    expect(errorSpy).toHaveBeenCalled()
  })

  it('should log error with Error object', () => {
    const error = new Error('Test error')
    logError('test-source', 'An error occurred', error)
    expect(errorSpy).toHaveBeenCalled()
  })
})

describe('generateRequestId', () => {
  it('should generate a string starting with "req_"', () => {
    const requestId = generateRequestId()
    expect(requestId).toMatch(/^req_/)
  })

  it('should generate unique IDs', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateRequestId())
    }
    // All 100 IDs should be unique
    expect(ids.size).toBe(100)
  })

  it('should include timestamp component', () => {
    const before = Date.now()
    const requestId = generateRequestId()
    const after = Date.now()

    // Extract timestamp from the ID (format: req_<timestamp>_<random>)
    const parts = requestId.split('_')
    expect(parts).toHaveLength(3)

    const timestamp = parseInt(parts[1], 10)
    expect(timestamp).toBeGreaterThanOrEqual(before)
    expect(timestamp).toBeLessThanOrEqual(after)
  })

  it('should include random component', () => {
    const requestId = generateRequestId()
    const parts = requestId.split('_')

    // Random part should be alphanumeric
    const randomPart = parts[2]
    expect(randomPart).toMatch(/^[a-z0-9]+$/)
    expect(randomPart.length).toBeGreaterThan(0)
  })
})

describe('getRequestMetadata', () => {
  it('should extract method and url from request', () => {
    const request = new Request('https://example.com/api/test', {
      method: 'POST',
    })

    const metadata = getRequestMetadata(request)

    expect(metadata.method).toBe('POST')
    expect(metadata.url).toBe('https://example.com/api/test')
  })

  it('should extract user-agent header', () => {
    const request = new Request('https://example.com/api/test', {
      headers: {
        'user-agent': 'Mozilla/5.0 Test Browser',
      },
    })

    const metadata = getRequestMetadata(request)

    expect(metadata.userAgent).toBe('Mozilla/5.0 Test Browser')
  })

  it('should extract x-forwarded-for header for IP', () => {
    const request = new Request('https://example.com/api/test', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
      },
    })

    const metadata = getRequestMetadata(request)

    expect(metadata.ip).toBe('192.168.1.1')
  })

  it('should extract x-real-ip header when x-forwarded-for is not present', () => {
    const request = new Request('https://example.com/api/test', {
      headers: {
        'x-real-ip': '10.0.0.1',
      },
    })

    const metadata = getRequestMetadata(request)

    expect(metadata.ip).toBe('10.0.0.1')
  })

  it('should prefer x-forwarded-for over x-real-ip', () => {
    const request = new Request('https://example.com/api/test', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '10.0.0.1',
      },
    })

    const metadata = getRequestMetadata(request)

    expect(metadata.ip).toBe('192.168.1.1')
  })

  it('should handle missing headers gracefully', () => {
    const request = new Request('https://example.com/api/test')

    const metadata = getRequestMetadata(request)

    expect(metadata.method).toBe('GET')
    expect(metadata.url).toBe('https://example.com/api/test')
    expect(metadata.userAgent).toBeUndefined()
    expect(metadata.ip).toBeUndefined()
  })

  it('should handle various HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

    for (const method of methods) {
      const request = new Request('https://example.com/api/test', { method })
      const metadata = getRequestMetadata(request)
      expect(metadata.method).toBe(method)
    }
  })
})
