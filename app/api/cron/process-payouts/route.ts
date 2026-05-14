/**
 * Batch Payout Processor Cron Job
 * 
 * DISABLED: Automated artisan payouts are disabled for the initial testing phase.
 * All payments are cash-only between client and artisan.
 */

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { 
      message: 'Payout processing is disabled. Cash-only mode active.',
      code: 'CASH_ONLY_MODE',
      processed: 0,
      failed: 0 
    },
    { status: 200 }
  )
}
