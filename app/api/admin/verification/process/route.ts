import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import {
  sendEmail,
  isEmailConfigured,
  getVerificationApprovedEmail,
  getVerificationRejectedEmail,
} from '@/lib/email'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const logger = createLogger('api:admin:verification:process')

export async function POST(request: Request) {
  const _rl = rateLimit(request, 'admin/verification/process', RATE_LIMITS.STRICT)
  if (!_rl.allowed) return _rl.response!

  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true, email: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { artisanId, action, reason, adminNotes } = body

    if (!artisanId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Get artisan's profile and user info for email
    const artisan = await prisma.user.findUnique({
      where: { id: artisanId },
      include: {
        profile: true,
      },
    })

    if (!artisan || !artisan.profile) {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      artisanStatus: action === 'APPROVE' ? 'VERIFIED' : 'REJECTED',
      verifiedAt: action === 'APPROVE' ? new Date() : null,
      verifiedBy: action === 'APPROVE' ? userId : null,
    }

    if (action === 'REJECT') {
      updateData.rejectionReason = reason || 'Application did not meet verification requirements'
    } else {
      updateData.rejectionReason = null
    }

    if (adminNotes) {
      updateData.verificationNotes = adminNotes
    }

    // Update profile and create history entry in a transaction
    const [updatedProfile, historyEntry] = await prisma.$transaction([
      prisma.profile.update({
        where: { userId: artisanId },
        data: updateData,
      }),
      prisma.verificationHistory.create({
        data: {
          profileId: artisan.profile.id,
          certificateUrl: artisan.profile.certificateUrl,
          idDocumentUrl: artisan.profile.idDocumentUrl,
          idDocumentType: artisan.profile.idDocumentType,
          status: action === 'APPROVE' ? 'VERIFIED' : 'REJECTED',
          processedBy: userId,
          processedAt: new Date(),
          rejectionReason: action === 'REJECT' ? reason : null,
          adminNotes: adminNotes || null,
        },
      }),
    ])

    // Create activity log
    await prisma.activityLog.create({
      data: {
        adminId: userId,
        adminEmail: adminUser.email || 'admin@chapaworks.ke',
        action: action === 'APPROVE' ? 'ARTISAN_VERIFIED' : 'ARTISAN_REJECTED',
        targetType: 'PROFILE',
        targetId: artisanId,
        description: action === 'REJECT' 
          ? `Rejected: ${reason}` 
          : 'Artisan verification approved'
      }
    })

    // Create in-app notification for artisan
    await prisma.notification.create({
      data: {
        userId: artisanId,
        type: 'SYSTEM',
        title: action === 'APPROVE' ? 'Verification Approved' : 'Verification Update',
        message: action === 'APPROVE'
          ? 'Congratulations! Your artisan profile has been verified. You can now receive job requests from clients.'
          : `Your verification application needs attention: ${reason || 'Please review and resubmit your documents.'}`,
        data: {
          status: action === 'APPROVE' ? 'VERIFIED' : 'REJECTED',
          reason: action === 'REJECT' ? reason : null,
        },
        linkUrl: '/artisan-dashboard/profile',
      },
    })

    // Send email notification if configured
    if (isEmailConfigured()) {
      try {
        const artisanName = `${artisan.firstName} ${artisan.lastName}`
        
        if (action === 'APPROVE') {
          const emailContent = getVerificationApprovedEmail({ artisanName })
          await sendEmail({
            to: artisan.email,
            subject: emailContent.subject,
            html: emailContent.html,
          })
          logger.info('Verification approval email sent', { artisanId, email: artisan.email })
        } else {
          const emailContent = getVerificationRejectedEmail({
            artisanName,
            reason: reason || 'Your application did not meet our verification requirements.',
          })
          await sendEmail({
            to: artisan.email,
            subject: emailContent.subject,
            html: emailContent.html,
          })
          logger.info('Verification rejection email sent', { artisanId, email: artisan.email })
        }
      } catch (emailError) {
        // Log but don't fail the request if email fails
        logger.error('Failed to send verification email:', emailError)
      }
    }

    logger.info(`Verification ${action.toLowerCase()}d`, {
      artisanId,
      adminId: userId,
      historyId: historyEntry.id,
    })

    return NextResponse.json({ 
      success: true, 
      message: `Artisan ${action.toLowerCase()}d successfully`,
      profile: updatedProfile,
      emailSent: isEmailConfigured(),
    })
  } catch (error) {
    logger.error('Error processing verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
