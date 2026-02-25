/**
 * Tests for lib/mpesa/b2c.ts
 * 
 * Tests the M-Pesa B2C (Business to Customer) API integration
 * for sending payouts to artisans.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the main mpesa module
vi.mock('@/lib/mpesa', () => ({
  formatPhoneNumber: vi.fn((phone: string) => {
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, '')
    if (cleaned.startsWith('0')) return '254' + cleaned.slice(1)
    if (cleaned.startsWith('7') && cleaned.length === 9) return '254' + cleaned
    if (cleaned.startsWith('1') && cleaned.length === 9) return '254' + cleaned
    if (cleaned.startsWith('254')) return cleaned
    return cleaned
  }),
  isValidKenyanPhone: vi.fn((phone: string) => {
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, '')
    return /^(?:254|0)?([17]\d{8})$/.test(cleaned)
  }),
  getMpesaAccessToken: vi.fn().mockResolvedValue('test_access_token'),
  getMpesaConfig: vi.fn(() => ({
    consumerKey: 'test_key',
    consumerSecret: 'test_secret',
    passkey: 'test_passkey',
    shortCode: '174379',
    callbackUrl: 'https://example.com/callback',
    environment: 'sandbox',
  })),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

import {
  getB2CConfig,
  validateB2CConfig,
  isB2CEnabled,
  initiateB2C,
  parseB2CCallback,
  getB2CResultDescription,
  calculateRetryDelay,
  getNextRetryTime,
  shouldRetryPayout,
  type B2CConfig,
  type B2CCallbackData,
} from '@/lib/mpesa/b2c'

describe('getB2CConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return config from environment variables', () => {
    process.env.MPESA_CONSUMER_KEY = 'test_key'
    process.env.MPESA_CONSUMER_SECRET = 'test_secret'
    process.env.MPESA_B2C_SHORTCODE = '600000'
    process.env.MPESA_B2C_INITIATOR_NAME = 'testapi'
    process.env.MPESA_B2C_SECURITY_CREDENTIAL = 'encrypted_credential'
    process.env.MPESA_B2C_RESULT_URL = 'https://example.com/result'
    process.env.MPESA_B2C_TIMEOUT_URL = 'https://example.com/timeout'
    process.env.MPESA_ENVIRONMENT = 'production'

    const config = getB2CConfig()

    expect(config.consumerKey).toBe('test_key')
    expect(config.consumerSecret).toBe('test_secret')
    expect(config.shortCode).toBe('600000')
    expect(config.initiatorName).toBe('testapi')
    expect(config.securityCredential).toBe('encrypted_credential')
    expect(config.resultUrl).toBe('https://example.com/result')
    expect(config.timeoutUrl).toBe('https://example.com/timeout')
    expect(config.environment).toBe('production')
  })

  it('should return empty strings and sandbox as defaults', () => {
    delete process.env.MPESA_CONSUMER_KEY
    delete process.env.MPESA_CONSUMER_SECRET
    delete process.env.MPESA_B2C_SHORTCODE
    delete process.env.MPESA_B2C_INITIATOR_NAME
    delete process.env.MPESA_B2C_SECURITY_CREDENTIAL
    delete process.env.MPESA_B2C_RESULT_URL
    delete process.env.MPESA_B2C_TIMEOUT_URL
    delete process.env.MPESA_ENVIRONMENT

    const config = getB2CConfig()

    expect(config.consumerKey).toBe('')
    expect(config.consumerSecret).toBe('')
    expect(config.shortCode).toBe('')
    expect(config.initiatorName).toBe('')
    expect(config.securityCredential).toBe('')
    expect(config.resultUrl).toBe('')
    expect(config.timeoutUrl).toBe('')
    expect(config.environment).toBe('sandbox')
  })
})

describe('validateB2CConfig', () => {
  it('should return valid for complete config', () => {
    const config: B2CConfig = {
      consumerKey: 'test_key',
      consumerSecret: 'test_secret',
      shortCode: '600000',
      initiatorName: 'testapi',
      securityCredential: 'encrypted_credential',
      resultUrl: 'https://example.com/result',
      timeoutUrl: 'https://example.com/timeout',
      environment: 'sandbox',
    }

    const result = validateB2CConfig(config)

    expect(result.valid).toBe(true)
    expect(result.missing).toHaveLength(0)
  })

  it('should return invalid with missing fields', () => {
    const config: B2CConfig = {
      consumerKey: 'test_key',
      consumerSecret: '',
      shortCode: '600000',
      initiatorName: '',
      securityCredential: 'encrypted_credential',
      resultUrl: '',
      timeoutUrl: 'https://example.com/timeout',
      environment: 'sandbox',
    }

    const result = validateB2CConfig(config)

    expect(result.valid).toBe(false)
    expect(result.missing).toContain('consumerSecret')
    expect(result.missing).toContain('initiatorName')
    expect(result.missing).toContain('resultUrl')
    expect(result.missing).not.toContain('consumerKey')
    expect(result.missing).not.toContain('shortCode')
  })

  it('should return all required fields missing for empty config', () => {
    const config: B2CConfig = {
      consumerKey: '',
      consumerSecret: '',
      shortCode: '',
      initiatorName: '',
      securityCredential: '',
      resultUrl: '',
      timeoutUrl: '',
      environment: 'sandbox',
    }

    const result = validateB2CConfig(config)

    expect(result.valid).toBe(false)
    expect(result.missing).toHaveLength(7)
  })
})

describe('isB2CEnabled', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return true when ENABLE_B2C_PAYOUTS is "true"', () => {
    process.env.ENABLE_B2C_PAYOUTS = 'true'
    expect(isB2CEnabled()).toBe(true)
  })

  it('should return false when ENABLE_B2C_PAYOUTS is not set', () => {
    delete process.env.ENABLE_B2C_PAYOUTS
    expect(isB2CEnabled()).toBe(false)
  })

  it('should return false when ENABLE_B2C_PAYOUTS is "false"', () => {
    process.env.ENABLE_B2C_PAYOUTS = 'false'
    expect(isB2CEnabled()).toBe(false)
  })

  it('should return false for other values', () => {
    process.env.ENABLE_B2C_PAYOUTS = 'yes'
    expect(isB2CEnabled()).toBe(false)

    process.env.ENABLE_B2C_PAYOUTS = '1'
    expect(isB2CEnabled()).toBe(false)
  })
})

describe('initiateB2C', () => {
  const validConfig: B2CConfig = {
    consumerKey: 'test_key',
    consumerSecret: 'test_secret',
    shortCode: '600000',
    initiatorName: 'testapi',
    securityCredential: 'encrypted_credential',
    resultUrl: 'https://example.com/result',
    timeoutUrl: 'https://example.com/timeout',
    environment: 'sandbox',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  it('should initiate B2C payment successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ConversationID: 'conv_123',
        OriginatorConversationID: 'orig_456',
        ResponseCode: '0',
        ResponseDescription: 'Accept the service request successfully.',
      }),
    })

    const result = await initiateB2C(validConfig, {
      phoneNumber: '0712345678',
      amount: 1000,
      remarks: 'Test payout',
    })

    expect(result.ConversationID).toBe('conv_123')
    expect(result.ResponseCode).toBe('0')
    expect(result.originatorId).toMatch(/^AL-\d+-[a-z0-9]+$/)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test_access_token',
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('should throw error for invalid phone number', async () => {
    await expect(
      initiateB2C(validConfig, {
        phoneNumber: '12345',
        amount: 1000,
        remarks: 'Test',
      })
    ).rejects.toThrow('Invalid Kenyan phone number')
  })

  it('should throw error for amount below minimum (KES 10)', async () => {
    await expect(
      initiateB2C(validConfig, {
        phoneNumber: '0712345678',
        amount: 5,
        remarks: 'Test',
      })
    ).rejects.toThrow('Minimum payout amount is KES 10')
  })

  it('should throw error for amount above maximum (KES 70,000)', async () => {
    await expect(
      initiateB2C(validConfig, {
        phoneNumber: '0712345678',
        amount: 80000,
        remarks: 'Test',
      })
    ).rejects.toThrow('Maximum single payout amount is KES 70,000')
  })

  it('should throw error when security credential is missing', async () => {
    const configWithoutCredential = { ...validConfig, securityCredential: '' }

    await expect(
      initiateB2C(configWithoutCredential, {
        phoneNumber: '0712345678',
        amount: 1000,
        remarks: 'Test',
      })
    ).rejects.toThrow('B2C security credential not configured')
  })

  it('should handle API error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        ResponseCode: '1',
        ResponseDescription: 'Insufficient funds',
      }),
    })

    await expect(
      initiateB2C(validConfig, {
        phoneNumber: '0712345678',
        amount: 1000,
        remarks: 'Test',
      })
    ).rejects.toThrow('Insufficient funds')
  })

  it('should use production URL when environment is production', async () => {
    const productionConfig = { ...validConfig, environment: 'production' as const }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ConversationID: 'conv_123',
        OriginatorConversationID: 'orig_456',
        ResponseCode: '0',
        ResponseDescription: 'Success',
      }),
    })

    await initiateB2C(productionConfig, {
      phoneNumber: '0712345678',
      amount: 1000,
      remarks: 'Test',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
      expect.any(Object)
    )
  })

  it('should truncate remarks to 100 characters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ConversationID: 'conv_123',
        ResponseCode: '0',
        ResponseDescription: 'Success',
      }),
    })

    const longRemarks = 'A'.repeat(150)

    await initiateB2C(validConfig, {
      phoneNumber: '0712345678',
      amount: 1000,
      remarks: longRemarks,
    })

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(callBody.Remarks.length).toBe(100)
  })
})

describe('parseB2CCallback', () => {
  it('should parse successful callback with full metadata', () => {
    const callbackData: B2CCallbackData = {
      Result: {
        ResultType: 0,
        ResultCode: 0,
        ResultDesc: 'The service request is processed successfully.',
        OriginatorConversationID: 'orig_123',
        ConversationID: 'conv_456',
        TransactionID: 'tx_789',
        ResultParameters: {
          ResultParameter: [
            { Key: 'TransactionAmount', Value: 1000 },
            { Key: 'TransactionReceipt', Value: 'QHK7XXXXX' },
            { Key: 'ReceiverPartyPublicName', Value: '254712345678 - John Doe' },
            { Key: 'TransactionCompletedDateTime', Value: '15.01.2026 12:34:56' },
            { Key: 'B2CChargesPaidAccountAvailableFunds', Value: 50000 },
            { Key: 'B2CUtilityAccountAvailableFunds', Value: 30000 },
            { Key: 'B2CWorkingAccountAvailableFunds', Value: 20000 },
          ],
        },
      },
    }

    const result = parseB2CCallback(callbackData)

    expect(result.success).toBe(true)
    expect(result.resultCode).toBe(0)
    expect(result.conversationId).toBe('conv_456')
    expect(result.originatorConversationId).toBe('orig_123')
    expect(result.transactionId).toBe('tx_789')
    expect(result.amount).toBe(1000)
    expect(result.receiptNumber).toBe('QHK7XXXXX')
    expect(result.recipientName).toBe('254712345678 - John Doe')
    expect(result.completedAt).toBe('15.01.2026 12:34:56')
    expect(result.chargesPaidAccountFunds).toBe(50000)
    expect(result.utilityAccountFunds).toBe(30000)
    expect(result.workingAccountFunds).toBe(20000)
  })

  it('should parse failed callback', () => {
    const callbackData: B2CCallbackData = {
      Result: {
        ResultType: 0,
        ResultCode: 1,
        ResultDesc: 'Insufficient funds in B2C account',
        OriginatorConversationID: 'orig_123',
        ConversationID: 'conv_456',
        TransactionID: 'tx_789',
      },
    }

    const result = parseB2CCallback(callbackData)

    expect(result.success).toBe(false)
    expect(result.resultCode).toBe(1)
    expect(result.resultDesc).toBe('Insufficient funds in B2C account')
    expect(result.amount).toBeUndefined()
    expect(result.receiptNumber).toBeUndefined()
  })

  it('should handle callback without ResultParameters', () => {
    const callbackData: B2CCallbackData = {
      Result: {
        ResultType: 0,
        ResultCode: 0,
        ResultDesc: 'Success',
        OriginatorConversationID: 'orig_123',
        ConversationID: 'conv_456',
        TransactionID: 'tx_789',
      },
    }

    const result = parseB2CCallback(callbackData)

    expect(result.success).toBe(true)
    expect(result.amount).toBeUndefined()
    expect(result.receiptNumber).toBeUndefined()
  })
})

describe('getB2CResultDescription', () => {
  it('should return "Success" for code 0', () => {
    expect(getB2CResultDescription(0)).toBe('Success')
  })

  it('should return "Insufficient funds in B2C account" for code 1', () => {
    expect(getB2CResultDescription(1)).toBe('Insufficient funds in B2C account')
  })

  it('should return "Less than minimum transaction value" for code 2', () => {
    expect(getB2CResultDescription(2)).toBe('Less than minimum transaction value')
  })

  it('should return "More than maximum transaction value" for code 3', () => {
    expect(getB2CResultDescription(3)).toBe('More than maximum transaction value')
  })

  it('should return "Would exceed daily transfer limit" for code 4', () => {
    expect(getB2CResultDescription(4)).toBe('Would exceed daily transfer limit')
  })

  it('should return "Duplicate detected" for code 15', () => {
    expect(getB2CResultDescription(15)).toBe('Duplicate detected')
  })

  it('should return "System internal error" for code 17', () => {
    expect(getB2CResultDescription(17)).toBe('System internal error')
  })

  it('should return "Traffic blocking condition in place" for code 26', () => {
    expect(getB2CResultDescription(26)).toBe('Traffic blocking condition in place')
  })

  it('should return "Unknown error" for unrecognized codes', () => {
    expect(getB2CResultDescription(9999)).toBe('Unknown error (code: 9999)')
    expect(getB2CResultDescription(-1)).toBe('Unknown error (code: -1)')
  })
})

describe('calculateRetryDelay', () => {
  it('should return 5 minutes for first retry (retryCount 0)', () => {
    expect(calculateRetryDelay(0)).toBe(5 * 60 * 1000)
  })

  it('should return 30 minutes for second retry (retryCount 1)', () => {
    expect(calculateRetryDelay(1)).toBe(30 * 60 * 1000)
  })

  it('should return 2 hours for third retry (retryCount 2)', () => {
    expect(calculateRetryDelay(2)).toBe(2 * 60 * 60 * 1000)
  })

  it('should cap at 2 hours for retryCount >= 2', () => {
    expect(calculateRetryDelay(3)).toBe(2 * 60 * 60 * 1000)
    expect(calculateRetryDelay(10)).toBe(2 * 60 * 60 * 1000)
  })
})

describe('getNextRetryTime', () => {
  it('should return a future date based on retry count', () => {
    const now = Date.now()
    const nextRetry = getNextRetryTime(0)
    
    // Should be approximately 5 minutes in the future
    expect(nextRetry.getTime()).toBeGreaterThan(now)
    expect(nextRetry.getTime()).toBeLessThanOrEqual(now + 5 * 60 * 1000 + 1000) // +1s tolerance
  })

  it('should return increasingly later times for higher retry counts', () => {
    const retry0 = getNextRetryTime(0)
    const retry1 = getNextRetryTime(1)
    const retry2 = getNextRetryTime(2)

    expect(retry1.getTime()).toBeGreaterThan(retry0.getTime())
    expect(retry2.getTime()).toBeGreaterThan(retry1.getTime())
  })
})

describe('shouldRetryPayout', () => {
  it('should return true when retryCount is below maxRetries', () => {
    expect(shouldRetryPayout(0, 3)).toBe(true)
    expect(shouldRetryPayout(1, 3)).toBe(true)
    expect(shouldRetryPayout(2, 3)).toBe(true)
  })

  it('should return false when retryCount equals maxRetries', () => {
    expect(shouldRetryPayout(3, 3)).toBe(false)
  })

  it('should return false when retryCount exceeds maxRetries', () => {
    expect(shouldRetryPayout(4, 3)).toBe(false)
    expect(shouldRetryPayout(10, 3)).toBe(false)
  })

  it('should use default maxRetries of 3', () => {
    expect(shouldRetryPayout(0)).toBe(true)
    expect(shouldRetryPayout(2)).toBe(true)
    expect(shouldRetryPayout(3)).toBe(false)
  })

  it('should support custom maxRetries', () => {
    expect(shouldRetryPayout(4, 5)).toBe(true)
    expect(shouldRetryPayout(5, 5)).toBe(false)
  })
})
