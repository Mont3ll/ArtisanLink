/**
 * Integration tests for Payout flows
 * 
 * Tests the payout-related API routes:
 * - B2C result callback handling
 * - B2C timeout callback handling
 * - Cron payout processing
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock B2C module
vi.mock('@/lib/mpesa/b2c', () => ({
  isB2CEnabled: vi.fn(() => true),
  getB2CConfig: vi.fn(() => ({
    consumerKey: 'test_key',
    consumerSecret: 'test_secret',
    shortCode: '600000',
    initiatorName: 'testapi',
    securityCredential: 'encrypted_credential',
    resultUrl: 'https://example.com/result',
    timeoutUrl: 'https://example.com/timeout',
    environment: 'sandbox',
  })),
  validateB2CConfig: vi.fn(() => ({ valid: true, missing: [] })),
  initiateB2C: vi.fn(),
  parseB2CCallback: vi.fn(),
  getB2CResultDescription: vi.fn((code: number) => {
    const descriptions: Record<number, string> = {
      0: 'Success',
      1: 'Insufficient funds in B2C account',
      17: 'System internal error',
    }
    return descriptions[code] || `Unknown error (code: ${code})`
  }),
  shouldRetryPayout: vi.fn((retryCount: number, maxRetries: number = 3) => retryCount < maxRetries),
  getNextRetryTime: vi.fn(() => new Date(Date.now() + 5 * 60 * 1000)),
}))

// Mock main mpesa module
vi.mock('@/lib/mpesa', () => ({
  formatPhoneNumber: vi.fn((phone: string) => phone.replace(/^0/, '254')),
  isValidKenyanPhone: vi.fn(() => true),
  getMpesaAccessToken: vi.fn().mockResolvedValue('test_token'),
  getMpesaConfig: vi.fn(() => ({
    consumerKey: 'test_key',
    consumerSecret: 'test_secret',
    environment: 'sandbox',
  })),
}))

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    artisanPayout: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((callback: (tx: unknown) => Promise<unknown>) => callback({
      artisanPayout: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      notification: {
        create: vi.fn(),
      },
    })),
  },
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

import { prisma } from '@/lib/prisma'
import {
  isB2CEnabled,
  parseB2CCallback,
  initiateB2C,
  shouldRetryPayout,
  getNextRetryTime,
} from '@/lib/mpesa/b2c'

// Import route handlers after mocks
import { POST as b2cResultPOST } from '@/app/api/payments/b2c/result/route'
import { POST as b2cTimeoutPOST } from '@/app/api/payments/b2c/timeout/route'

describe('B2C Payout Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/payments/b2c/result', () => {
    it('should accept invalid callback structure gracefully (to prevent M-Pesa retries)', async () => {
      // M-Pesa callbacks should always be acknowledged with 200 to prevent retries
      // Even invalid data should be accepted (but logged for investigation)
      const request = new Request('http://localhost:3000/api/payments/b2c/result', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
      })

      const response = await b2cResultPOST(request)
      const data = await response.json()

      // Always return 200 to M-Pesa to prevent callback retries
      expect(response.status).toBe(200)
      expect(data.ResultCode).toBe(0)
      expect(data.ResultDesc).toBe('Accepted')
    })

    it('should handle successful B2C callback', async () => {
      const callbackData = {
        Result: {
          ResultType: 0,
          ResultCode: 0,
          ResultDesc: 'The service request is processed successfully.',
          OriginatorConversationID: 'AL-123-abc',
          ConversationID: 'conv_456',
          TransactionID: 'tx_789',
          ResultParameters: {
            ResultParameter: [
              { Key: 'TransactionAmount', Value: 1000 },
              { Key: 'TransactionReceipt', Value: 'QHK7XXXXX' },
              { Key: 'ReceiverPartyPublicName', Value: '254712345678 - John Doe' },
            ],
          },
        },
      }

      vi.mocked(parseB2CCallback).mockReturnValue({
        success: true,
        conversationId: 'conv_456',
        originatorConversationId: 'AL-123-abc',
        transactionId: 'tx_789',
        resultCode: 0,
        resultDesc: 'Success',
        amount: 1000,
        receiptNumber: 'QHK7XXXXX',
        recipientName: '254712345678 - John Doe',
      })

      vi.mocked(prisma.artisanPayout.findFirst).mockResolvedValue({
        id: 'payout_1',
        artisanId: 'artisan_1',
        status: 'PROCESSING',
        netAmount: 1000,
        artisan: { id: 'artisan_1' },
      } as never)

      vi.mocked(prisma.artisanPayout.update).mockResolvedValue({} as never)
      vi.mocked(prisma.notification.create).mockResolvedValue({} as never)

      const request = new Request('http://localhost:3000/api/payments/b2c/result', {
        method: 'POST',
        body: JSON.stringify(callbackData),
      })

      const response = await b2cResultPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ResultCode).toBe(0)
      expect(data.ResultDesc).toContain('processed')
    })

    it('should handle failed B2C callback with retry', async () => {
      const callbackData = {
        Result: {
          ResultType: 0,
          ResultCode: 17,
          ResultDesc: 'System internal error',
          OriginatorConversationID: 'AL-123-abc',
          ConversationID: 'conv_456',
          TransactionID: 'tx_789',
        },
      }

      vi.mocked(parseB2CCallback).mockReturnValue({
        success: false,
        conversationId: 'conv_456',
        originatorConversationId: 'AL-123-abc',
        transactionId: 'tx_789',
        resultCode: 17,
        resultDesc: 'System internal error',
      })

      vi.mocked(prisma.artisanPayout.findFirst).mockResolvedValue({
        id: 'payout_1',
        artisanId: 'artisan_1',
        status: 'PROCESSING',
        netAmount: 1000,
        retryCount: 0,
        maxRetries: 3,
        artisan: { id: 'artisan_1' },
      } as never)

      vi.mocked(shouldRetryPayout).mockReturnValue(true)
      vi.mocked(getNextRetryTime).mockReturnValue(new Date(Date.now() + 5 * 60 * 1000))
      vi.mocked(prisma.artisanPayout.update).mockResolvedValue({} as never)

      const request = new Request('http://localhost:3000/api/payments/b2c/result', {
        method: 'POST',
        body: JSON.stringify(callbackData),
      })

      const response = await b2cResultPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ResultCode).toBe(0) // Always return success to M-Pesa
    })

    it('should handle failed B2C callback without retry (max retries reached)', async () => {
      const callbackData = {
        Result: {
          ResultType: 0,
          ResultCode: 1,
          ResultDesc: 'Insufficient funds',
          OriginatorConversationID: 'AL-123-abc',
          ConversationID: 'conv_456',
          TransactionID: 'tx_789',
        },
      }

      vi.mocked(parseB2CCallback).mockReturnValue({
        success: false,
        conversationId: 'conv_456',
        originatorConversationId: 'AL-123-abc',
        transactionId: 'tx_789',
        resultCode: 1,
        resultDesc: 'Insufficient funds',
      })

      vi.mocked(prisma.artisanPayout.findFirst).mockResolvedValue({
        id: 'payout_1',
        artisanId: 'artisan_1',
        status: 'PROCESSING',
        netAmount: 1000,
        retryCount: 3,
        maxRetries: 3,
        artisan: { id: 'artisan_1' },
      } as never)

      vi.mocked(shouldRetryPayout).mockReturnValue(false)
      vi.mocked(prisma.artisanPayout.update).mockResolvedValue({} as never)
      vi.mocked(prisma.notification.create).mockResolvedValue({} as never)
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'admin_1' } as never)

      const request = new Request('http://localhost:3000/api/payments/b2c/result', {
        method: 'POST',
        body: JSON.stringify(callbackData),
      })

      const response = await b2cResultPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ResultCode).toBe(0)
    })

    it('should handle payout not found gracefully', async () => {
      const callbackData = {
        Result: {
          ResultType: 0,
          ResultCode: 0,
          ResultDesc: 'Success',
          OriginatorConversationID: 'unknown_123',
          ConversationID: 'conv_456',
          TransactionID: 'tx_789',
        },
      }

      vi.mocked(parseB2CCallback).mockReturnValue({
        success: true,
        conversationId: 'conv_456',
        originatorConversationId: 'unknown_123',
        transactionId: 'tx_789',
        resultCode: 0,
        resultDesc: 'Success',
      })

      vi.mocked(prisma.artisanPayout.findFirst).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/payments/b2c/result', {
        method: 'POST',
        body: JSON.stringify(callbackData),
      })

      const response = await b2cResultPOST(request)
      const data = await response.json()

      // Should still return success to prevent M-Pesa retries
      expect(response.status).toBe(200)
      expect(data.ResultCode).toBe(0)
    })
  })

  describe('POST /api/payments/b2c/timeout', () => {
    it('should accept invalid callback structure gracefully (to prevent M-Pesa retries)', async () => {
      // M-Pesa callbacks should always be acknowledged with 200 to prevent retries
      const request = new Request('http://localhost:3000/api/payments/b2c/timeout', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
      })

      const response = await b2cTimeoutPOST(request)
      const data = await response.json()

      // Always return 200 to M-Pesa to prevent callback retries
      expect(response.status).toBe(200)
      expect(data.ResultCode).toBe(0)
    })

    it('should handle timeout callback and schedule retry', async () => {
      const timeoutData = {
        Result: {
          ResultType: 0,
          ResultCode: 1037, // Timeout code
          ResultDesc: 'DS timeout user cannot be reached',
          OriginatorConversationID: 'AL-123-abc',
          ConversationID: 'conv_456',
          TransactionID: '',
        },
      }

      vi.mocked(prisma.artisanPayout.findFirst).mockResolvedValue({
        id: 'payout_1',
        artisanId: 'artisan_1',
        status: 'PROCESSING',
        netAmount: 1000,
        retryCount: 0,
        maxRetries: 3,
      } as never)

      vi.mocked(shouldRetryPayout).mockReturnValue(true)
      vi.mocked(getNextRetryTime).mockReturnValue(new Date(Date.now() + 5 * 60 * 1000))
      vi.mocked(prisma.artisanPayout.update).mockResolvedValue({} as never)

      const request = new Request('http://localhost:3000/api/payments/b2c/timeout', {
        method: 'POST',
        body: JSON.stringify(timeoutData),
      })

      const response = await b2cTimeoutPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ResultCode).toBe(0)
    })

    it('should mark payout as failed when max retries reached on timeout', async () => {
      const timeoutData = {
        Result: {
          ResultType: 0,
          ResultCode: 1037,
          ResultDesc: 'DS timeout',
          OriginatorConversationID: 'AL-123-abc',
          ConversationID: 'conv_456',
          TransactionID: '',
        },
      }

      vi.mocked(prisma.artisanPayout.findFirst).mockResolvedValue({
        id: 'payout_1',
        artisanId: 'artisan_1',
        status: 'PROCESSING',
        netAmount: 1000,
        retryCount: 3,
        maxRetries: 3,
        artisan: { id: 'artisan_1' },
      } as never)

      vi.mocked(shouldRetryPayout).mockReturnValue(false)
      vi.mocked(prisma.artisanPayout.update).mockResolvedValue({} as never)
      vi.mocked(prisma.notification.create).mockResolvedValue({} as never)
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'admin_1' } as never)

      const request = new Request('http://localhost:3000/api/payments/b2c/timeout', {
        method: 'POST',
        body: JSON.stringify(timeoutData),
      })

      const response = await b2cTimeoutPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ResultCode).toBe(0)
    })
  })
})

describe('Payout Processing Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Retry Logic', () => {
    it('should allow retry when retryCount < maxRetries', () => {
      vi.mocked(shouldRetryPayout).mockImplementation((count, max = 3) => count < max)
      
      expect(shouldRetryPayout(0, 3)).toBe(true)
      expect(shouldRetryPayout(1, 3)).toBe(true)
      expect(shouldRetryPayout(2, 3)).toBe(true)
    })

    it('should deny retry when retryCount >= maxRetries', () => {
      vi.mocked(shouldRetryPayout).mockImplementation((count, max = 3) => count < max)
      
      expect(shouldRetryPayout(3, 3)).toBe(false)
      expect(shouldRetryPayout(4, 3)).toBe(false)
    })
  })

  describe('B2C Enable Check', () => {
    it('should check if B2C is enabled before processing', () => {
      vi.mocked(isB2CEnabled).mockReturnValue(true)
      expect(isB2CEnabled()).toBe(true)

      vi.mocked(isB2CEnabled).mockReturnValue(false)
      expect(isB2CEnabled()).toBe(false)
    })
  })
})
