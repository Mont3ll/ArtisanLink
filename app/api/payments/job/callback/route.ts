/**
 * Job Payment Callback API
 * 
 * DISABLED: Online payments for jobs are disabled for the initial testing phase.
 */

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Job payment callbacks are disabled. Cash-only mode active.', code: 'CASH_ONLY_MODE' },
    { status: 503 }
  )
}
