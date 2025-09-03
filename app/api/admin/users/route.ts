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

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      include: {
        profile: true
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data
    const userData = await Promise.all(
      recentUsers.map(async (user) => {
        const portfolioCount = user.role === 'ARTISAN' && user.profile?.id ? 
          await prisma.portfolioItem.count({ where: { profileId: user.profile.id } }) : 0

        return {
          id: user.id,
          user: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role.toLowerCase(),
          status: user.profile?.artisanStatus?.toLowerCase() || user.status.toLowerCase(),
          location: user.profile?.city || 'Not specified',
          joinDate: user.createdAt.toISOString().split('T')[0],
          profession: user.profile?.profession || null,
          portfolioItems: portfolioCount
        }
      })
    )

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching recent users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
