import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still compare to maintain constant time, but result will be false
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(a) // Compare against itself to maintain timing
    timingSafeEqual(bufA, bufB)
    return false
  }
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return timingSafeEqual(bufA, bufB)
}

/**
 * POST /api/user/promote-admin
 * 
 * Promotes a user to ADMIN role.
 * 
 * Security: Requires one of:
 * 1. An existing ADMIN to perform the promotion (for production)
 * 2. A secret key for initial setup (development/bootstrapping only)
 * 
 * Body:
 * - targetUserId?: string - User ID to promote (required if current user is admin)
 * - secretKey?: string - Admin promotion secret (for bootstrapping first admin)
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Parse request body
    let body: { targetUserId?: string; secretKey?: string } = {}
    try {
      body = await request.json()
    } catch {
      // Empty body is allowed for self-promotion with secret key
    }

    const { targetUserId, secretKey } = body

    // Get the requesting user
    const requestingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true, email: true }
    })

    if (!requestingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Path 1: Existing admin promoting another user
    if (requestingUser.role === 'ADMIN') {
      if (!targetUserId) {
        return NextResponse.json(
          { error: 'Target user ID required when promoting as admin' },
          { status: 400 }
        )
      }

      // Prevent demoting yourself accidentally
      if (targetUserId === requestingUser.id) {
        return NextResponse.json(
          { error: 'Cannot modify your own admin status through this endpoint' },
          { status: 400 }
        )
      }

      // Update target user role to ADMIN
      const user = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: 'ADMIN' },
        include: { profile: true }
      })

      return NextResponse.json({
        success: true,
        message: 'User promoted to admin',
        promotedBy: requestingUser.email,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      })
    }

    // Path 2: Bootstrap first admin with secret key
    const ADMIN_PROMOTION_SECRET = process.env.ADMIN_PROMOTION_SECRET

    if (!ADMIN_PROMOTION_SECRET) {
      // No secret configured = admin promotion via secret is disabled
      return NextResponse.json(
        { error: 'Forbidden: Only admins can promote users' },
        { status: 403 }
      )
    }

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access or secret key required' },
        { status: 403 }
      )
    }

    // Validate secret key using timing-safe comparison
    if (!safeCompare(secretKey, ADMIN_PROMOTION_SECRET)) {
      // Log failed attempt for security monitoring
      console.warn(`[SECURITY] Failed admin promotion attempt by user ${requestingUser.id}`)
      return NextResponse.json(
        { error: 'Forbidden: Invalid secret key' },
        { status: 403 }
      )
    }

    // Check if there are already admins (only allow secret key for first admin)
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })

    if (adminCount > 0) {
      return NextResponse.json(
        { error: 'Forbidden: Admins already exist. Use admin panel to promote users.' },
        { status: 403 }
      )
    }

    // Promote self to admin (first admin bootstrap)
    const user = await prisma.user.update({
      where: { id: requestingUser.id },
      data: { role: 'ADMIN' },
      include: { profile: true }
    })

    console.log(`[SECURITY] First admin created: ${user.email} (${user.id})`)

    return NextResponse.json({
      success: true,
      message: 'User promoted to admin (first admin bootstrap)',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    return NextResponse.json(
      { error: 'Failed to promote user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
