import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/app/generated/prisma'

// Map Clerk role (lowercase) to database role (uppercase enum).
// Returns null if role is unknown/missing — callers must handle this.
function mapClerkRoleToDbRole(clerkRole: string | undefined): UserRole | null {
  if (!clerkRole) return null
  
  const roleMap: Record<string, UserRole> = {
    'admin': 'ADMIN',
    'artisan': 'ARTISAN',
    'client': 'CLIENT',
    'ADMIN': 'ADMIN',
    'ARTISAN': 'ARTISAN',
    'CLIENT': 'CLIENT',
  }
  
  return roleMap[clerkRole] ?? null
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
      // If Clerk has no role yet, don't create the user — /after-sign-up
      // will handle creation with the correct role from the signup cookie.
      // Creating here with a guessed role causes artisans to be demoted.
      if (!dbRole) {
        return NextResponse.json({
          success: true,
          user: null,
          message: 'User not yet created — awaiting role assignment',
        })
      }

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
      // User exists — only update role if Clerk explicitly provides one
      // that differs from the DB. Never downgrade when Clerk role is missing.
      if (dbRole && user.role !== dbRole) {
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
      // Guard: only compare if values are actually different to avoid needless DB writes
      const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress || ''
      const clerkFirst = clerkUser.firstName || ''
      const clerkLast = clerkUser.lastName || ''
      const needsUpdate =
        (clerkFirst && user.firstName !== clerkFirst) ||
        (clerkLast && user.lastName !== clerkLast) ||
        (clerkEmail && user.email !== clerkEmail)

      if (needsUpdate) {
        try {
          user = await prisma.user.update({
            where: { clerkId: userId },
            data: {
              ...(clerkFirst && { firstName: clerkFirst }),
              ...(clerkLast && { lastName: clerkLast }),
              ...(clerkEmail && { email: clerkEmail }),
            },
            include: { profile: true }
          })
        } catch (updateError) {
          // Non-fatal: log and continue — don't fail sync over a name/email update
          console.warn('[UserSync] Non-fatal update error (possible email conflict):', 
            updateError instanceof Error ? updateError.message : updateError)
        }
      }

      // Auto-create profile for ARTISAN users who somehow have none (self-healing)
      if (user.role === 'ARTISAN' && !user.profile) {
        console.warn('[UserSync] ARTISAN user has no profile, auto-creating:', user.id)
        try {
          await prisma.profile.create({
            data: {
              userId: user.id,
              country: 'Kenya',
              artisanStatus: 'PENDING',
              isAvailable: false,
            },
          })
        } catch (profileError) {
          console.error('[UserSync] Failed to auto-create profile:', profileError)
        }
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
