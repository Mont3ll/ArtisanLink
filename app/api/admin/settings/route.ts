import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Validation schemas for settings
const generalSettingsSchema = z.object({
  siteName: z.string().min(1).max(100),
  siteDescription: z.string().max(500),
  maintenanceMode: z.boolean(),
  registrationEnabled: z.boolean()
})

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  marketingEmails: z.boolean()
})

const securitySettingsSchema = z.object({
  twoFactorRequired: z.boolean(),
  passwordExpiry: z.number().int().min(0).max(365),
  sessionTimeout: z.number().int().min(5).max(1440),
  ipWhitelisting: z.boolean()
})

const featureSettingsSchema = z.object({
  projectBidding: z.boolean(),
  directMessaging: z.boolean(),
  fileUploads: z.boolean(),
  videoChat: z.boolean(),
  paymentProcessing: z.boolean()
})

// Combined schema for POST request
const updateSettingsSchema = z.object({
  category: z.enum(['general', 'notifications', 'security', 'features']),
  settings: z.union([
    generalSettingsSchema,
    notificationSettingsSchema,
    securitySettingsSchema,
    featureSettingsSchema
  ])
})

// Category-specific validation
const categorySchemas = {
  general: generalSettingsSchema,
  notifications: notificationSettingsSchema,
  security: securitySettingsSchema,
  features: featureSettingsSchema
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get platform settings (simulated for now)
    const settings = {
      general: {
        siteName: 'ChapaWorks',
        siteDescription: 'Connect with skilled artisans for your projects',
        maintenanceMode: false,
        registrationEnabled: true
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingEmails: true
      },
      security: {
        twoFactorRequired: false,
        passwordExpiry: 90,
        sessionTimeout: 30,
        ipWhitelisting: false
      },
      features: {
        projectBidding: true,
        directMessaging: true,
        fileUploads: true,
        videoChat: false,
        paymentProcessing: true
      }
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    // Validate basic structure
    const baseValidation = updateSettingsSchema.safeParse(body)
    if (!baseValidation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: baseValidation.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { category, settings } = baseValidation.data

    // Validate settings against category-specific schema
    const categorySchema = categorySchemas[category]
    const settingsValidation = categorySchema.safeParse(settings)
    
    if (!settingsValidation.success) {
      return NextResponse.json(
        { 
          error: `Invalid ${category} settings`,
          details: settingsValidation.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    // In a real application, you would save these settings to the database
    // For now, we'll just simulate a successful update
    
    return NextResponse.json({ 
      success: true, 
      message: `${category} settings updated successfully`,
      settings: settingsValidation.data
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
