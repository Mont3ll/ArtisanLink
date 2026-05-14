/**
 * Admin Artisan Invites API
 * 
 * GET  /api/admin/invites - List all invites
 * POST /api/admin/invites - Create and send a new invite
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'
import { sendInviteEmail } from '@/lib/email'

const logger = createLogger('api/admin/invites')

const createInviteSchema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  message: z.string().max(500).optional(),
})

async function requireAdmin() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true },
  })
  if (!user || user.role !== 'ADMIN') return null
  return user
}

export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Auto-expire overdue invites
    await prisma.artisanInvite.updateMany({
      where: { status: 'PENDING', expiresAt: { lt: now } },
      data: { status: 'EXPIRED' },
    })

    const invites = await prisma.artisanInvite.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ invites })
  } catch (error) {
    logger.error('Failed to list invites', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createInviteSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { email, name, phone, message } = validation.data

    // Check for existing active invite for this email
    const existing = await prisma.artisanInvite.findFirst({
      where: { email, status: 'PENDING', expiresAt: { gt: new Date() } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An active invite already exists for this email', existingInviteId: existing.id },
        { status: 409 }
      )
    }

    // Create invite (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invite = await prisma.artisanInvite.create({
      data: {
        email,
        name,
        phone,
        message,
        invitedBy: admin.id,
        expiresAt,
      },
    })

    // Send invite email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${appUrl}/sign-up?invite=${invite.token}&role=artisan`

    try {
      await sendInviteEmail({
        to: email,
        name: name || 'Artisan',
        inviteUrl,
        message,
        expiresAt,
      })
    } catch (emailError) {
      logger.error('Failed to send invite email', emailError)
      // Don't fail the invite creation if email fails
    }

    logger.info('Artisan invite created', { inviteId: invite.id, email, adminId: admin.id })

    return NextResponse.json({
      message: 'Invite created and sent successfully',
      invite: {
        id: invite.id,
        token: invite.token,
        email: invite.email,
        name: invite.name,
        status: invite.status,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
        inviteUrl,
      },
    })
  } catch (error) {
    logger.error('Failed to create invite', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
