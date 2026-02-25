/**
 * Batch Payout Processor Cron Job
 * 
 * POST /api/cron/process-payouts - Process pending artisan payouts
 * 
 * This endpoint should be called periodically (e.g., hourly) by:
 * - Vercel Cron Jobs
 * - External cron service (e.g., cron-job.org)
 * - Internal scheduler
 * 
 * It processes pending payouts in batches, sending B2C payments to artisans.
 * 
 * Security:
 * - Requires CRON_SECRET header for authentication
 * - Rate limited by design (processes in batches)
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import {
  initiateB2C,
  getB2CConfig,
  validateB2CConfig,
  isB2CEnabled,
} from '@/lib/mpesa/b2c'

const logger = createLogger('api/cron/process-payouts')

// Configuration
const BATCH_SIZE = parseInt(process.env.PAYOUT_BATCH_SIZE || '10', 10)
const CRON_SECRET = process.env.CRON_SECRET

/**
 * Verify cron request is authenticated
 */
function verifyCronAuth(authHeader: string | null): boolean {
  if (!CRON_SECRET) {
    // If no secret configured, only allow in development
    return process.env.NODE_ENV === 'development'
  }
  return authHeader === `Bearer ${CRON_SECRET}`
}

/**
 * POST - Process pending payouts
 */
export async function POST(request: Request) {
  const startTime = Date.now()
  
  try {
    // Verify authentication
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    
    if (!verifyCronAuth(authHeader)) {
      logger.warn('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if B2C is enabled
    if (!isB2CEnabled()) {
      logger.info('B2C payouts are disabled')
      return NextResponse.json({
        success: true,
        message: 'B2C payouts are disabled',
        processed: 0,
      })
    }

    // Validate B2C configuration
    const b2cConfig = getB2CConfig()
    const configValidation = validateB2CConfig(b2cConfig)
    
    if (!configValidation.valid) {
      logger.error('Invalid B2C configuration', { missing: configValidation.missing })
      return NextResponse.json({
        success: false,
        error: 'B2C configuration incomplete',
        missing: configValidation.missing,
      }, { status: 500 })
    }

    // Get pending payouts that are ready to process
    const pendingPayouts = await prisma.artisanPayout.findMany({
      where: {
        status: 'PENDING',
        requiresManualReview: false,
        OR: [
          { nextRetryAt: null }, // Never attempted
          { nextRetryAt: { lte: new Date() } }, // Retry time has passed
        ],
      },
      take: BATCH_SIZE,
      orderBy: [
        { nextRetryAt: 'asc' }, // Process retries first
        { createdAt: 'asc' }, // Then oldest first
      ],
      include: {
        artisan: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (pendingPayouts.length === 0) {
      logger.info('No pending payouts to process')
      return NextResponse.json({
        success: true,
        message: 'No pending payouts',
        processed: 0,
        duration: Date.now() - startTime,
      })
    }

    logger.info(`Processing ${pendingPayouts.length} pending payouts`)

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as { payoutId: string; error: string }[],
    }

    // Process each payout
    for (const payout of pendingPayouts) {
      results.processed++

      try {
        // Mark as processing
        await prisma.artisanPayout.update({
          where: { id: payout.id },
          data: { status: 'PROCESSING', processedAt: new Date() },
        })

        // Initiate B2C payment
        const b2cResult = await initiateB2C(b2cConfig, {
          phoneNumber: payout.phoneNumber,
          amount: payout.netAmount,
          remarks: `ArtisanLink payout for job ${payout.job?.title || payout.jobId || 'N/A'}`.substring(0, 100),
          occasion: payout.type === 'DEPOSIT_SHARE' ? 'Deposit Share' : 'Job Payment',
        })

        // Update with M-Pesa conversation ID
        await prisma.artisanPayout.update({
          where: { id: payout.id },
          data: {
            mpesaConversationId: b2cResult.ConversationID,
            mpesaOriginatorId: b2cResult.originatorId,
          },
        })

        logger.info('B2C initiated for payout', {
          payoutId: payout.id,
          artisanId: payout.artisanId,
          amount: payout.netAmount,
          conversationId: b2cResult.ConversationID,
        })

        results.successful++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        logger.error('Failed to process payout', error as Error, {
          payoutId: payout.id,
        })

        // Update payout with error
        // Don't increment retry count here - that happens in the callback
        // Just reset to PENDING so it can be retried
        await prisma.artisanPayout.update({
          where: { id: payout.id },
          data: {
            status: 'PENDING',
            failureReason: `B2C initiation failed: ${errorMessage}`,
          },
        })

        results.failed++
        results.errors.push({ payoutId: payout.id, error: errorMessage })
      }
    }

    const duration = Date.now() - startTime

    logger.info('Payout batch processing completed', {
      ...results,
      duration,
    })

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} payouts`,
      ...results,
      duration,
    })
  } catch (error) {
    logger.error('Cron job failed', error as Error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

/**
 * GET - Get payout processing status
 */
export async function GET(request: Request) {
  try {
    // Verify authentication
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    
    if (!verifyCronAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get payout statistics
    const [
      pending,
      processing,
      completed,
      failed,
      requiresReview,
    ] = await Promise.all([
      prisma.artisanPayout.count({ where: { status: 'PENDING' } }),
      prisma.artisanPayout.count({ where: { status: 'PROCESSING' } }),
      prisma.artisanPayout.count({ where: { status: 'COMPLETED' } }),
      prisma.artisanPayout.count({ where: { status: 'FAILED' } }),
      prisma.artisanPayout.count({ where: { requiresManualReview: true } }),
    ])

    // Get recent payouts
    const recentPayouts = await prisma.artisanPayout.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        status: true,
        netAmount: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        retryCount: true,
        failureReason: true,
      },
    })

    return NextResponse.json({
      status: 'ok',
      b2cEnabled: isB2CEnabled(),
      statistics: {
        pending,
        processing,
        completed,
        failed,
        requiresReview,
        total: pending + processing + completed + failed,
      },
      recentPayouts,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Failed to get payout status', error as Error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
}
