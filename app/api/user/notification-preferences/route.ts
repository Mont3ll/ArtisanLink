import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for notification preferences
const updatePreferencesSchema = z.object({
  // Notification channels
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),

  // Notification types
  messageNotifications: z.boolean().optional(),
  reviewNotifications: z.boolean().optional(),
  verificationNotifications: z.boolean().optional(),
  systemNotifications: z.boolean().optional(),
  promotionNotifications: z.boolean().optional(),
  bookingNotifications: z.boolean().optional(),

  // Quiet hours
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
}).strict()

// GET - Get notification preferences for authenticated user
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { notificationPreferences: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return existing preferences or default values
    if (user.notificationPreferences) {
      return NextResponse.json({ preferences: user.notificationPreferences })
    }

    // Return default preferences if none exist
    return NextResponse.json({
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        messageNotifications: true,
        reviewNotifications: true,
        verificationNotifications: true,
        systemNotifications: true,
        promotionNotifications: false,
        bookingNotifications: true,
        quietHoursEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
      }
    })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update notification preferences
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = updatePreferencesSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Validate quiet hours if enabled
    if (data.quietHoursEnabled && (!data.quietHoursStart || !data.quietHoursEnd)) {
      // Check if existing preferences have quiet hours set
      const existing = await prisma.notificationPreferences.findUnique({
        where: { userId: user.id }
      })
      
      if (!existing?.quietHoursStart || !existing?.quietHoursEnd) {
        return NextResponse.json(
          { error: 'Quiet hours start and end times are required when quiet hours are enabled' },
          { status: 400 }
        )
      }
    }

    // Upsert notification preferences
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...data,
      },
      update: data,
    })

    return NextResponse.json({
      message: 'Notification preferences updated successfully',
      preferences
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create notification preferences (alternative to PATCH for initial setup)
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { notificationPreferences: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if preferences already exist
    if (user.notificationPreferences) {
      return NextResponse.json(
        { error: 'Notification preferences already exist. Use PATCH to update.' },
        { status: 409 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = updatePreferencesSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create notification preferences
    const preferences = await prisma.notificationPreferences.create({
      data: {
        userId: user.id,
        ...data,
      }
    })

    return NextResponse.json({
      message: 'Notification preferences created successfully',
      preferences
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
