/**
 * M-Pesa B2C Timeout Callback
 * 
 * DISABLED: Artisan payouts via M-Pesa B2C are disabled for the initial testing phase.
 */

import { NextResponse } from 'next/server'

export async function POST(_request?: Request) {
  return NextResponse.json(
    { error: 'B2C payouts are disabled. Cash-only mode active.', code: 'CASH_ONLY_MODE' },
    { status: 503 }
  )
}
