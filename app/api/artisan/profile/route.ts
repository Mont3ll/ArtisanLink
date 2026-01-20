import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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

// Validation schema for profile updates
const updateProfileSchema = z.object({
  // Availability
  isAvailable: z.boolean().optional(),
  
  // Certificate/Verification
  certificateUrl: z.string().url().optional().nullable(),
  
  // Location fields
  county: z.string().optional().nullable(),
  city: z.string().max(100).optional().nullable(),
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
            specializations: true
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
      counties: KENYAN_COUNTIES
    })
  } catch (error) {
    console.error('Error fetching artisan profile:', error)
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

    // Handle availability toggle
    if (typeof data.isAvailable === 'boolean') {
      updateData.isAvailable = data.isAvailable
    }

    // Handle certificate upload
    if (data.certificateUrl !== undefined) {
      updateData.certificateUrl = data.certificateUrl
      if (data.certificateUrl) {
        updateData.certificateUploadedAt = new Date()
        // Set status to PENDING for admin review when new certificate is uploaded
        // Only change if not already verified
        if (user.profile.artisanStatus !== 'VERIFIED') {
          updateData.artisanStatus = 'PENDING'
        }
      } else {
        // If certificate is removed, clear the upload date
        updateData.certificateUploadedAt = null
      }
    }

    // Handle location fields
    if (data.county !== undefined) updateData.county = data.county
    if (data.city !== undefined) updateData.city = data.city
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

    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { id: user.profile.id },
      data: updateData
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Error updating artisan profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
