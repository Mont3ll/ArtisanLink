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

    // Get pending artisan verifications
    const pendingArtisans = await prisma.user.findMany({
      where: {
        role: 'ARTISAN',
        profile: {
          artisanStatus: 'PENDING'
        }
      },
      include: {
        profile: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(pendingArtisans)
  } catch (error) {
    console.error('Error fetching pending verifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
