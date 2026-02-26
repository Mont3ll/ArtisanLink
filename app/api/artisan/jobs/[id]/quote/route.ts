/**
 * Artisan Quote API
 *
 * POST /api/artisan/jobs/[id]/quote - Create or update a quote for a job
 * GET /api/artisan/jobs/[id]/quote - Get all quotes for a job
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/app/generated/prisma'
import { createLogger } from '@/lib/logger'
import { DEPOSIT_CONFIG, calculateMaxDeposit } from '@/lib/constants/quote-categories'

const logger = createLogger('api:artisan:jobs:quote')

interface RouteParams {
  params: Promise<{ id: string }>
}

// Line item input type
interface LineItemInput {
  category: string
  name: string
  description?: string
  quantity: number
  unit?: string
  unitPrice: number
  total: number
}

// Quote line item from DB
interface QuoteLineItemDB {
  id: string
  category: string
  name: string
  description: string | null
  quantity: number
  unit: string | null
  unitPrice: number
  total: number
  isSystemGenerated: boolean
  sortOrder: number
  createdAt: Date
}

// Define quote with line items type for GET endpoint
interface QuoteWithLineItems {
  id: string
  jobId: string
  amount: number
  description: string
  estimatedDuration: string | null
  paymentTerms: string | null
  requestedDepositPercent: number | null
  validUntil: Date | null
  round: number
  status: string
  isDraft: boolean
  sentAt: Date | null
  clientResponse: string | null
  createdAt: Date
  updatedAt: Date
  lineItems: QuoteLineItemDB[]
}

/**
 * POST /api/artisan/jobs/[id]/quote
 * Create a quote for a job request with itemized line items
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await params

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true, firstName: true, lastName: true, profile: { select: { artisanStatus: true } } },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Only artisans can create quotes' }, { status: 403 })
    }

    if (user.profile?.artisanStatus !== 'VERIFIED') {
      return NextResponse.json({ error: 'Only verified artisans can create quotes' }, { status: 403 })
    }

    // Get job with existing quotes
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.artisanId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if job is in a valid state for quoting
    const latestQuote = job.quotes[0]
    
    // Determine the quote round
    let round = 1
    if (latestQuote) {
      if (latestQuote.status === 'REVISION_REQUESTED' && latestQuote.round === 1) {
        // Client requested revision, this is round 2
        round = 2
      } else if (latestQuote.status === 'SENT') {
        return NextResponse.json({
          error: 'You already have a pending quote. Wait for client response.',
        }, { status: 400 })
      } else if (latestQuote.round === 2) {
        return NextResponse.json({
          error: 'Maximum quote rounds (2) reached for this job.',
        }, { status: 400 })
      }
    }

    // Only allow quotes for REQUESTED or QUOTED (revision) status
    if (job.status !== 'REQUESTED' && job.status !== 'QUOTED') {
      return NextResponse.json({
        error: 'Cannot create quote for job in current status',
      }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const {
      amount,
      description,
      lineItems,
      requestedDepositPercent,
      estimatedDuration,
      paymentTerms,
      validDays = 7, // Default validity period
    } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Quote description is required' }, { status: 400 })
    }

    // Validate line items
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json({ 
        error: 'At least one line item is required for transparency' 
      }, { status: 400 })
    }

    // Validate each line item
    for (const item of lineItems as LineItemInput[]) {
      if (!item.category || !item.name || typeof item.quantity !== 'number' || 
          typeof item.unitPrice !== 'number' || typeof item.total !== 'number') {
        return NextResponse.json({ 
          error: 'Each line item must have category, name, quantity, unitPrice, and total' 
        }, { status: 400 })
      }
      if (item.quantity <= 0) {
        return NextResponse.json({ 
          error: 'Line item quantity must be greater than 0' 
        }, { status: 400 })
      }
    }

    // Calculate subtotal from line items
    const subtotal = (lineItems as LineItemInput[]).reduce((sum, item) => sum + item.total, 0)
    
    // Calculate materials cost for deposit validation
    const materialsCost = (lineItems as LineItemInput[])
      .filter(item => item.category === 'MATERIALS')
      .reduce((sum, item) => sum + item.total, 0)

    // Calculate max allowed deposit based on materials
    const maxAllowedDeposit = calculateMaxDeposit(materialsCost, parseFloat(amount))

    // Validate requested deposit percent if provided
    if (requestedDepositPercent !== undefined) {
      if (requestedDepositPercent < DEPOSIT_CONFIG.MIN_PERCENT) {
        return NextResponse.json({ 
          error: `Deposit cannot be less than ${DEPOSIT_CONFIG.MIN_PERCENT}%` 
        }, { status: 400 })
      }
      if (requestedDepositPercent > maxAllowedDeposit) {
        return NextResponse.json({ 
          error: `Deposit cannot exceed ${maxAllowedDeposit}% for this quote. Materials cost must be at least KES ${DEPOSIT_CONFIG.MIN_MATERIAL_VALUE_FOR_HIGHER_DEPOSIT.toLocaleString()} and ${DEPOSIT_CONFIG.MATERIAL_HEAVY_THRESHOLD_PERCENT}% of total for higher deposits.` 
        }, { status: 400 })
      }
    }

    // Prepare line items for creation, handling adjustment if needed
    const lineItemsToCreate: Array<{
      category: string
      name: string
      description: string | null
      quantity: number
      unit: string | null
      unitPrice: number
      total: number
      isSystemGenerated: boolean
      sortOrder: number
    }> = (lineItems as LineItemInput[]).map((item, index) => ({
      category: item.category,
      name: item.name,
      description: item.description || null,
      quantity: item.quantity,
      unit: item.unit || null,
      unitPrice: item.unitPrice,
      total: item.total,
      isSystemGenerated: false,
      sortOrder: index,
    }))

    // Calculate difference between amount and subtotal
    const difference = parseFloat(amount) - subtotal

    // Auto-add adjustment line item if difference >= threshold
    if (Math.abs(difference) >= DEPOSIT_CONFIG.ADJUSTMENT_THRESHOLD) {
      if (difference > 0) {
        // Amount is higher than subtotal - add Miscellaneous
        lineItemsToCreate.push({
          category: 'MISCELLANEOUS',
          name: 'Miscellaneous',
          description: 'Additional costs',
          quantity: 1,
          unit: null,
          unitPrice: difference,
          total: difference,
          isSystemGenerated: true,
          sortOrder: lineItemsToCreate.length,
        })
      } else {
        // Amount is lower than subtotal - add Discount
        lineItemsToCreate.push({
          category: 'DISCOUNT',
          name: 'Discount',
          description: 'Price reduction applied',
          quantity: 1,
          unit: null,
          unitPrice: difference, // negative
          total: difference,     // negative
          isSystemGenerated: true,
          sortOrder: lineItemsToCreate.length,
        })
      }
    }

    // Calculate valid until date
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + validDays)

    // Create the quote with line items in a transaction
    const quote = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the quote
      const newQuote = await tx.quote.create({
        data: {
          jobId,
          amount: parseFloat(amount),
          description: description.trim(),
          estimatedDuration: estimatedDuration?.trim() || null,
          paymentTerms: paymentTerms?.trim() || null,
          requestedDepositPercent: requestedDepositPercent || null,
          validUntil,
          round,
          status: 'SENT',
          isDraft: false,
          sentAt: new Date(),
        },
      })

      // Create line items
      await tx.quoteLineItem.createMany({
        data: lineItemsToCreate.map(item => ({
          ...item,
          quoteId: newQuote.id,
        })),
      })

      // Fetch the complete quote with line items
      return tx.quote.findUnique({
        where: { id: newQuote.id },
        include: {
          lineItems: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      })
    })

    if (!quote) {
      throw new Error('Failed to create quote')
    }

    // Update job status to QUOTED
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'QUOTED' },
    })

    // Create notification for client
    await prisma.notification.create({
      data: {
        userId: job.clientId,
        type: 'JOB',
        title: round === 1 ? 'New Quote Received' : 'Revised Quote Received',
        message: `${user.firstName} ${user.lastName} has sent ${round === 1 ? 'a' : 'a revised'} quote for "${job.title}".`,
        data: { jobId, quoteId: quote.id, amount: quote.amount },
        linkUrl: `/client-dashboard/jobs/${jobId}`,
      },
    })

    logger.info(`Quote created: ${quote.id}`, { 
      jobId, 
      artisanId: user.id, 
      round,
      amount: quote.amount,
      lineItemsCount: quote.lineItems.length,
      requestedDepositPercent: quote.requestedDepositPercent,
    })

    return NextResponse.json({
      message: 'Quote sent successfully',
      quote: {
        id: quote.id,
        amount: quote.amount,
        description: quote.description,
        estimatedDuration: quote.estimatedDuration,
        paymentTerms: quote.paymentTerms,
        requestedDepositPercent: quote.requestedDepositPercent,
        validUntil: quote.validUntil,
        round: quote.round,
        status: quote.status,
        lineItems: quote.lineItems.map((item: QuoteLineItemDB) => ({
          id: item.id,
          category: item.category,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.total,
          isSystemGenerated: item.isSystemGenerated,
          sortOrder: item.sortOrder,
        })),
        createdAt: quote.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/artisan/jobs/[id]/quote
 * Get all quotes for a job with line items
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await params

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Only artisans can access this endpoint' }, { status: 403 })
    }

    // Get job to verify ownership
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { artisanId: true },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.artisanId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get quotes with line items
    const quotes = await prisma.quote.findMany({
      where: { jobId },
      include: {
        lineItems: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ 
      quotes: quotes.map((quote: QuoteWithLineItems) => ({
        ...quote,
        lineItems: quote.lineItems.map((item: QuoteLineItemDB) => ({
          id: item.id,
          category: item.category,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.total,
          isSystemGenerated: item.isSystemGenerated,
          sortOrder: item.sortOrder,
          createdAt: item.createdAt,
        })),
      })),
    })
  } catch (error) {
    logger.error('Failed to fetch quotes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
