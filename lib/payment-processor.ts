/**
 * Payment Processor for ArtisanLink
 * 
 * This module handles the business logic for processing job payments,
 * calculating commissions, and creating payout records for artisans.
 * 
 * Payment Flow:
 * 1. Client pays deposit (STK Push) → Platform receives 100%
 *    - 80% → ArtisanPayout record (PENDING) → Hourly cron → B2C to artisan
 *    - 20% → Job.heldAmount (escrow until job completion)
 * 
 * 2. Client pays final (STK Push) → Platform receives 100%
 *    - Calculate: final + heldAmount - commission = artisan payout
 *    - ArtisanPayout record → Hourly cron → B2C to artisan
 *    - PlatformEarning record (commission)
 * 
 * Commission Rates:
 * - Standard: 10% of total job price
 * - Promotional: 5% for first 5 jobs per artisan
 * - Subscriber: 5% always (active subscription benefit)
 */

import { createLogger } from '@/lib/logger'
import { isB2CEnabled } from '@/lib/mpesa/b2c'
import type { Prisma } from '@/app/generated/prisma'

const logger = createLogger('lib/payment-processor')

// Configuration (can be overridden by environment variables)
const config = {
  // Commission rates
  standardCommissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.10'),
  promotionalCommissionRate: parseFloat(process.env.PROMOTIONAL_COMMISSION_RATE || '0.05'),
  promotionalJobThreshold: parseInt(process.env.PROMOTIONAL_JOB_COUNT || '5', 10),
  
  // Deposit split
  artisanDepositShare: parseFloat(process.env.ARTISAN_DEPOSIT_SHARE || '0.80'),
  
  // Payout settings
  minimumPayoutAmount: parseFloat(process.env.MINIMUM_PAYOUT_AMOUNT || '10'),
  maxPayoutRetries: parseInt(process.env.PAYOUT_MAX_RETRIES || '3', 10),
}

export interface PaymentProcessingResult {
  success: boolean
  payoutId?: string
  earningId?: string
  message: string
  details?: {
    grossAmount: number
    commission: number
    netAmount: number
    heldAmount?: number
    commissionRate: number
    isPromotional: boolean
  }
}

export interface ProcessDepositParams {
  jobId: string
  jobPaymentId: string
  depositAmount: number
  artisanId: string
  artisanPhone: string
  artisanCompletedJobs: number
}

export interface ProcessFinalPaymentParams {
  jobId: string
  jobPaymentId: string
  finalAmount: number
  heldAmount: number
  artisanId: string
  artisanPhone: string
  artisanCompletedJobs: number
  totalJobPrice: number
  hasActiveSubscription?: boolean
}

/**
 * Calculate commission rate based on artisan's completed job count and subscription status.
 * Subscribers always get the promotional 5% rate regardless of job count.
 */
export function calculateCommissionRate(completedJobCount: number, hasActiveSubscription = false): {
  rate: number
  isPromotional: boolean
} {
  const isPromotional = hasActiveSubscription || completedJobCount < config.promotionalJobThreshold
  return {
    rate: isPromotional ? config.promotionalCommissionRate : config.standardCommissionRate,
    isPromotional,
  }
}

/**
 * Calculate deposit split
 * - Artisan receives X% immediately (default 80%)
 * - Remaining is held as escrow
 */
export function calculateDepositSplit(depositAmount: number): {
  artisanShare: number
  heldAmount: number
} {
  const artisanShare = Math.round(depositAmount * config.artisanDepositShare * 100) / 100
  const heldAmount = Math.round((depositAmount - artisanShare) * 100) / 100
  
  return { artisanShare, heldAmount }
}

/**
 * Calculate final payment distribution
 * - Commission is calculated on total job price
 * - Artisan receives: final payment + held amount - commission
 */
export function calculateFinalPaymentDistribution(
  finalAmount: number,
  heldAmount: number,
  totalJobPrice: number,
  commissionRate: number
): {
  commission: number
  artisanPayout: number
} {
  // Commission is on total job price, not just final payment
  const commission = Math.round(totalJobPrice * commissionRate * 100) / 100
  
  // Artisan receives: final payment + held escrow - commission
  const artisanPayout = Math.round((finalAmount + heldAmount - commission) * 100) / 100
  
  return { commission, artisanPayout }
}

/**
 * Process a deposit payment
 * Creates an ArtisanPayout record for the artisan's share
 * Updates Job with held amount
 * 
 * @param tx - Prisma transaction client
 * @param params - Deposit payment parameters
 */
export async function processDepositPayment(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  params: ProcessDepositParams
): Promise<PaymentProcessingResult> {
  const { jobId, depositAmount, artisanId, artisanPhone } = params

  try {
    // Check if B2C payouts are enabled
    if (!isB2CEnabled()) {
      logger.info('B2C payouts disabled, skipping payout creation', { jobId })
      return {
        success: true,
        message: 'Payment processed (B2C payouts disabled)',
      }
    }

    // Calculate deposit split
    const { artisanShare, heldAmount } = calculateDepositSplit(depositAmount)

    logger.info('Processing deposit payment', {
      jobId,
      depositAmount,
      artisanShare,
      heldAmount,
    })

    // Check minimum payout amount
    if (artisanShare < config.minimumPayoutAmount) {
      logger.warn('Artisan share below minimum payout', {
        artisanShare,
        minimum: config.minimumPayoutAmount,
      })
      // Still hold the amount, but don't create payout yet
      await tx.job.update({
        where: { id: jobId },
        data: {
          heldAmount: { increment: depositAmount }, // Hold entire amount for now
        },
      })

      return {
        success: true,
        message: `Deposit amount below minimum payout (KES ${config.minimumPayoutAmount}). Full amount held for later.`,
        details: {
          grossAmount: depositAmount,
          commission: 0,
          netAmount: 0,
          heldAmount: depositAmount,
          commissionRate: 0,
          isPromotional: false,
        },
      }
    }

    // Create payout record for artisan
    const payout = await tx.artisanPayout.create({
      data: {
        artisanId,
        jobId,
        type: 'DEPOSIT_SHARE',
        grossAmount: artisanShare,
        commission: 0, // No commission on deposit share
        netAmount: artisanShare,
        phoneNumber: artisanPhone,
        status: 'PENDING',
        maxRetries: config.maxPayoutRetries,
      },
    })

    // Update job with held amount
    await tx.job.update({
      where: { id: jobId },
      data: {
        heldAmount,
      },
    })

    logger.info('Deposit payment processed', {
      jobId,
      payoutId: payout.id,
      artisanShare,
      heldAmount,
    })

    return {
      success: true,
      payoutId: payout.id,
      message: 'Deposit payment processed successfully',
      details: {
        grossAmount: depositAmount,
        commission: 0,
        netAmount: artisanShare,
        heldAmount,
        commissionRate: 0,
        isPromotional: false,
      },
    }
  } catch (error) {
    logger.error('Failed to process deposit payment', error as Error, { jobId })
    throw error
  }
}

/**
 * Process a final payment
 * Creates an ArtisanPayout record for artisan's share (after commission)
 * Creates a PlatformEarning record for commission
 * Releases held amount
 * 
 * @param tx - Prisma transaction client
 * @param params - Final payment parameters
 */
export async function processFinalPayment(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  params: ProcessFinalPaymentParams
): Promise<PaymentProcessingResult> {
  const {
    jobId,
    jobPaymentId,
    finalAmount,
    heldAmount,
    artisanId,
    artisanPhone,
    artisanCompletedJobs,
    totalJobPrice,
    hasActiveSubscription,
  } = params

  try {
    // Check if B2C payouts are enabled
    if (!isB2CEnabled()) {
      logger.info('B2C payouts disabled, skipping payout creation', { jobId })
      return {
        success: true,
        message: 'Payment processed (B2C payouts disabled)',
      }
    }

    // Calculate commission rate
    const { rate: commissionRate, isPromotional } = calculateCommissionRate(artisanCompletedJobs, hasActiveSubscription)

    // Calculate distribution
    const { commission, artisanPayout } = calculateFinalPaymentDistribution(
      finalAmount,
      heldAmount,
      totalJobPrice,
      commissionRate
    )

    logger.info('Processing final payment', {
      jobId,
      finalAmount,
      heldAmount,
      totalJobPrice,
      commissionRate,
      commission,
      artisanPayout,
      isPromotional,
    })

    // Check minimum payout amount
    if (artisanPayout < config.minimumPayoutAmount) {
      logger.warn('Final payout below minimum', {
        artisanPayout,
        minimum: config.minimumPayoutAmount,
      })
      // Still record the earning but create a smaller payout or adjust
    }

    // Create payout record for artisan
    const payout = await tx.artisanPayout.create({
      data: {
        artisanId,
        jobId,
        type: 'FINAL_PAYMENT',
        grossAmount: finalAmount + heldAmount,
        commission,
        netAmount: artisanPayout,
        phoneNumber: artisanPhone,
        status: 'PENDING',
        maxRetries: config.maxPayoutRetries,
      },
    })

    // Create platform earning record
    const earning = await tx.platformEarning.create({
      data: {
        jobId,
        artisanId,
        jobValue: totalJobPrice,
        commissionRate,
        commissionAmount: commission,
        isPromotional,
        paymentType: 'FINAL',
      },
    })

    // Update job to release held amount
    await tx.job.update({
      where: { id: jobId },
      data: {
        heldReleasedAt: new Date(),
      },
    })

    logger.info('Final payment processed', {
      jobId,
      payoutId: payout.id,
      earningId: earning.id,
      commission,
      artisanPayout,
      isPromotional,
    })

    return {
      success: true,
      payoutId: payout.id,
      earningId: earning.id,
      message: 'Final payment processed successfully',
      details: {
        grossAmount: finalAmount + heldAmount,
        commission,
        netAmount: artisanPayout,
        commissionRate,
        isPromotional,
      },
    }
  } catch (error) {
    logger.error('Failed to process final payment', error as Error, { jobId })
    throw error
  }
}

/**
 * Get artisan's phone number for payouts
 * Fetches from user profile
 */
export async function getArtisanPayoutPhone(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  artisanId: string
): Promise<string | null> {
  const artisan = await prisma.user.findUnique({
    where: { id: artisanId },
    select: { phone: true },
  })

  return artisan?.phone || null
}

/**
 * Get configuration for display/debugging
 */
export function getPaymentConfig() {
  return {
    ...config,
    b2cEnabled: isB2CEnabled(),
  }
}

/**
 * Validate payout can be created
 */
export function validatePayoutCreation(
  amount: number,
  phoneNumber: string | null
): { valid: boolean; error?: string } {
  if (!isB2CEnabled()) {
    return { valid: false, error: 'B2C payouts are not enabled' }
  }

  if (amount < config.minimumPayoutAmount) {
    return { 
      valid: false, 
      error: `Amount KES ${amount} is below minimum payout of KES ${config.minimumPayoutAmount}` 
    }
  }

  if (!phoneNumber) {
    return { valid: false, error: 'Artisan phone number not available' }
  }

  // Basic phone validation
  const phoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
    return { valid: false, error: 'Invalid phone number format' }
  }

  return { valid: true }
}

// Export config getter for testing
export { config as paymentConfig }
