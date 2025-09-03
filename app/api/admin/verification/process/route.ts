import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, email: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { artisanId, action, reason } = body

    if (!artisanId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Update artisan status
    const updatedProfile = await prisma.profile.update({
      where: { userId: artisanId },
      data: {
        artisanStatus: action === 'APPROVE' ? 'VERIFIED' : 'REJECTED',
        verifiedAt: action === 'APPROVE' ? new Date() : null,
        verifiedBy: action === 'APPROVE' ? userId : null
      }
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        adminId: userId,
        adminEmail: user.email || 'admin@artisanlink.ke',
        action: action === 'APPROVE' ? 'ARTISAN_VERIFIED' : 'ARTISAN_REJECTED',
        targetType: 'PROFILE',
        targetId: artisanId,
        description: action === 'REJECT' ? `Rejected: ${reason}` : 'Artisan verification approved'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Artisan ${action.toLowerCase()}d successfully`,
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Error processing verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
