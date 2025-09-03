import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function POST() {
  try {
    const { userId } = await auth()
    const clerkUser = await currentUser()
    
    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    })

    if (!user) {
      // Create user in database
      console.log('Creating new user in database:', clerkUser.emailAddresses[0]?.emailAddress)
      
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
          role: 'CLIENT', // Default role
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
          profile: {
            create: {
              bio: null,
              country: 'Kenya'
            }
          }
        },
        include: { profile: true }
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status
      }
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Failed to sync user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
