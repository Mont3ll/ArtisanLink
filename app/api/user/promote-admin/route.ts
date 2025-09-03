import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Update user role to ADMIN
    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: { role: 'ADMIN' },
      include: { profile: true }
    })

    return NextResponse.json({
      success: true,
      message: 'User promoted to admin',
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
  } finally {
    await prisma.$disconnect()
  }
}
