/**
 * Structured Logger for ChapaWorks API Routes
 * 
 * Provides consistent, structured logging across all API routes.
 * In production, this can be extended to send logs to external services
 * like Sentry, LogRocket, or custom logging infrastructure.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  /** The API route or component name */
  source?: string
  /** User ID if authenticated */
  userId?: string
  /** Request ID for tracing */
  requestId?: string
  /** Additional metadata */
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Minimum log level (can be configured via environment variable)
const MIN_LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

/**
 * Format a log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, context, error } = entry
  
  // In development, use a more readable format
  if (process.env.NODE_ENV === 'development') {
    let output = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    if (context?.source) {
      output = `[${context.source}] ${output}`
    }
    if (error) {
      output += `\n  Error: ${error.name}: ${error.message}`
      if (error.stack) {
        output += `\n  Stack: ${error.stack}`
      }
    }
    if (context && Object.keys(context).length > 1) {
      const { source, ...rest } = context
      if (Object.keys(rest).length > 0) {
        output += `\n  Context: ${JSON.stringify(rest)}`
      }
    }
    return output
  }
  
  // In production, use JSON format for structured logging
  return JSON.stringify(entry)
}

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL]
}

/**
 * Create a log entry and output it
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  if (!shouldLog(level)) return
  
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  }
  
  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }
  
  const formatted = formatLogEntry(entry)
  
  switch (level) {
    case 'debug':
    case 'info':
      console.log(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'error':
      console.error(formatted)
      break
  }
}

/**
 * Logger instance with context
 */
export class Logger {
  private context: LogContext
  
  constructor(source: string, additionalContext?: Omit<LogContext, 'source'>) {
    this.context = { source, ...additionalContext }
  }
  
  /**
   * Add additional context to the logger
   */
  withContext(context: Partial<LogContext>): Logger {
    const newLogger = new Logger(this.context.source || 'unknown')
    newLogger.context = { ...this.context, ...context }
    return newLogger
  }
  
  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: Omit<LogContext, 'source'>): void {
    log('debug', message, { ...this.context, ...context })
  }
  
  /**
   * Log an info message
   */
  info(message: string, context?: Omit<LogContext, 'source'>): void {
    log('info', message, { ...this.context, ...context })
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, context?: Omit<LogContext, 'source'>): void {
    log('warn', message, { ...this.context, ...context })
  }
  
  /**
   * Log an error message with optional Error object
   */
  error(message: string, error?: Error | unknown, context?: Omit<LogContext, 'source'>): void {
    const err = error instanceof Error ? error : undefined
    log('error', message, { ...this.context, ...context }, err)
  }
}

/**
 * Create a logger for an API route
 * 
 * @example
 * ```ts
 * import { createLogger } from '@/lib/logger'
 * 
 * const logger = createLogger('api/admin/stats')
 * 
 * export async function GET(request: Request) {
 *   try {
 *     logger.info('Fetching admin stats')
 *     // ... business logic
 *     logger.info('Successfully fetched admin stats', { count: results.length })
 *     return NextResponse.json(results)
 *   } catch (error) {
 *     logger.error('Failed to fetch admin stats', error)
 *     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
 *   }
 * }
 * ```
 */
export function createLogger(source: string, context?: Omit<LogContext, 'source'>): Logger {
  return new Logger(source, context)
}

/**
 * Convenience function for quick error logging without creating a logger instance
 * 
 * @deprecated Prefer using createLogger() for consistent context
 */
export function logError(source: string, message: string, error?: Error | unknown): void {
  const logger = createLogger(source)
  logger.error(message, error)
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Extract request metadata for logging
 */
export function getRequestMetadata(request: Request): Partial<LogContext> {
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        undefined,
  }
}

// Default export for convenience
export default createLogger
