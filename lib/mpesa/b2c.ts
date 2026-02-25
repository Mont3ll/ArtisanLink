/**
 * M-Pesa B2C (Business to Customer) API Integration
 * 
 * This module provides utilities for sending payouts to artisans via M-Pesa B2C API.
 * Used for automatic artisan payments when clients pay for jobs.
 * 
 * Documentation: https://developer.safaricom.co.ke/APIs/BusinessToCustomer
 * 
 * Security Credential Setup:
 * 1. Go to https://developer.safaricom.co.ke/dashboard/testcredentials
 * 2. Enter your initiator password
 * 3. Select environment (sandbox/production)
 * 4. Click generate to get the pre-encrypted security credential
 * 5. Copy and set as MPESA_B2C_SECURITY_CREDENTIAL env variable
 */

import { createLogger } from '@/lib/logger'
import { formatPhoneNumber, isValidKenyanPhone, getMpesaAccessToken, MpesaConfig, getMpesaConfig } from '@/lib/mpesa'

const logger = createLogger('lib/mpesa/b2c')

// B2C API URLs
const B2C_URLS = {
  sandbox: {
    b2c: 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
  },
  production: {
    b2c: 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
  },
} as const

// B2C Transaction Types
export type B2CCommandID = 'BusinessPayment' | 'SalaryPayment' | 'PromotionPayment'

// B2C Configuration
export interface B2CConfig {
  consumerKey: string
  consumerSecret: string
  shortCode: string
  initiatorName: string
  securityCredential: string // Pre-encrypted credential from Daraja portal
  resultUrl: string
  timeoutUrl: string
  environment: 'sandbox' | 'production'
}

// B2C Request
export interface B2CRequest {
  phoneNumber: string // Format: 254XXXXXXXXX
  amount: number
  remarks: string
  occasion?: string
  commandId?: B2CCommandID
}

// B2C Response (Acknowledgement)
export interface B2CResponse {
  ConversationID: string
  OriginatorConversationID: string
  ResponseCode: string
  ResponseDescription: string
}

// B2C Callback Data
export interface B2CCallbackData {
  Result: {
    ResultType: number
    ResultCode: number
    ResultDesc: string
    OriginatorConversationID: string
    ConversationID: string
    TransactionID: string
    ResultParameters?: {
      ResultParameter: Array<{
        Key: string
        Value: string | number
      }>
    }
    ReferenceData?: {
      ReferenceItem: {
        Key: string
        Value: string
      }
    }
  }
}

// Parsed B2C Result
export interface ParsedB2CResult {
  conversationId: string
  originatorConversationId: string
  transactionId: string
  resultCode: number
  resultDesc: string
  success: boolean
  amount?: number
  receiptNumber?: string
  recipientName?: string
  completedAt?: string
  chargesPaidAccountFunds?: number
  utilityAccountFunds?: number
  workingAccountFunds?: number
}

/**
 * Get B2C configuration from environment variables
 */
export function getB2CConfig(): B2CConfig {
  return {
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    shortCode: process.env.MPESA_B2C_SHORTCODE || '',
    initiatorName: process.env.MPESA_B2C_INITIATOR_NAME || '',
    securityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL || '',
    resultUrl: process.env.MPESA_B2C_RESULT_URL || '',
    timeoutUrl: process.env.MPESA_B2C_TIMEOUT_URL || '',
    environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  }
}

/**
 * Validate B2C configuration
 */
export function validateB2CConfig(config: B2CConfig): { valid: boolean; missing: string[] } {
  const required = [
    'consumerKey',
    'consumerSecret', 
    'shortCode',
    'initiatorName',
    'securityCredential',
    'resultUrl',
    'timeoutUrl',
  ] as const
  
  const missing = required.filter((key) => !config[key])
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Check if B2C payouts are enabled
 */
export function isB2CEnabled(): boolean {
  return process.env.ENABLE_B2C_PAYOUTS === 'true'
}

/**
 * Generate a unique originator conversation ID for tracking
 */
function generateOriginatorId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `AL-${timestamp}-${random}` // AL = ArtisanLink
}

/**
 * Initiate B2C payment to artisan
 */
export async function initiateB2C(
  config: B2CConfig,
  request: B2CRequest
): Promise<B2CResponse & { originatorId: string }> {
  const urls = B2C_URLS[config.environment]
  
  // Format and validate phone number
  const phoneNumber = formatPhoneNumber(request.phoneNumber)
  if (!isValidKenyanPhone(phoneNumber)) {
    throw new Error('Invalid Kenyan phone number')
  }

  // Validate amount (M-Pesa minimum is KES 10)
  if (request.amount < 10) {
    throw new Error('Minimum payout amount is KES 10')
  }

  // Validate amount (M-Pesa maximum for B2C is typically KES 70,000)
  if (request.amount > 70000) {
    throw new Error('Maximum single payout amount is KES 70,000')
  }

  // Use the pre-encrypted security credential from Daraja portal
  // This credential is already encrypted using Safaricom's certificate
  const securityCredential = config.securityCredential

  if (!securityCredential) {
    throw new Error(
      'B2C security credential not configured. ' +
      'Generate it from https://developer.safaricom.co.ke/dashboard/testcredentials'
    )
  }

  // Get access token using the shared function
  const mpesaConfig: MpesaConfig = {
    ...getMpesaConfig(),
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    environment: config.environment,
  }
  const accessToken = await getMpesaAccessToken(mpesaConfig)

  // Generate unique originator ID for tracking
  const originatorId = generateOriginatorId()

  const payload = {
    InitiatorName: config.initiatorName,
    SecurityCredential: securityCredential,
    CommandID: request.commandId || 'BusinessPayment',
    Amount: Math.round(request.amount).toString(), // M-Pesa requires string
    PartyA: config.shortCode,
    PartyB: phoneNumber,
    Remarks: request.remarks.substring(0, 100), // Max 100 chars
    QueueTimeOutURL: config.timeoutUrl,
    ResultURL: config.resultUrl,
    Occassion: (request.occasion || '').substring(0, 100), // Max 100 chars, note: M-Pesa uses "Occassion" (typo)
  }

  try {
    logger.info('Initiating B2C payment', {
      phoneNumber: phoneNumber.substring(0, 6) + '****',
      amount: request.amount,
      originatorId,
      commandId: payload.CommandID,
    })

    const response = await fetch(urls.b2c, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok || data.ResponseCode !== '0') {
      logger.error('B2C payment failed', { response: data })
      throw new Error(
        data.ResponseDescription || 
        data.errorMessage || 
        data.errorCode ||
        'B2C payment failed'
      )
    }

    logger.info('B2C payment initiated successfully', {
      conversationId: data.ConversationID,
      originatorId,
    })

    return {
      ...data as B2CResponse,
      originatorId,
    }
  } catch (error) {
    logger.error('B2C payment error', error)
    throw error
  }
}

/**
 * Parse B2C callback data
 */
export function parseB2CCallback(data: B2CCallbackData): ParsedB2CResult {
  const result = data.Result
  
  const parsed: ParsedB2CResult = {
    conversationId: result.ConversationID,
    originatorConversationId: result.OriginatorConversationID,
    transactionId: result.TransactionID,
    resultCode: result.ResultCode,
    resultDesc: result.ResultDesc,
    success: result.ResultCode === 0,
  }

  // Extract result parameters if payment was successful
  if (result.ResultCode === 0 && result.ResultParameters?.ResultParameter) {
    for (const param of result.ResultParameters.ResultParameter) {
      switch (param.Key) {
        case 'TransactionAmount':
          parsed.amount = param.Value as number
          break
        case 'TransactionReceipt':
          parsed.receiptNumber = param.Value as string
          break
        case 'ReceiverPartyPublicName':
          parsed.recipientName = param.Value as string
          break
        case 'TransactionCompletedDateTime':
          parsed.completedAt = param.Value as string
          break
        case 'B2CChargesPaidAccountAvailableFunds':
          parsed.chargesPaidAccountFunds = param.Value as number
          break
        case 'B2CUtilityAccountAvailableFunds':
          parsed.utilityAccountFunds = param.Value as number
          break
        case 'B2CWorkingAccountAvailableFunds':
          parsed.workingAccountFunds = param.Value as number
          break
      }
    }
  }

  return parsed
}

/**
 * Get human-readable description for B2C result codes
 */
export function getB2CResultDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Success',
    1: 'Insufficient funds in B2C account',
    2: 'Less than minimum transaction value',
    3: 'More than maximum transaction value',
    4: 'Would exceed daily transfer limit',
    5: 'Would exceed minimum balance',
    6: 'Unresolved primary party',
    7: 'Unresolved receiver party',
    8: 'Would exceed maximum balance',
    11: 'Debit account invalid',
    12: 'Credit account invalid',
    13: 'Unresolved debit account',
    14: 'Unresolved credit account',
    15: 'Duplicate detected',
    17: 'System internal error',
    20: 'Unresolved initiator',
    26: 'Traffic blocking condition in place',
  }
  
  return descriptions[code] || `Unknown error (code: ${code})`
}

/**
 * Calculate exponential backoff delay for retries
 * Returns delay in milliseconds
 */
export function calculateRetryDelay(retryCount: number): number {
  // Retry delays: 5 minutes, 30 minutes, 2 hours
  const delays = [
    5 * 60 * 1000,      // 5 minutes
    30 * 60 * 1000,     // 30 minutes
    2 * 60 * 60 * 1000, // 2 hours
  ]
  
  return delays[Math.min(retryCount, delays.length - 1)]
}

/**
 * Get next retry time based on retry count
 */
export function getNextRetryTime(retryCount: number): Date {
  const delay = calculateRetryDelay(retryCount)
  return new Date(Date.now() + delay)
}

/**
 * Check if a payout should be retried
 */
export function shouldRetryPayout(retryCount: number, maxRetries: number = 3): boolean {
  return retryCount < maxRetries
}

// Export types
export type { MpesaConfig }
