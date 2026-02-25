import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createLogger } from '@/lib/logger'
import { IdDocumentType } from '@/app/generated/prisma'

const logger = createLogger('api:artisan:profile')

// Kenyan counties for validation
const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
]

// Valid ID document types
const ID_DOCUMENT_TYPES: IdDocumentType[] = ['NATIONAL_ID', 'PASSPORT', 'DRIVING_LICENSE', 'ALIEN_ID']

// Validation schema for profile updates
const updateProfileSchema = z.object({
  // Availability
  isAvailable: z.boolean().optional(),
  
  // Profile images
  profileImage: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  
  // Certificate/Verification
  certificateUrl: z.string().url().optional().nullable(),
  
  // ID Document verification (Phase 10 enhancement)
  idDocumentUrl: z.string().url().optional().nullable(),
  idDocumentType: z.enum(['NATIONAL_ID', 'PASSPORT', 'DRIVING_LICENSE', 'ALIEN_ID']).optional().nullable(),
  
  // Capacity management (Phase 9 enhancement)
  maxConcurrentJobs: z.number().int().min(1).max(20).optional(),
  autoToggleAvailability: z.boolean().optional(),
  
  // Location fields
  county: z.string().optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  town: z.string().max(100).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  
  // Basic profile fields
  bio: z.string().max(2000).optional().nullable(),
  profession: z.string().max(100).optional().nullable(),
  experience: z.number().int().min(0).max(100).optional().nullable(),
  hourlyRate: z.number().min(0).optional().nullable(),
  website: z.string().url().max(500).optional().nullable(),
}).strict()

// GET - Get artisan profile
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { 
        profile: {
          include: {
            specializations: true,
            verificationHistory: {
              orderBy: { submittedAt: 'desc' },
              take: 5, // Last 5 verification attempts
            },
          }
        }
      }
    })

    if (!user || user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!user.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      profile: user.profile,
      counties: KENYAN_COUNTIES,
      idDocumentTypes: ID_DOCUMENT_TYPES,
    })
  } catch (error) {
    logger.error('Error fetching artisan profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update artisan profile
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    })

    if (!user || user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!user.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = updateProfileSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Validate county if provided
    if (data.county && !KENYAN_COUNTIES.includes(data.county)) {
      return NextResponse.json(
        { error: 'Invalid county. Must be a valid Kenyan county.' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    let shouldResetVerification = false

    // Handle availability toggle
    if (typeof data.isAvailable === 'boolean') {
      updateData.isAvailable = data.isAvailable
    }

    // Handle profile images
    if (data.profileImage !== undefined) {
      updateData.profileImage = data.profileImage
    }
    if (data.coverImage !== undefined) {
      updateData.coverImage = data.coverImage
    }

    // Handle capacity management
    if (data.maxConcurrentJobs !== undefined) {
      updateData.maxConcurrentJobs = data.maxConcurrentJobs
    }
    if (typeof data.autoToggleAvailability === 'boolean') {
      updateData.autoToggleAvailability = data.autoToggleAvailability
    }

    // Handle certificate upload
    if (data.certificateUrl !== undefined) {
      updateData.certificateUrl = data.certificateUrl
      if (data.certificateUrl) {
        updateData.certificateUploadedAt = new Date()
        // Set status to PENDING for admin review when new certificate is uploaded
        // Only change if not already verified
        if (user.profile.artisanStatus !== 'VERIFIED') {
          shouldResetVerification = true
        }
      } else {
        // If certificate is removed, clear the upload date
        updateData.certificateUploadedAt = null
      }
    }

    // Handle ID document upload (Phase 10 enhancement)
    if (data.idDocumentUrl !== undefined) {
      updateData.idDocumentUrl = data.idDocumentUrl
      if (data.idDocumentUrl) {
        updateData.idDocumentUploadedAt = new Date()
        // Require ID document type when URL is provided
        if (!data.idDocumentType && !user.profile.idDocumentType) {
          return NextResponse.json(
            { error: 'ID document type is required when uploading ID document' },
            { status: 400 }
          )
        }
        // Set status to PENDING for admin review when new ID is uploaded
        if (user.profile.artisanStatus !== 'VERIFIED') {
          shouldResetVerification = true
        }
      } else {
        // If ID document is removed, clear related fields
        updateData.idDocumentUploadedAt = null
        updateData.idDocumentType = null
      }
    }

    // Handle ID document type
    if (data.idDocumentType !== undefined) {
      updateData.idDocumentType = data.idDocumentType
    }

    // Handle location fields
    if (data.county !== undefined) updateData.county = data.county
    if (data.city !== undefined) updateData.city = data.city
    if (data.town !== undefined) updateData.town = data.town
    if (data.address !== undefined) updateData.address = data.address
    if (data.latitude !== undefined) updateData.latitude = data.latitude
    if (data.longitude !== undefined) updateData.longitude = data.longitude

    // Handle basic profile fields
    if (data.bio !== undefined) updateData.bio = data.bio
    if (data.profession !== undefined) updateData.profession = data.profession
    if (data.experience !== undefined) updateData.experience = data.experience
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate
    if (data.website !== undefined) updateData.website = data.website

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // If uploading new documents for verification, reset status and clear rejection
    if (shouldResetVerification) {
      updateData.artisanStatus = 'PENDING'
      updateData.rejectionReason = null
    }

    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { id: user.profile.id },
      data: updateData
    })

    logger.info('Profile updated', { userId: user.id, fields: Object.keys(updateData) })

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    })
  } catch (error) {
    logger.error('Error updating artisan profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
