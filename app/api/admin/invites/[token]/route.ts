/**
 * Admin Invite Token Management
 * 
 * GET    /api/admin/invites/[token] - Validate an invite token (public)
 * DELETE /api/admin/invites/[token] - Revoke an invite (admin only)
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/admin/invites/[token]')

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invite = await prisma.artisanInvite.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        expiresAt: true,
        message: true,
      },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found', valid: false }, { status: 404 })
    }

    if (invite.status === 'ACCEPTED') {
      return NextResponse.json({ error: 'This invite has already been used', valid: false }, { status: 410 })
    }

    if (invite.status === 'REVOKED') {
      return NextResponse.json({ error: 'This invite has been revoked', valid: false }, { status: 410 })
    }

    if (invite.status === 'EXPIRED' || invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This invite has expired', valid: false }, { status: 410 })
    }

    return NextResponse.json({
      valid: true,
      invite: {
        email: invite.email,
        name: invite.name,
        message: invite.message,
        expiresAt: invite.expiresAt,
      },
    })
  } catch (error) {
    logger.error('Failed to validate invite', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { token } = await params

    const invite = await prisma.artisanInvite.findUnique({ where: { token } })
    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    await prisma.artisanInvite.update({
      where: { token },
      data: { status: 'REVOKED' },
    })

    logger.info('Invite revoked', { token })

    return NextResponse.json({ message: 'Invite revoked successfully' })
  } catch (error) {
    logger.error('Failed to revoke invite', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
