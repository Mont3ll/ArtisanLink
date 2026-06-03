/**
 * Error Tracking and Monitoring for ChapaWorks
 * 
 * Integrates with Sentry for error tracking and provides utilities
 * for capturing errors, performance metrics, and user context.
 * 
 * Setup:
 * 1. Install Sentry: npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Configure SENTRY_DSN in environment variables
 */

// Sentry types for when the package is installed
interface SentryLike {
  init: (options: Record<string, unknown>) => void
  captureException: (error: Error, context?: Record<string, unknown>) => string
  captureMessage: (message: string, context?: Record<string, unknown>) => string
  setUser: (user: Record<string, string | undefined> | null) => void
  addBreadcrumb: (breadcrumb: Record<string, unknown>) => void
  startInactiveSpan: (options: { name: string; op: string }) => { end: () => void; setAttribute: (key: string, value: string) => void } | undefined
}

// Check if Sentry is available (installed and configured)
let Sentry: SentryLike | null = null

// Only attempt to load Sentry in environments where it is installed.
// Using a conditional expression prevents webpack from including it in the bundle.
if (process.env.SENTRY_DSN) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Sentry = require('@sentry/nextjs') as SentryLike
  } catch {
    // Sentry not installed - error tracking disabled
  }
}

interface SentryEvent {
  request?: {
    headers?: Record<string, string>
  }
  breadcrumbs?: Array<{
    data?: Record<string, unknown>
  }>
}

/**
 * Initialize Sentry for the application
 * Call this in instrumentation.ts or app initialization
 */
export function initSentry(): void {
  if (!Sentry) {
    console.warn('[Monitoring] Sentry not installed. Install with: npm install @sentry/nextjs')
    return
  }

  const dsn = process.env.SENTRY_DSN

  if (!dsn) {
    console.warn('[Monitoring] SENTRY_DSN not configured. Error tracking disabled.')
    return
  }

  Sentry.init({
    dsn,
    
    // Environment
    environment: process.env.NODE_ENV || 'development',
    
    // Sample rate for transactions (performance monitoring)
    // In production, you may want to lower this to reduce costs
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Sample rate for error events
    // Capture all errors in production
    sampleRate: 1.0,
    
    // Enable debug mode in development
    debug: process.env.NODE_ENV === 'development',
    
    // Filter out sensitive data
    beforeSend(event: SentryEvent) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
        delete event.request.headers['x-api-key']
      }
      
      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.data) {
            // Remove any potential secrets
            const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization']
            for (const key of sensitiveKeys) {
              if (key in breadcrumb.data) {
                breadcrumb.data[key] = '[REDACTED]'
              }
            }
          }
          return breadcrumb
        })
      }
      
      return event
    },
    
    // Ignore certain errors
    ignoreErrors: [
      // Network errors that are expected
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      // User aborted requests
      'AbortError',
      // Browser extensions
      'chrome-extension://',
      'moz-extension://',
    ],
  })

  console.log('[Monitoring] Sentry initialized successfully')
}

/**
 * Capture an error and send to Sentry
 */
export function captureError(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, unknown>
    user?: {
      id?: string
      email?: string
      role?: string
    }
    level?: 'fatal' | 'error' | 'warning' | 'info'
  }
): string | undefined {
  const err = error instanceof Error ? error : new Error(String(error))
  
  // Log to console regardless of Sentry availability
  console.error('[Error]', err.message, context?.extra || {})
  
  if (!Sentry) {
    return undefined
  }

  // Set user context if provided
  if (context?.user) {
    Sentry.setUser({
      id: context.user.id,
      email: context.user.email,
      role: context.user.role,
    })
  }

  // Capture the error
  const eventId = Sentry.captureException(err, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level || 'error',
  })

  return eventId
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, unknown>
  }
): string | undefined {
  // Log to console
  const logFn = level === 'error' || level === 'fatal' 
    ? console.error 
    : level === 'warning' 
      ? console.warn 
      : console.log
  logFn(`[${level.toUpperCase()}]`, message, context?.extra || {})

  if (!Sentry) {
    return undefined
  }

  return Sentry.captureMessage(message, {
    level,
    tags: context?.tags,
    extra: context?.extra,
  })
}

/**
 * Set user context for all subsequent events
 */
export function setUser(user: {
  id: string
  email?: string
  role?: string
  name?: string
} | null): void {
  if (!Sentry) return

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      role: user.role,
    })
  } else {
    Sentry.setUser(null)
  }
}

/**
 * Add a breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): void {
  if (!Sentry) return

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  })
}

/**
 * Start a performance transaction
 */
export function startTransaction(
  name: string,
  op: string
): { finish: () => void; setTag: (key: string, value: string) => void } {
  if (!Sentry) {
    return {
      finish: () => {},
      setTag: () => {},
    }
  }

  const transaction = Sentry.startInactiveSpan({
    name,
    op,
  })

  return {
    finish: () => transaction?.end(),
    setTag: (key: string, value: string) => transaction?.setAttribute(key, value),
  }
}

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context: {
    name: string
    tags?: Record<string, string>
  }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      captureError(error, {
        tags: { function: context.name, ...context.tags },
        extra: { args: JSON.stringify(args).slice(0, 1000) },
      })
      throw error
    }
  }) as T
}

/**
 * Create an API route handler with automatic error tracking
 */
export function withMonitoring<T>(
  handler: (request: Request) => Promise<T>,
  routeName: string
): (request: Request) => Promise<T> {
  return async (request: Request): Promise<T> => {
    const transaction = startTransaction(routeName, 'http.server')
    
    // Add request context
    addBreadcrumb(`${request.method} ${routeName}`, 'http', {
      method: request.method,
      url: request.url,
    })

    try {
      const result = await handler(request)
      transaction.setTag('http.status_code', '200')
      return result
    } catch (error) {
      transaction.setTag('http.status_code', '500')
      captureError(error, {
        tags: { route: routeName, method: request.method },
        extra: { url: request.url },
      })
      throw error
    } finally {
      transaction.finish()
    }
  }
}

/**
 * Health check for monitoring systems
 */
export function getMonitoringStatus(): {
  sentryEnabled: boolean
  sentryDsn: boolean
  environment: string
} {
  return {
    sentryEnabled: Sentry !== null,
    sentryDsn: !!process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
  }
}
