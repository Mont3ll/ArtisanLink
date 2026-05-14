import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/artisan/payments/export')

/**
 * GET - Export payment history as CSV
 * 
 * Query params:
 * - status: Filter by payment status (optional)
 * - startDate: Filter from date (optional, ISO string)
 * - endDate: Filter to date (optional, ISO string)
 */
export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with profile and subscription
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        profile: {
          include: {
            subscription: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Only artisans can export payment history' }, { status: 403 })
    }

    if (!user.profile?.subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: Record<string, unknown> = {
      subscriptionId: user.profile.subscription.id,
    }

    if (status && ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(status)) {
      where.status = status
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate)
      }
    }

    // Get all payments (no pagination for export)
    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Generate CSV content
    const csvHeaders = [
      'Transaction Date',
      'Payment ID',
      'Amount (KES)',
      'Method',
      'Status',
      'Description',
      'M-Pesa Receipt',
      'Phone Number',
      'Paid At',
      'Failure Reason',
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csvRows = payments.map((payment: any) => {
      const formatDate = (date: Date | null) => {
        if (!date) return ''
        return new Date(date).toISOString().split('T')[0]
      }

      const formatDateTime = (date: Date | null) => {
        if (!date) return ''
        return new Date(date).toISOString().replace('T', ' ').split('.')[0]
      }

      // Escape CSV fields
      const escapeCSV = (value: string | null | undefined) => {
        if (value === null || value === undefined) return ''
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      return [
        formatDateTime(payment.createdAt),
        payment.id,
        payment.amount.toString(),
        payment.method,
        payment.status,
        escapeCSV(payment.description),
        payment.mpesaReceiptNumber || '',
        payment.phoneNumber ? payment.phoneNumber.substring(0, 6) + '****' : '',
        formatDateTime(payment.paidAt),
        escapeCSV(payment.failureReason),
      ].join(',')
    })

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `chapaworks-payments-${timestamp}.csv`

    logger.info('Payment export generated', {
      userId: user.id,
      paymentCount: payments.length,
    })

    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    logger.error('Failed to export payments', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
