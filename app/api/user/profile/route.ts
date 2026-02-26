import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/user/profile
 * Updates the user's personal information (first name, last name, phone).
 * - First/last name are updated in both Clerk and the database.
 * - Phone is stored in the database only (avoids Clerk phone verification flow).
 */
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, phone } = body as {
      firstName?: string
      lastName?: string
      phone?: string
    }

    // Validate at least one field is provided
    if (firstName === undefined && lastName === undefined && phone === undefined) {
      return NextResponse.json(
        { error: 'At least one field (firstName, lastName, phone) is required' },
        { status: 400 }
      )
    }

    // Validate phone format if provided (Kenyan: +254...)
    if (phone !== undefined && phone !== '' && phone !== null) {
      const phoneRegex = /^\+254\d{9}$/
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { error: 'Phone number must be in the format +254XXXXXXXXX' },
          { status: 400 }
        )
      }
    }

    // Update Clerk user (first/last name only — phone is DB-only)
    if (firstName !== undefined || lastName !== undefined) {
      const clerk = await clerkClient()
      const clerkUpdate: Record<string, string> = {}
      if (firstName !== undefined) clerkUpdate.firstName = firstName.trim()
      if (lastName !== undefined) clerkUpdate.lastName = lastName.trim()
      await clerk.users.updateUser(userId, clerkUpdate)
    }

    // Update database
    const dbUpdate: Record<string, string | null> = {}
    if (firstName !== undefined) dbUpdate.firstName = firstName.trim()
    if (lastName !== undefined) dbUpdate.lastName = lastName.trim()
    if (phone !== undefined) dbUpdate.phone = phone.trim() || null

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: dbUpdate,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
