/**
 * Image Upload API
 *
 * POST /api/upload/image - Upload an image to Cloudinary
 * DELETE /api/upload/image - Delete an image from Cloudinary
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  uploadImage,
  deleteImage,
  validateFile,
  isCloudinaryConfigured,
  type UploadFolder,
} from '@/lib/cloudinary'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:upload')

// Maximum file sizes by folder
const MAX_SIZES: Record<UploadFolder, number> = {
  portfolio: 10 * 1024 * 1024, // 10MB
  certificates: 5 * 1024 * 1024, // 5MB
  'id-documents': 5 * 1024 * 1024, // 5MB
  'profile-images': 2 * 1024 * 1024, // 2MB
  'message-attachments': 5 * 1024 * 1024, // 5MB
}

/**
 * POST /api/upload/image
 * Upload an image to Cloudinary
 *
 * Body (JSON):
 * - file: base64 data URI string (required)
 * - folder: 'portfolio' | 'certificates' | 'id-documents' | 'profile-images' (required)
 * - publicId?: custom public ID (optional)
 * - tags?: string[] (optional)
 *
 * Or Body (FormData):
 * - file: File object (required)
 * - folder: string (required)
 * - publicId?: string (optional)
 * - tags?: string (comma-separated, optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      logger.error('Cloudinary is not configured')
      return NextResponse.json(
        { error: 'Image upload service is not available' },
        { status: 503 }
      )
    }

    // Parse request body
    const contentType = request.headers.get('content-type') || ''
    let fileData: string
    let folder: UploadFolder
    let publicId: string | undefined
    let tags: string[] | undefined

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData upload
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const folderParam = formData.get('folder') as string | null
      publicId = (formData.get('publicId') as string) || undefined
      const tagsParam = formData.get('tags') as string | null

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      if (!folderParam || !isValidFolder(folderParam)) {
        return NextResponse.json(
          { error: 'Invalid or missing folder parameter' },
          { status: 400 }
        )
      }

      folder = folderParam as UploadFolder

      // Validate file
      const validation = validateFile(
        { size: file.size, type: file.type, name: file.name },
        folder
      )
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      // Convert File to base64 data URI
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      fileData = `data:${file.type};base64,${base64}`

      tags = tagsParam ? tagsParam.split(',').map((t) => t.trim()) : undefined
    } else {
      // Handle JSON upload (base64 data URI)
      const body = await request.json()
      const { file, folder: folderParam, publicId: pubId, tags: tagsParam } = body

      if (!file || typeof file !== 'string') {
        return NextResponse.json(
          { error: 'No file provided or invalid file format' },
          { status: 400 }
        )
      }

      if (!folderParam || !isValidFolder(folderParam)) {
        return NextResponse.json(
          { error: 'Invalid or missing folder parameter' },
          { status: 400 }
        )
      }

      folder = folderParam as UploadFolder
      fileData = file
      publicId = pubId
      tags = tagsParam

      // Validate base64 data URI format
      if (!fileData.startsWith('data:')) {
        return NextResponse.json(
          { error: 'Invalid file format. Expected base64 data URI' },
          { status: 400 }
        )
      }

      // Extract and validate file size from base64
      const base64Data = fileData.split(',')[1]
      if (base64Data) {
        const sizeInBytes = (base64Data.length * 3) / 4
        if (sizeInBytes > MAX_SIZES[folder]) {
          const maxMB = MAX_SIZES[folder] / (1024 * 1024)
          return NextResponse.json(
            { error: `File size exceeds maximum allowed (${maxMB}MB for ${folder})` },
            { status: 400 }
          )
        }
      }
    }

    // Add user ID as context for tracking
    const context: Record<string, string> = {
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
    }

    // Upload to Cloudinary
    logger.info(`Uploading image to folder: ${folder}`, { userId })
    const result = await uploadImage(fileData, {
      folder,
      publicId,
      tags,
      context,
    })

    if (!result.success) {
      logger.error('Upload failed', { error: result.error, userId })
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      )
    }

    logger.info(`Image uploaded successfully: ${result.publicId}`, { userId })

    return NextResponse.json({
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    })
  } catch (error) {
    logger.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload/image
 * Delete an image from Cloudinary
 *
 * Body (JSON):
 * - publicId: string (required) - The public ID of the image to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      logger.error('Cloudinary is not configured')
      return NextResponse.json(
        { error: 'Image service is not available' },
        { status: 503 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { publicId } = body

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid publicId' },
        { status: 400 }
      )
    }

    // Security: Verify the publicId is within artisanlink folder
    if (!publicId.startsWith('artisanlink/')) {
      return NextResponse.json(
        { error: 'Invalid publicId - cannot delete files outside of artisanlink folder' },
        { status: 403 }
      )
    }

    // Delete from Cloudinary
    logger.info(`Deleting image: ${publicId}`, { userId })
    const result = await deleteImage(publicId)

    if (!result.success) {
      logger.error('Delete failed', { error: result.error, publicId, userId })
      return NextResponse.json(
        { error: result.error || 'Delete failed' },
        { status: 500 }
      )
    }

    logger.info(`Image deleted successfully: ${publicId}`, { userId })

    return NextResponse.json({
      success: true,
      publicId,
    })
  } catch (error) {
    logger.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function isValidFolder(folder: string): folder is UploadFolder {
  return ['portfolio', 'certificates', 'id-documents', 'profile-images'].includes(folder)
}
