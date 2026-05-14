/**
 * M-Pesa B2C Result Callback
 * 
 * DISABLED: Artisan payouts via M-Pesa B2C are disabled for the initial testing phase.
 * All payments are cash-only between client and artisan.
 */

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'B2C payouts are disabled. Cash-only mode active.', code: 'CASH_ONLY_MODE' },
    { status: 503 }
  )
}
