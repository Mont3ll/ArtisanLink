/**
 * Input sanitization utilities for ArtisanLink
 * 
 * Provides functions to sanitize and validate user inputs to prevent
 * XSS, SQL injection, and other security vulnerabilities.
 */

/**
 * Sanitize a string by removing/escaping potentially dangerous characters
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return ''
  
  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Remove potential script injection patterns
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    // Trim whitespace
    .trim()
}

/**
 * Sanitize string but preserve some HTML (for rich text fields)
 * Only allows basic formatting tags
 */
export function sanitizeRichText(input: string | null | undefined): string {
  if (!input) return ''
  
  // List of allowed tags
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'a']
  
  let sanitized = input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and their contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: and data: URLs
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
  
  // Remove tags that aren't in the allowed list
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  sanitized = sanitized.replace(tagPattern, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // For anchor tags, only allow href attribute
      if (tagName.toLowerCase() === 'a') {
        const hrefMatch = match.match(/href\s*=\s*["']([^"']*)["']/i)
        if (hrefMatch) {
          const href = hrefMatch[1]
          // Only allow http(s) URLs
          if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/')) {
            return `<a href="${href}">`
          }
        }
        return '<a>'
      }
      return match
    }
    return ''
  })
  
  return sanitized.trim()
}

/**
 * Sanitize an email address
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return ''
  
  // Basic email sanitization
  return input
    .toLowerCase()
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 254) // Max email length per RFC 5321
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Sanitize a phone number (Kenya format)
 */
export function sanitizePhone(input: string | null | undefined): string {
  if (!input) return ''
  
  // Remove all non-digit characters except +
  let phone = input.replace(/[^\d+]/g, '')
  
  // Ensure it starts with + for international format or convert local format
  if (phone.startsWith('0')) {
    phone = '+254' + phone.slice(1)
  } else if (phone.startsWith('254')) {
    phone = '+' + phone
  } else if (!phone.startsWith('+')) {
    phone = '+254' + phone
  }
  
  return phone.slice(0, 15) // Max international phone length
}

/**
 * Validate Kenyan phone number format
 */
export function isValidKenyanPhone(phone: string): boolean {
  // Valid formats: +254XXXXXXXXX or 07XXXXXXXX or 01XXXXXXXX
  const phoneRegex = /^(\+254|0)(7|1)\d{8}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

/**
 * Sanitize a URL
 */
export function sanitizeUrl(input: string | null | undefined): string {
  if (!input) return ''
  
  const trimmed = input.trim()
  
  // Only allow http(s) URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.slice(0, 2048) // Max reasonable URL length
  }
  
  // If no protocol, assume https
  if (trimmed.match(/^[a-z0-9][\w.-]*\.[a-z]{2,}/i)) {
    return 'https://' + trimmed.slice(0, 2040)
  }
  
  return ''
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Sanitize a number input
 */
export function sanitizeNumber(input: string | number | null | undefined, options?: {
  min?: number
  max?: number
  allowDecimals?: boolean
  defaultValue?: number
}): number {
  const { min, max, allowDecimals = true, defaultValue = 0 } = options || {}
  
  if (input === null || input === undefined) return defaultValue
  
  let num = typeof input === 'number' ? input : parseFloat(String(input))
  
  if (isNaN(num)) return defaultValue
  
  if (!allowDecimals) {
    num = Math.floor(num)
  }
  
  if (min !== undefined) {
    num = Math.max(min, num)
  }
  
  if (max !== undefined) {
    num = Math.min(max, num)
  }
  
  return num
}

/**
 * Sanitize an integer input
 */
export function sanitizeInteger(input: string | number | null | undefined, options?: {
  min?: number
  max?: number
  defaultValue?: number
}): number {
  return sanitizeNumber(input, { ...options, allowDecimals: false })
}

/**
 * Sanitize a boolean input
 */
export function sanitizeBoolean(input: string | boolean | null | undefined): boolean {
  if (typeof input === 'boolean') return input
  if (!input) return false
  
  const truthy = ['true', '1', 'yes', 'on']
  return truthy.includes(String(input).toLowerCase())
}

/**
 * Sanitize a search query
 */
export function sanitizeSearchQuery(input: string | null | undefined, maxLength = 200): string {
  if (!input) return ''
  
  return input
    // Remove special characters that could be used for injection
    .replace(/[<>{}[\]\\\/^$|?*+()]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

/**
 * Sanitize a slug (URL-safe string)
 */
export function sanitizeSlug(input: string | null | undefined): string {
  if (!input) return ''
  
  return input
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    .slice(0, 100)
}

/**
 * Sanitize a filename
 */
export function sanitizeFilename(input: string | null | undefined): string {
  if (!input) return ''
  
  return input
    // Remove path traversal characters
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // Remove special characters
    .replace(/[<>:"|?*]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, '_')
    .trim()
    .slice(0, 255)
}

/**
 * Sanitize JSON input (parse and validate)
 */
export function sanitizeJson<T>(input: string | null | undefined, validator?: (data: unknown) => T): T | null {
  if (!input) return null
  
  try {
    const parsed = JSON.parse(input)
    return validator ? validator(parsed) : parsed as T
  } catch {
    return null
  }
}

/**
 * Sanitize an array of strings
 */
export function sanitizeStringArray(input: string[] | null | undefined, maxItems = 100): string[] {
  if (!input || !Array.isArray(input)) return []
  
  return input
    .slice(0, maxItems)
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0)
}

/**
 * Sanitize coordinate (latitude or longitude)
 */
export function sanitizeCoordinate(input: string | number | null | undefined, type: 'lat' | 'lng'): number | null {
  if (input === null || input === undefined) return null
  
  const num = typeof input === 'number' ? input : parseFloat(String(input))
  
  if (isNaN(num)) return null
  
  // Validate ranges
  if (type === 'lat') {
    // Latitude: -90 to 90
    if (num < -90 || num > 90) return null
  } else {
    // Longitude: -180 to 180
    if (num < -180 || num > 180) return null
  }
  
  // Round to 6 decimal places (about 10cm precision)
  return Math.round(num * 1000000) / 1000000
}

/**
 * Sanitize a date string
 */
export function sanitizeDate(input: string | Date | null | undefined): Date | null {
  if (!input) return null
  
  const date = input instanceof Date ? input : new Date(input)
  
  // Check if valid date
  if (isNaN(date.getTime())) return null
  
  return date
}

/**
 * Create a request body sanitizer
 * 
 * @example
 * ```ts
 * const sanitize = createBodySanitizer({
 *   name: 'string',
 *   email: 'email',
 *   age: 'integer',
 *   bio: 'richtext',
 * })
 * 
 * const data = await request.json()
 * const sanitized = sanitize(data)
 * ```
 */
export function createBodySanitizer<T extends Record<string, unknown>>(schema: Record<keyof T, 
  'string' | 'email' | 'phone' | 'url' | 'number' | 'integer' | 'boolean' | 'richtext' | 'search' | 'slug'
>): (input: Record<string, unknown>) => T {
  return (input: Record<string, unknown>): T => {
    const result: Record<string, unknown> = {}
    
    for (const [key, type] of Object.entries(schema)) {
      const value = input[key]
      
      switch (type) {
        case 'string':
          result[key] = sanitizeString(value as string)
          break
        case 'email':
          result[key] = sanitizeEmail(value as string)
          break
        case 'phone':
          result[key] = sanitizePhone(value as string)
          break
        case 'url':
          result[key] = sanitizeUrl(value as string)
          break
        case 'number':
          result[key] = sanitizeNumber(value as number)
          break
        case 'integer':
          result[key] = sanitizeInteger(value as number)
          break
        case 'boolean':
          result[key] = sanitizeBoolean(value as boolean)
          break
        case 'richtext':
          result[key] = sanitizeRichText(value as string)
          break
        case 'search':
          result[key] = sanitizeSearchQuery(value as string)
          break
        case 'slug':
          result[key] = sanitizeSlug(value as string)
          break
        default:
          result[key] = sanitizeString(value as string)
      }
    }
    
    return result as T
  }
}
