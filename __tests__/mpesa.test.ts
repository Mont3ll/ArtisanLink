/**
 * Tests for lib/mpesa.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatPhoneNumber,
  isValidKenyanPhone,
  parseSTKCallback,
  getResultCodeDescription,
  validateMpesaConfig,
  getMpesaConfig,
  isMpesaEnabled,
  SUBSCRIPTION_PLANS,
  type MpesaConfig,
  type STKCallbackData,
} from '../lib/mpesa'

describe('formatPhoneNumber', () => {
  it('should format phone starting with 0 to 254 format', () => {
    expect(formatPhoneNumber('0712345678')).toBe('254712345678')
    expect(formatPhoneNumber('0798765432')).toBe('254798765432')
  })

  it('should format phone starting with 7 (9 digits) to 254 format', () => {
    expect(formatPhoneNumber('712345678')).toBe('254712345678')
    expect(formatPhoneNumber('798765432')).toBe('254798765432')
  })

  it('should handle phone already in 254 format', () => {
    expect(formatPhoneNumber('254712345678')).toBe('254712345678')
  })

  it('should handle phone with +254 prefix', () => {
    expect(formatPhoneNumber('+254712345678')).toBe('254712345678')
  })

  it('should remove spaces and dashes', () => {
    expect(formatPhoneNumber('0712 345 678')).toBe('254712345678')
    expect(formatPhoneNumber('0712-345-678')).toBe('254712345678')
    expect(formatPhoneNumber('+254 712 345 678')).toBe('254712345678')
  })

  it('should remove other special characters', () => {
    expect(formatPhoneNumber('(0712) 345-678')).toBe('254712345678')
  })

  it('should handle Safaricom numbers (07xx)', () => {
    expect(formatPhoneNumber('0722123456')).toBe('254722123456')
    expect(formatPhoneNumber('0733123456')).toBe('254733123456')
  })

  it('should handle Airtel numbers (01xx)', () => {
    expect(formatPhoneNumber('0100123456')).toBe('254100123456')
    expect(formatPhoneNumber('0101123456')).toBe('254101123456')
  })
})

describe('isValidKenyanPhone', () => {
  it('should return true for valid Safaricom numbers (07xx)', () => {
    expect(isValidKenyanPhone('0712345678')).toBe(true)
    expect(isValidKenyanPhone('254712345678')).toBe(true)
    expect(isValidKenyanPhone('+254712345678')).toBe(true)
    expect(isValidKenyanPhone('0722123456')).toBe(true)
    expect(isValidKenyanPhone('0733123456')).toBe(true)
  })

  it('should return true for valid Airtel numbers (01xx)', () => {
    expect(isValidKenyanPhone('0100123456')).toBe(true)
    expect(isValidKenyanPhone('254100123456')).toBe(true)
    expect(isValidKenyanPhone('+254100123456')).toBe(true)
  })

  it('should return false for invalid phone numbers', () => {
    expect(isValidKenyanPhone('12345')).toBe(false)
    expect(isValidKenyanPhone('071234567')).toBe(false) // too short
    expect(isValidKenyanPhone('07123456789')).toBe(false) // too long
    expect(isValidKenyanPhone('0812345678')).toBe(false) // invalid prefix
    expect(isValidKenyanPhone('')).toBe(false)
  })

  it('should return false for non-Kenyan numbers', () => {
    expect(isValidKenyanPhone('+1234567890')).toBe(false)
    expect(isValidKenyanPhone('447123456789')).toBe(false)
  })
})

describe('parseSTKCallback', () => {
  it('should parse successful callback with metadata', () => {
    const callbackData: STKCallbackData = {
      Body: {
        stkCallback: {
          MerchantRequestID: 'merchant-123',
          CheckoutRequestID: 'checkout-456',
          ResultCode: 0,
          ResultDesc: 'The service request is processed successfully.',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 500 },
              { Name: 'MpesaReceiptNumber', Value: 'QHK7XXXXX' },
              { Name: 'TransactionDate', Value: 20240115123456 },
              { Name: 'PhoneNumber', Value: 254712345678 },
            ],
          },
        },
      },
    }

    const result = parseSTKCallback(callbackData)

    expect(result.merchantRequestId).toBe('merchant-123')
    expect(result.checkoutRequestId).toBe('checkout-456')
    expect(result.resultCode).toBe(0)
    expect(result.resultDesc).toBe('The service request is processed successfully.')
    expect(result.success).toBe(true)
    expect(result.amount).toBe(500)
    expect(result.mpesaReceiptNumber).toBe('QHK7XXXXX')
    expect(result.transactionDate).toBe('20240115123456')
    expect(result.phoneNumber).toBe('254712345678')
  })

  it('should parse failed callback (user cancelled)', () => {
    const callbackData: STKCallbackData = {
      Body: {
        stkCallback: {
          MerchantRequestID: 'merchant-123',
          CheckoutRequestID: 'checkout-456',
          ResultCode: 1032,
          ResultDesc: 'Request cancelled by user',
        },
      },
    }

    const result = parseSTKCallback(callbackData)

    expect(result.merchantRequestId).toBe('merchant-123')
    expect(result.checkoutRequestId).toBe('checkout-456')
    expect(result.resultCode).toBe(1032)
    expect(result.success).toBe(false)
    expect(result.amount).toBeUndefined()
    expect(result.mpesaReceiptNumber).toBeUndefined()
  })

  it('should parse failed callback (insufficient funds)', () => {
    const callbackData: STKCallbackData = {
      Body: {
        stkCallback: {
          MerchantRequestID: 'merchant-789',
          CheckoutRequestID: 'checkout-012',
          ResultCode: 1,
          ResultDesc: 'Insufficient funds',
        },
      },
    }

    const result = parseSTKCallback(callbackData)

    expect(result.success).toBe(false)
    expect(result.resultCode).toBe(1)
  })

  it('should handle callback with partial metadata', () => {
    const callbackData: STKCallbackData = {
      Body: {
        stkCallback: {
          MerchantRequestID: 'merchant-123',
          CheckoutRequestID: 'checkout-456',
          ResultCode: 0,
          ResultDesc: 'Success',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 1000 },
              { Name: 'MpesaReceiptNumber', Value: 'ABC123' },
            ],
          },
        },
      },
    }

    const result = parseSTKCallback(callbackData)

    expect(result.success).toBe(true)
    expect(result.amount).toBe(1000)
    expect(result.mpesaReceiptNumber).toBe('ABC123')
    expect(result.transactionDate).toBeUndefined()
    expect(result.phoneNumber).toBeUndefined()
  })
})

describe('getResultCodeDescription', () => {
  it('should return "Success" for code 0', () => {
    expect(getResultCodeDescription(0)).toBe('Success')
  })

  it('should return "Insufficient funds" for code 1', () => {
    expect(getResultCodeDescription(1)).toBe('Insufficient funds')
  })

  it('should return "Transaction cancelled by user" for code 1032', () => {
    expect(getResultCodeDescription(1032)).toBe('Transaction cancelled by user')
  })

  it('should return "Timeout waiting for user input" for code 1037', () => {
    expect(getResultCodeDescription(1037)).toBe('Timeout waiting for user input')
  })

  it('should return "Wrong PIN entered" for code 2001', () => {
    expect(getResultCodeDescription(2001)).toBe('Wrong PIN entered')
  })

  it('should return "Unable to lock subscriber" for code 1001', () => {
    expect(getResultCodeDescription(1001)).toBe('Unable to lock subscriber')
  })

  it('should return "Transaction expired" for code 1019', () => {
    expect(getResultCodeDescription(1019)).toBe('Transaction expired')
  })

  it('should return "Unknown error" for unrecognized codes', () => {
    expect(getResultCodeDescription(9999)).toBe('Unknown error (code: 9999)')
    expect(getResultCodeDescription(-1)).toBe('Unknown error (code: -1)')
  })
})

describe('validateMpesaConfig', () => {
  it('should return valid for complete config', () => {
    const config: MpesaConfig = {
      consumerKey: 'test_key',
      consumerSecret: 'test_secret',
      passkey: 'test_passkey',
      shortCode: '174379',
      callbackUrl: 'https://example.com/callback',
      environment: 'sandbox',
    }

    const result = validateMpesaConfig(config)

    expect(result.valid).toBe(true)
    expect(result.missing).toHaveLength(0)
  })

  it('should return invalid with missing fields', () => {
    const config: MpesaConfig = {
      consumerKey: 'test_key',
      consumerSecret: '',
      passkey: 'test_passkey',
      shortCode: '',
      callbackUrl: 'https://example.com/callback',
      environment: 'sandbox',
    }

    const result = validateMpesaConfig(config)

    expect(result.valid).toBe(false)
    expect(result.missing).toContain('consumerSecret')
    expect(result.missing).toContain('shortCode')
    expect(result.missing).not.toContain('consumerKey')
  })

  it('should return all fields missing for empty config', () => {
    const config: MpesaConfig = {
      consumerKey: '',
      consumerSecret: '',
      passkey: '',
      shortCode: '',
      callbackUrl: '',
      environment: 'sandbox',
    }

    const result = validateMpesaConfig(config)

    expect(result.valid).toBe(false)
    expect(result.missing).toHaveLength(5)
    expect(result.missing).toContain('consumerKey')
    expect(result.missing).toContain('consumerSecret')
    expect(result.missing).toContain('passkey')
    expect(result.missing).toContain('shortCode')
    expect(result.missing).toContain('callbackUrl')
  })
})

describe('getMpesaConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return config from environment variables', () => {
    process.env.MPESA_CONSUMER_KEY = 'env_key'
    process.env.MPESA_CONSUMER_SECRET = 'env_secret'
    process.env.MPESA_PASSKEY = 'env_passkey'
    process.env.MPESA_SHORT_CODE = '123456'
    process.env.MPESA_CALLBACK_URL = 'https://test.com/callback'
    process.env.MPESA_ENVIRONMENT = 'production'

    const config = getMpesaConfig()

    expect(config.consumerKey).toBe('env_key')
    expect(config.consumerSecret).toBe('env_secret')
    expect(config.passkey).toBe('env_passkey')
    expect(config.shortCode).toBe('123456')
    expect(config.callbackUrl).toBe('https://test.com/callback')
    expect(config.environment).toBe('production')
  })

  it('should return empty strings and sandbox as defaults', () => {
    delete process.env.MPESA_CONSUMER_KEY
    delete process.env.MPESA_CONSUMER_SECRET
    delete process.env.MPESA_PASSKEY
    delete process.env.MPESA_SHORT_CODE
    delete process.env.MPESA_CALLBACK_URL
    delete process.env.MPESA_ENVIRONMENT

    const config = getMpesaConfig()

    expect(config.consumerKey).toBe('')
    expect(config.consumerSecret).toBe('')
    expect(config.passkey).toBe('')
    expect(config.shortCode).toBe('')
    expect(config.callbackUrl).toBe('')
    expect(config.environment).toBe('sandbox')
  })
})

describe('isMpesaEnabled', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return true when ENABLE_MPESA_PAYMENTS is "true"', () => {
    process.env.ENABLE_MPESA_PAYMENTS = 'true'
    expect(isMpesaEnabled()).toBe(true)
  })

  it('should return false when ENABLE_MPESA_PAYMENTS is not set', () => {
    delete process.env.ENABLE_MPESA_PAYMENTS
    expect(isMpesaEnabled()).toBe(false)
  })

  it('should return false when ENABLE_MPESA_PAYMENTS is "false"', () => {
    process.env.ENABLE_MPESA_PAYMENTS = 'false'
    expect(isMpesaEnabled()).toBe(false)
  })

  it('should return false for other values', () => {
    process.env.ENABLE_MPESA_PAYMENTS = 'yes'
    expect(isMpesaEnabled()).toBe(false)

    process.env.ENABLE_MPESA_PAYMENTS = '1'
    expect(isMpesaEnabled()).toBe(false)
  })
})

describe('SUBSCRIPTION_PLANS', () => {
  it('should have MONTHLY and ANNUAL plans', () => {
    expect(SUBSCRIPTION_PLANS.MONTHLY).toBeDefined()
    expect(SUBSCRIPTION_PLANS.ANNUAL).toBeDefined()
  })

  it('should have correct MONTHLY plan properties', () => {
    const monthly = SUBSCRIPTION_PLANS.MONTHLY
    expect(monthly.name).toBe('Monthly')
    expect(monthly.price).toBe(150)
    expect(monthly.durationDays).toBe(30)
    expect(monthly.features).toBeInstanceOf(Array)
    expect(monthly.features.length).toBeGreaterThan(0)
  })

  it('should have correct ANNUAL plan properties', () => {
    const annual = SUBSCRIPTION_PLANS.ANNUAL
    expect(annual.name).toBe('Annual')
    expect(annual.price).toBe(1500)
    expect(annual.durationDays).toBe(365)
    expect(annual.features).toBeInstanceOf(Array)
    expect(annual.features.length).toBeGreaterThan(0)
  })

  it('should have annual plan cheaper per month than monthly', () => {
    const monthlyPerMonth = SUBSCRIPTION_PLANS.MONTHLY.price
    const annualPerMonth = SUBSCRIPTION_PLANS.ANNUAL.price / 12
    expect(annualPerMonth).toBeLessThan(monthlyPerMonth)
  })
})
