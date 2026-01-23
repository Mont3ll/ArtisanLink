import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch a single artisan by user ID (for clients to view artisan details)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: artisanUserId } = await params

    // Find the artisan user with their profile
    const artisan = await prisma.user.findUnique({
      where: { 
        id: artisanUserId,
        role: 'ARTISAN',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: {
          select: {
            id: true,
            profession: true,
            profileImage: true,
            bio: true,
            city: true,
            county: true,
            experience: true,
            hourlyRate: true,
            isAvailable: true,
            artisanStatus: true,
            averageRating: true,
            totalReviews: true,
            specializations: {
              select: {
                name: true,
                skillLevel: true
              }
            }
          }
        }
      }
    })

    if (!artisan) {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })
    }

    // Only allow viewing verified or pending artisans (not rejected)
    if (artisan.profile?.artisanStatus === 'REJECTED') {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })
    }

    return NextResponse.json(artisan)
  } catch (error) {
    console.error('Error fetching artisan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
