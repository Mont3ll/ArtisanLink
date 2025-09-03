import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

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
        siteName: 'ArtisanLink',
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
  } finally {
    await prisma.$disconnect()
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

    const body = await request.json()
    const { category, settings } = body

    // In a real application, you would save these settings to the database
    // For now, we'll just simulate a successful update
    
    return NextResponse.json({ 
      success: true, 
      message: `${category} settings updated successfully`,
      settings 
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
