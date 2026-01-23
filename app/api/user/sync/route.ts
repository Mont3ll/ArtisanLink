import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/app/generated/prisma'

// Map Clerk role (lowercase) to database role (uppercase enum)
function mapClerkRoleToDbRole(clerkRole: string | undefined): UserRole {
  if (!clerkRole) return 'CLIENT'
  
  const roleMap: Record<string, UserRole> = {
    'admin': 'ADMIN',
    'artisan': 'ARTISAN',
    'client': 'CLIENT',
    // Also handle uppercase in case it's already uppercase
    'ADMIN': 'ADMIN',
    'ARTISAN': 'ARTISAN',
    'CLIENT': 'CLIENT',
  }
  
  return roleMap[clerkRole] || 'CLIENT'
}

export async function POST() {
  try {
    const { userId } = await auth()
    const clerkUser = await currentUser()
    
    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get role from Clerk's publicMetadata (set by admin or during signup)
    const clerkRole = clerkUser.publicMetadata?.role as string | undefined
    const dbRole = mapClerkRoleToDbRole(clerkRole)

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    })

    if (!user) {
      // Create user in database with role from Clerk
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
          role: dbRole,
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
          profile: {
            create: {
              bio: null,
              country: 'Kenya',
              // Set artisan-specific defaults if role is ARTISAN
              ...(dbRole === 'ARTISAN' && {
                artisanStatus: 'PENDING',
                isAvailable: false,
              })
            }
          }
        },
        include: { profile: true }
      })
    } else {
      // User exists - check if role needs to be updated
      // Only update if Clerk has a different role AND the role actually changed
      if (clerkRole && user.role !== dbRole) {
        user = await prisma.user.update({
          where: { clerkId: userId },
          data: {
            role: dbRole,
            // Update profile for artisan-specific fields if becoming an artisan
            ...(dbRole === 'ARTISAN' && user.profile && !user.profile.artisanStatus && {
              profile: {
                update: {
                  artisanStatus: 'PENDING',
                }
              }
            })
          },
          include: { profile: true }
        })
      }
      
      // Also update basic user info if it changed in Clerk
      const needsUpdate = 
        user.firstName !== (clerkUser.firstName || '') ||
        user.lastName !== (clerkUser.lastName || '') ||
        user.email !== (clerkUser.emailAddresses[0]?.emailAddress || '')
      
      if (needsUpdate) {
        user = await prisma.user.update({
          where: { clerkId: userId },
          data: {
            firstName: clerkUser.firstName || user.firstName,
            lastName: clerkUser.lastName || user.lastName,
            email: clerkUser.emailAddresses[0]?.emailAddress || user.email,
          },
          include: { profile: true }
        })
      }
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
  }
}
