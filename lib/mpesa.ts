/**
 * M-Pesa Daraja API Integration
 * 
 * This module provides utilities for integrating with Safaricom's M-Pesa Daraja API
 * for STK Push (Lipa Na M-Pesa Online) payments.
 * 
 * Documentation: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
 */

import { createLogger } from '@/lib/logger'

const logger = createLogger('lib/mpesa')

// M-Pesa API URLs
const MPESA_URLS = {
  sandbox: {
    oauth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    stkQuery: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
  },
  production: {
    oauth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    stkQuery: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
  },
} as const

// Types
export interface MpesaConfig {
  consumerKey: string
  consumerSecret: string
  passkey: string
  shortCode: string
  callbackUrl: string
  environment: 'sandbox' | 'production'
}

export interface STKPushRequest {
  phoneNumber: string // Format: 254XXXXXXXXX
  amount: number
  accountReference: string
  transactionDesc: string
  callbackUrl?: string // Optional override for callback URL
}

export interface STKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export interface STKQueryResponse {
  ResponseCode: string
  ResponseDescription: string
  MerchantRequestID: string
  CheckoutRequestID: string
  ResultCode: string
  ResultDesc: string
}

export interface STKCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{
          Name: string
          Value?: string | number
        }>
      }
    }
  }
}

// Parsed callback result
export interface ParsedCallbackResult {
  merchantRequestId: string
  checkoutRequestId: string
  resultCode: number
  resultDesc: string
  success: boolean
  amount?: number
  mpesaReceiptNumber?: string
  transactionDate?: string
  phoneNumber?: string
}

/**
 * Get M-Pesa configuration from environment variables
 */
export function getMpesaConfig(): MpesaConfig {
  const config: MpesaConfig = {
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    passkey: process.env.MPESA_PASSKEY || '',
    shortCode: process.env.MPESA_SHORT_CODE || '',
    callbackUrl: process.env.MPESA_CALLBACK_URL || '',
    environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  }

  return config
}

/**
 * Validate M-Pesa configuration
 */
export function validateMpesaConfig(config: MpesaConfig): { valid: boolean; missing: string[] } {
  const required = ['consumerKey', 'consumerSecret', 'passkey', 'shortCode', 'callbackUrl'] as const
  const missing = required.filter((key) => !config[key])
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Check if M-Pesa payments are enabled
 */
export function isMpesaEnabled(): boolean {
  return process.env.ENABLE_MPESA_PAYMENTS === 'true'
}

/**
 * Get OAuth access token from M-Pesa
 */
export async function getMpesaAccessToken(config: MpesaConfig): Promise<string> {
  const urls = MPESA_URLS[config.environment]
  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64')

  try {
    const response = await fetch(urls.oauth, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Failed to get M-Pesa access token', { status: response.status, error: errorText })
      throw new Error(`Failed to get M-Pesa access token: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    logger.error('M-Pesa OAuth error', error)
    throw error
  }
}

/**
 * Generate timestamp in format YYYYMMDDHHmmss
 */
function generateTimestamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

/**
 * Generate password for STK Push
 * Password = Base64.encode(ShortCode + Passkey + Timestamp)
 */
function generatePassword(shortCode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64')
}

/**
 * Format phone number to M-Pesa format (254XXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any spaces, dashes, or other characters
  let cleaned = phone.replace(/[^0-9]/g, '')
  
  // Handle different formats
  if (cleaned.startsWith('0')) {
    // Convert 07XXXXXXXX to 2547XXXXXXXX
    cleaned = '254' + cleaned.substring(1)
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    // Convert 7XXXXXXXX to 2547XXXXXXXX
    cleaned = '254' + cleaned
  } else if (cleaned.startsWith('+254')) {
    // Remove the +
    cleaned = cleaned.substring(1)
  }
  
  return cleaned
}

/**
 * Validate Kenyan phone number
 */
export function isValidKenyanPhone(phone: string): boolean {
  const formatted = formatPhoneNumber(phone)
  // Must be 12 digits starting with 254 and then 7 or 1
  return /^254[71]\d{8}$/.test(formatted)
}

/**
 * Initiate STK Push (Lipa Na M-Pesa Online)
 */
export async function initiateSTKPush(
  config: MpesaConfig,
  request: STKPushRequest
): Promise<STKPushResponse> {
  const urls = MPESA_URLS[config.environment]
  const timestamp = generateTimestamp()
  const password = generatePassword(config.shortCode, config.passkey, timestamp)

  // Format phone number
  const phoneNumber = formatPhoneNumber(request.phoneNumber)
  
  if (!isValidKenyanPhone(phoneNumber)) {
    throw new Error('Invalid Kenyan phone number')
  }

  // Get access token
  const accessToken = await getMpesaAccessToken(config)

  const payload = {
    BusinessShortCode: config.shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(request.amount), // M-Pesa only accepts whole numbers
    PartyA: phoneNumber,
    PartyB: config.shortCode,
    PhoneNumber: phoneNumber,
    CallBackURL: request.callbackUrl || config.callbackUrl,
    AccountReference: request.accountReference.substring(0, 12), // Max 12 chars
    TransactionDesc: request.transactionDesc.substring(0, 13), // Max 13 chars
  }

  try {
    logger.info('Initiating STK Push', { 
      phoneNumber: phoneNumber.substring(0, 6) + '****', 
      amount: request.amount,
      accountReference: request.accountReference,
    })

    const response = await fetch(urls.stkPush, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok || data.ResponseCode !== '0') {
      logger.error('STK Push failed', { response: data })
      throw new Error(data.ResponseDescription || data.errorMessage || 'STK Push failed')
    }

    logger.info('STK Push initiated successfully', {
      merchantRequestId: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
    })

    return data as STKPushResponse
  } catch (error) {
    logger.error('STK Push error', error)
    throw error
  }
}

/**
 * Query STK Push status
 */
export async function querySTKPushStatus(
  config: MpesaConfig,
  checkoutRequestId: string
): Promise<STKQueryResponse> {
  const urls = MPESA_URLS[config.environment]
  const timestamp = generateTimestamp()
  const password = generatePassword(config.shortCode, config.passkey, timestamp)

  const accessToken = await getMpesaAccessToken(config)

  const payload = {
    BusinessShortCode: config.shortCode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  }

  try {
    const response = await fetch(urls.stkQuery, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      logger.error('STK Query failed', { response: data })
      throw new Error(data.errorMessage || 'STK Query failed')
    }

    return data as STKQueryResponse
  } catch (error) {
    logger.error('STK Query error', error)
    throw error
  }
}

/**
 * Parse STK Push callback data
 */
export function parseSTKCallback(data: STKCallbackData): ParsedCallbackResult {
  const callback = data.Body.stkCallback
  const result: ParsedCallbackResult = {
    merchantRequestId: callback.MerchantRequestID,
    checkoutRequestId: callback.CheckoutRequestID,
    resultCode: callback.ResultCode,
    resultDesc: callback.ResultDesc,
    success: callback.ResultCode === 0,
  }

  // Extract metadata if payment was successful
  if (callback.ResultCode === 0 && callback.CallbackMetadata?.Item) {
    for (const item of callback.CallbackMetadata.Item) {
      switch (item.Name) {
        case 'Amount':
          result.amount = item.Value as number
          break
        case 'MpesaReceiptNumber':
          result.mpesaReceiptNumber = item.Value as string
          break
        case 'TransactionDate':
          result.transactionDate = String(item.Value)
          break
        case 'PhoneNumber':
          result.phoneNumber = String(item.Value)
          break
      }
    }
  }

  return result
}

/**
 * Get result code description
 */
export function getResultCodeDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Success',
    1: 'Insufficient funds',
    1032: 'Transaction cancelled by user',
    1037: 'Timeout waiting for user input',
    2001: 'Wrong PIN entered',
    1001: 'Unable to lock subscriber',
    1019: 'Transaction expired',
  }
  
  return descriptions[code] || `Unknown error (code: ${code})`
}

// Subscription plan pricing
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    name: 'Monthly',
    price: 150, // KES
    durationDays: 30,
    features: [
      'Unlimited profile visibility',
      'Accept unlimited inquiries',
      'Priority listing in search',
      'Portfolio showcase (up to 20 items)',
      'Messaging with clients',
    ],
  },
  ANNUAL: {
    name: 'Annual',
    price: 1500, // KES (save KES 300)
    durationDays: 365,
    features: [
      'All Monthly features',
      'Save KES 300 per year',
      'Verified badge',
      'Featured in homepage',
      'Analytics dashboard',
      'Priority support',
    ],
  },
} as const

export type SubscriptionPlanType = keyof typeof SUBSCRIPTION_PLANS
