/**
 * Tests for lib/env.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getRequiredEnv,
  getOptionalEnv,
  getBooleanEnv,
  getNumericEnv,
} from '../lib/env'

describe('getRequiredEnv', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return value when environment variable exists', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
    expect(getRequiredEnv('DATABASE_URL')).toBe('postgresql://localhost:5432/test')
  })

  it('should throw error when environment variable is missing', () => {
    delete process.env.DATABASE_URL
    expect(() => getRequiredEnv('DATABASE_URL')).toThrow(
      'Missing required environment variable: DATABASE_URL'
    )
  })

  it('should throw error when environment variable is empty string', () => {
    process.env.DATABASE_URL = ''
    expect(() => getRequiredEnv('DATABASE_URL')).toThrow(
      'Missing required environment variable: DATABASE_URL'
    )
  })
})

describe('getOptionalEnv', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return value when environment variable exists', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://artisanlink.co.ke'
    expect(getOptionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')).toBe(
      'https://artisanlink.co.ke'
    )
  })

  it('should return default value when environment variable is missing', () => {
    delete process.env.NEXT_PUBLIC_APP_URL
    expect(getOptionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')).toBe(
      'http://localhost:3000'
    )
  })

  it('should return empty string when env var is empty (nullish coalescing)', () => {
    process.env.NEXT_PUBLIC_APP_URL = ''
    // getOptionalEnv uses ?? so empty string is returned (not null/undefined)
    expect(getOptionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')).toBe('')
  })
})

describe('getBooleanEnv', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return true for "true" string', () => {
    process.env.ENABLE_MPESA_PAYMENTS = 'true'
    expect(getBooleanEnv('ENABLE_MPESA_PAYMENTS')).toBe(true)
  })

  it('should return true for "TRUE" string (case insensitive)', () => {
    process.env.ENABLE_MPESA_PAYMENTS = 'TRUE'
    expect(getBooleanEnv('ENABLE_MPESA_PAYMENTS')).toBe(true)
  })

  it('should return true for "1" string', () => {
    process.env.ENABLE_MPESA_PAYMENTS = '1'
    expect(getBooleanEnv('ENABLE_MPESA_PAYMENTS')).toBe(true)
  })

  it('should return false for "false" string', () => {
    process.env.ENABLE_MPESA_PAYMENTS = 'false'
    expect(getBooleanEnv('ENABLE_MPESA_PAYMENTS')).toBe(false)
  })

  it('should return false for "0" string', () => {
    process.env.ENABLE_MPESA_PAYMENTS = '0'
    expect(getBooleanEnv('ENABLE_MPESA_PAYMENTS')).toBe(false)
  })

  it('should return default value when env var is missing', () => {
    delete process.env.ENABLE_MPESA_PAYMENTS
    expect(getBooleanEnv('ENABLE_MPESA_PAYMENTS')).toBe(false)
    expect(getBooleanEnv('ENABLE_MPESA_PAYMENTS', true)).toBe(true)
  })

  it('should return false for other string values', () => {
    process.env.ENABLE_MPESA_PAYMENTS = 'yes'
    expect(getBooleanEnv('ENABLE_MPESA_PAYMENTS')).toBe(false)

    process.env.ENABLE_MPESA_PAYMENTS = 'enabled'
    expect(getBooleanEnv('ENABLE_MPESA_PAYMENTS')).toBe(false)
  })
})

describe('getNumericEnv', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return parsed number when env var is valid integer', () => {
    process.env.MAX_UPLOAD_SIZE = '10485760'
    expect(getNumericEnv('MAX_UPLOAD_SIZE', 5242880)).toBe(10485760)
  })

  it('should return default value when env var is missing', () => {
    delete process.env.MAX_UPLOAD_SIZE
    expect(getNumericEnv('MAX_UPLOAD_SIZE', 5242880)).toBe(5242880)
  })

  it('should return default value when env var is not a number', () => {
    process.env.MAX_UPLOAD_SIZE = 'invalid'
    expect(getNumericEnv('MAX_UPLOAD_SIZE', 5242880)).toBe(5242880)
  })

  it('should return default value when env var is empty', () => {
    process.env.MAX_UPLOAD_SIZE = ''
    expect(getNumericEnv('MAX_UPLOAD_SIZE', 5242880)).toBe(5242880)
  })

  it('should handle negative numbers', () => {
    process.env.MAX_UPLOAD_SIZE = '-100'
    expect(getNumericEnv('MAX_UPLOAD_SIZE', 5242880)).toBe(-100)
  })

  it('should truncate floating point numbers', () => {
    process.env.MAX_UPLOAD_SIZE = '100.99'
    expect(getNumericEnv('MAX_UPLOAD_SIZE', 5242880)).toBe(100)
  })

  it('should handle zero', () => {
    process.env.MAX_UPLOAD_SIZE = '0'
    expect(getNumericEnv('MAX_UPLOAD_SIZE', 5242880)).toBe(0)
  })
})
