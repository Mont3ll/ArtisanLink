/**
 * API Request Logging Middleware for ChapaWorks
 * 
 * Provides request/response logging for API routes with timing,
 * status codes, and optional body logging for debugging.
 */

import { NextResponse } from 'next/server'
import { createLogger, generateRequestId, getRequestMetadata } from './logger'
import { captureError, addBreadcrumb } from './monitoring'

const logger = createLogger('api/middleware')

export interface RequestLogOptions {
  /** Log request body (use with caution - may contain sensitive data) */
  logBody?: boolean
  /** Log response body */
  logResponse?: boolean
  /** Maximum body length to log */
  maxBodyLength?: number
  /** Skip logging for certain paths */
  skipPaths?: string[]
  /** Custom tags for monitoring */
  tags?: Record<string, string>
}

export interface RequestLogEntry {
  requestId: string
  method: string
  path: string
  query?: Record<string, string>
  duration: number
  status: number
  userAgent?: string
  ip?: string
  userId?: string
  error?: string
}

/**
 * Extract path from URL
 */
function getPath(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname
  } catch {
    return url
  }
}

/**
 * Extract query params from URL
 */
function getQueryParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url)
    const params: Record<string, string> = {}
    urlObj.searchParams.forEach((value, key) => {
      // Don't log sensitive params
      if (['token', 'key', 'secret', 'password'].includes(key.toLowerCase())) {
        params[key] = '[REDACTED]'
      } else {
        params[key] = value
      }
    })
    return params
  } catch {
    return {}
  }
}

/**
 * Sanitize body for logging (remove sensitive fields)
 */
function sanitizeBody(body: unknown, maxLength: number = 1000): string {
  if (!body) return ''
  
  try {
    const bodyObj = typeof body === 'string' ? JSON.parse(body) : body
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'creditCard', 'ssn']
    
    const sanitized = JSON.parse(JSON.stringify(bodyObj, (key, value) => {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        return '[REDACTED]'
      }
      return value
    }))
    
    const str = JSON.stringify(sanitized)
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str
  } catch {
    const str = String(body)
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str
  }
}

/**
 * Create a request logger that wraps API handlers
 */
export function withRequestLogging<T>(
  handler: (request: Request) => Promise<NextResponse<T>>,
  options: RequestLogOptions = {}
): (request: Request) => Promise<NextResponse<T>> {
  const {
    logBody = false,
    logResponse = false,
    maxBodyLength = 1000,
    skipPaths = ['/api/health'],
    tags = {},
  } = options

  return async (request: Request): Promise<NextResponse<T>> => {
    const startTime = Date.now()
    const requestId = generateRequestId()
    const path = getPath(request.url)

    // Skip logging for certain paths
    if (skipPaths.some(p => path.startsWith(p))) {
      return handler(request)
    }

    const metadata = getRequestMetadata(request)
    const queryParams = getQueryParams(request.url)

    // Log request start
    logger.info(`--> ${request.method} ${path}`, {
      requestId,
      ...metadata,
      query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      ...tags,
    })

    // Add breadcrumb for monitoring
    addBreadcrumb(`${request.method} ${path}`, 'http.request', {
      requestId,
      method: request.method,
      path,
    })

    // Log request body if enabled
    if (logBody && request.body) {
      try {
        const clonedRequest = request.clone()
        const body = await clonedRequest.text()
        if (body) {
          logger.debug('Request body', {
            requestId,
            body: sanitizeBody(body, maxBodyLength),
          })
        }
      } catch {
        // Body may not be readable
      }
    }

    let response: NextResponse<T>
    let status = 500
    let errorMessage: string | undefined

    try {
      response = await handler(request)
      status = response.status

      // Log response body if enabled
      if (logResponse && response.body) {
        try {
          const clonedResponse = response.clone()
          const body = await clonedResponse.text()
          if (body) {
            logger.debug('Response body', {
              requestId,
              body: sanitizeBody(body, maxBodyLength),
            })
          }
        } catch {
          // Body may not be readable
        }
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Capture error in monitoring
      captureError(error, {
        tags: { path, method: request.method, ...tags },
        extra: { requestId, query: queryParams },
      })

      throw error
    } finally {
      const duration = Date.now() - startTime
      
      // Log request completion
      const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
      const logFn = logLevel === 'error' ? logger.error.bind(logger) : logLevel === 'warn' ? logger.warn.bind(logger) : logger.info.bind(logger)
      
      logFn(`<-- ${request.method} ${path} ${status} ${duration}ms`, {
        requestId,
        status,
        duration,
        error: errorMessage,
      })

      // Add completion breadcrumb
      addBreadcrumb(`${request.method} ${path} completed`, 'http.response', {
        requestId,
        status,
        duration,
      }, status >= 400 ? 'error' : 'info')
    }

    // Add request ID to response headers for tracing
    response.headers.set('X-Request-Id', requestId)

    return response
  }
}

/**
 * Simple request timing middleware (lighter weight than full logging)
 */
export function withTiming<T>(
  handler: (request: Request) => Promise<NextResponse<T>>
): (request: Request) => Promise<NextResponse<T>> {
  return async (request: Request): Promise<NextResponse<T>> => {
    const startTime = Date.now()
    const response = await handler(request)
    const duration = Date.now() - startTime
    
    response.headers.set('X-Response-Time', `${duration}ms`)
    
    return response
  }
}

/**
 * Log aggregator for batch processing (useful for high-volume APIs)
 */
class LogAggregator {
  private logs: RequestLogEntry[] = []
  private flushInterval: ReturnType<typeof setInterval> | null = null
  private maxBatchSize: number = 100
  private flushIntervalMs: number = 5000

  constructor() {
    if (typeof setInterval !== 'undefined') {
      this.flushInterval = setInterval(() => this.flush(), this.flushIntervalMs)
    }
  }

  add(entry: RequestLogEntry): void {
    this.logs.push(entry)
    if (this.logs.length >= this.maxBatchSize) {
      this.flush()
    }
  }

  flush(): void {
    if (this.logs.length === 0) return

    const batch = this.logs
    this.logs = []

    // In production, send to logging service
    // For now, just output as JSON
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify({
        type: 'request_log_batch',
        count: batch.length,
        logs: batch,
      }))
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    this.flush()
  }
}

// Global log aggregator instance
export const logAggregator = new LogAggregator()

/**
 * Get request logging statistics
 */
export function getLoggingStats(): {
  pendingLogs: number
} {
  return {
    pendingLogs: 0, // Would track actual pending logs in production
  }
}
