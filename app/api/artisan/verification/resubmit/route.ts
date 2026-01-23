/**
 * Artisan Verification Resubmission API
 *
 * POST /api/artisan/verification/resubmit - Resubmit for verification after rejection
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'

const logger = createLogger('api:artisan:verification:resubmit')

const resubmitSchema = z.object({
  certificateUrl: z.string().url().optional(),
  idDocumentUrl: z.string().url().optional(),
  idDocumentType: z.enum(['NATIONAL_ID', 'PASSPORT', 'DRIVING_LICENSE', 'ALIEN_ID']).optional(),
  notes: z.string().max(1000).optional(),
})

/**
 * POST /api/artisan/verification/resubmit
 * Resubmit documents for verification after rejection
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { profile: true },
    })

    if (!user || user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Only artisans can resubmit verification' }, { status: 403 })
    }

    if (!user.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if artisan is in REJECTED status
    if (user.profile.artisanStatus !== 'REJECTED') {
      return NextResponse.json({
        error: 'Verification resubmission is only available for rejected applications',
        currentStatus: user.profile.artisanStatus,
      }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const validation = resubmitSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten(),
      }, { status: 400 })
    }

    const data = validation.data

    // Must provide at least one document
    if (!data.certificateUrl && !data.idDocumentUrl) {
      return NextResponse.json({
        error: 'At least one document (certificate or ID) is required for resubmission',
      }, { status: 400 })
    }

    // If ID document URL is provided, type is required
    if (data.idDocumentUrl && !data.idDocumentType && !user.profile.idDocumentType) {
      return NextResponse.json({
        error: 'ID document type is required when uploading ID document',
      }, { status: 400 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      artisanStatus: 'PENDING',
      rejectionReason: null, // Clear previous rejection reason
      resubmissionCount: { increment: 1 },
    }

    if (data.certificateUrl) {
      updateData.certificateUrl = data.certificateUrl
      updateData.certificateUploadedAt = new Date()
    }

    if (data.idDocumentUrl) {
      updateData.idDocumentUrl = data.idDocumentUrl
      updateData.idDocumentUploadedAt = new Date()
    }

    if (data.idDocumentType) {
      updateData.idDocumentType = data.idDocumentType
    }

    // Create verification history entry and update profile in a transaction
    const [updatedProfile, historyEntry] = await prisma.$transaction([
      prisma.profile.update({
        where: { id: user.profile.id },
        data: updateData,
      }),
      prisma.verificationHistory.create({
        data: {
          profileId: user.profile.id,
          certificateUrl: data.certificateUrl || user.profile.certificateUrl,
          idDocumentUrl: data.idDocumentUrl || user.profile.idDocumentUrl,
          idDocumentType: data.idDocumentType || user.profile.idDocumentType,
          status: 'PENDING',
        },
      }),
    ])

    // Create notification for admins (optional - could query for admin users)
    logger.info('Verification resubmitted', {
      userId: user.id,
      profileId: user.profile.id,
      resubmissionCount: updatedProfile.resubmissionCount,
    })

    return NextResponse.json({
      message: 'Verification documents resubmitted successfully',
      profile: {
        id: updatedProfile.id,
        artisanStatus: updatedProfile.artisanStatus,
        resubmissionCount: updatedProfile.resubmissionCount,
        certificateUrl: updatedProfile.certificateUrl,
        idDocumentUrl: updatedProfile.idDocumentUrl,
      },
      historyId: historyEntry.id,
    })
  } catch (error) {
    logger.error('Failed to resubmit verification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/artisan/verification/resubmit
 * Get verification status and history
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and profile with verification history
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        profile: {
          include: {
            verificationHistory: {
              orderBy: { submittedAt: 'desc' },
              take: 10,
            },
          },
        },
      },
    })

    if (!user || user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Only artisans can access this endpoint' }, { status: 403 })
    }

    if (!user.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      verification: {
        status: user.profile.artisanStatus,
        rejectionReason: user.profile.rejectionReason,
        resubmissionCount: user.profile.resubmissionCount,
        certificateUrl: user.profile.certificateUrl,
        certificateUploadedAt: user.profile.certificateUploadedAt,
        idDocumentUrl: user.profile.idDocumentUrl,
        idDocumentType: user.profile.idDocumentType,
        idDocumentUploadedAt: user.profile.idDocumentUploadedAt,
        verifiedAt: user.profile.verifiedAt,
      },
      history: user.profile.verificationHistory.map((h: typeof user.profile.verificationHistory[number]) => ({
        id: h.id,
        status: h.status,
        submittedAt: h.submittedAt,
        processedAt: h.processedAt,
        rejectionReason: h.rejectionReason,
      })),
      canResubmit: user.profile.artisanStatus === 'REJECTED',
    })
  } catch (error) {
    logger.error('Failed to get verification status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
