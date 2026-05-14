/**
 * Job Payment Initiation API
 * 
 * DISABLED: Online payments for jobs are disabled for the initial testing phase.
 * All client-artisan payments are handled in cash only.
 * 
 * This route is preserved for future re-enablement.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Online job payments are currently disabled. All job payments are handled in cash directly between client and artisan.',
      code: 'CASH_ONLY_MODE'
    },
    { status: 503 }
  )
}

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Online job payments are currently disabled. All job payments are handled in cash directly between client and artisan.',
      code: 'CASH_ONLY_MODE'
    },
    { status: 503 }
  )
}
