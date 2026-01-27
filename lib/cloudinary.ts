/**
 * Cloudinary Upload Utilities
 *
 * Provides secure image upload, deletion, and transformation utilities
 * for portfolio images, certificates, and ID documents.
 */

import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'
import { createLogger } from './logger'
import dns from 'dns'

// Force Node.js to prefer IPv4 over IPv6 (fixes connectivity issues on some networks)
dns.setDefaultResultOrder('ipv4first')

const logger = createLogger('cloudinary')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// ============================================================================
// Types
// ============================================================================

export type UploadFolder = 'portfolio' | 'certificates' | 'id-documents' | 'profile-images'

export interface UploadOptions {
  folder: UploadFolder
  publicId?: string
  transformation?: {
    width?: number
    height?: number
    crop?: 'fill' | 'fit' | 'scale' | 'thumb'
    quality?: 'auto' | number
  }
  tags?: string[]
  context?: Record<string, string>
}

export interface UploadResult {
  success: true
  url: string
  secureUrl: string
  publicId: string
  format: string
  width: number
  height: number
  bytes: number
  resourceType: string
}

export interface UploadError {
  success: false
  error: string
  code?: string
}

export type CloudinaryResult = UploadResult | UploadError

export interface DeleteResult {
  success: boolean
  result?: string
  error?: string
}

// ============================================================================
// Configuration
// ============================================================================

const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '5242880', 10) // 5MB default

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']

const FOLDER_CONFIG: Record<UploadFolder, { maxSize: number; allowedFormats: string[] }> = {
  portfolio: {
    maxSize: 10 * 1024 * 1024, // 10MB for portfolio images
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
  certificates: {
    maxSize: 5 * 1024 * 1024, // 5MB for certificates
    allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
  'id-documents': {
    maxSize: 5 * 1024 * 1024, // 5MB for ID documents
    allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
  'profile-images': {
    maxSize: 2 * 1024 * 1024, // 2MB for profile images
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if Cloudinary is properly configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: { size: number; type: string; name?: string },
  folder: UploadFolder
): { valid: boolean; error?: string } {
  const config = FOLDER_CONFIG[folder]

  // Check file size
  if (file.size > config.maxSize) {
    const maxMB = config.maxSize / (1024 * 1024)
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${maxMB}MB for ${folder})`,
    }
  }

  // Extract format from mime type or filename
  let format = ''
  if (file.type) {
    format = file.type.split('/').pop()?.toLowerCase() || ''
  } else if (file.name) {
    format = file.name.split('.').pop()?.toLowerCase() || ''
  }

  // Check allowed formats
  if (!config.allowedFormats.includes(format)) {
    return {
      valid: false,
      error: `File format '${format}' is not allowed. Allowed formats: ${config.allowedFormats.join(', ')}`,
    }
  }

  return { valid: true }
}

// ============================================================================
// Upload Functions
// ============================================================================

/**
 * Upload an image from a base64 string or URL
 */
export async function uploadImage(
  fileData: string, // base64 data URI or URL
  options: UploadOptions
): Promise<CloudinaryResult> {
  if (!isCloudinaryConfigured()) {
    logger.error('Cloudinary is not configured')
    return {
      success: false,
      error: 'Image upload service is not configured',
      code: 'NOT_CONFIGURED',
    }
  }

  const { folder, publicId, transformation, tags, context } = options

  try {
    const uploadOptions: Record<string, unknown> = {
      folder: `artisanlink/${folder}`,
      resource_type: 'auto',
      allowed_formats: FOLDER_CONFIG[folder].allowedFormats,
      max_bytes: FOLDER_CONFIG[folder].maxSize,
    }

    if (publicId) {
      uploadOptions.public_id = publicId
      uploadOptions.overwrite = true
    } else {
      uploadOptions.unique_filename = true
    }

    if (transformation) {
      uploadOptions.transformation = [
        {
          width: transformation.width,
          height: transformation.height,
          crop: transformation.crop || 'fill',
          quality: transformation.quality || 'auto',
        },
      ]
    }

    if (tags && tags.length > 0) {
      uploadOptions.tags = tags
    }

    if (context) {
      uploadOptions.context = context
    }

    logger.info(`Uploading image to folder: ${folder}`)

    const result: UploadApiResponse = await cloudinary.uploader.upload(fileData, uploadOptions)

    logger.info(`Image uploaded successfully: ${result.public_id}`)

    return {
      success: true,
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
    }
  } catch (error) {
    // Extract error message - Cloudinary errors can have various structures
    let errorMessage = 'Failed to upload image'
    let errorCode: string | undefined
    
    // Log the raw error for debugging
    console.error('[Cloudinary Debug] Raw error:', error)
    console.error('[Cloudinary Debug] Error type:', typeof error)
    console.error('[Cloudinary Debug] Error constructor:', error?.constructor?.name)
    
    if (error instanceof Error) {
      errorMessage = error.message
      logger.error('Cloudinary upload error:', error)
    } else if (typeof error === 'object' && error !== null) {
      // Handle Cloudinary error response object
      const errObj = error as Record<string, unknown>
      console.error('[Cloudinary Debug] Error object keys:', Object.keys(errObj))
      
      // Try to extract message from various possible locations
      if (errObj.message && typeof errObj.message === 'string') {
        errorMessage = errObj.message
      } else if (errObj.error && typeof errObj.error === 'object') {
        const innerError = errObj.error as Record<string, unknown>
        if (innerError.message && typeof innerError.message === 'string') {
          errorMessage = innerError.message
        }
      }
      
      // Extract HTTP code if available
      if (errObj.http_code) {
        errorCode = String(errObj.http_code)
      }
      
      logger.error(`Cloudinary upload error: ${errorMessage}`)
    } else {
      logger.error(`Cloudinary upload error: ${String(error)}`)
    }

    return {
      success: false,
      error: errorMessage,
      code: errorCode,
    }
  }
}

/**
 * Upload multiple images
 */
export async function uploadImages(
  files: string[],
  options: UploadOptions
): Promise<CloudinaryResult[]> {
  const results = await Promise.all(files.map((file) => uploadImage(file, options)))
  return results
}

/**
 * Upload an image from a file buffer
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  mimeType: string,
  options: UploadOptions
): Promise<CloudinaryResult> {
  // Convert buffer to base64 data URI
  const base64 = buffer.toString('base64')
  const dataUri = `data:${mimeType};base64,${base64}`

  return uploadImage(dataUri, options)
}

// ============================================================================
// Delete Functions
// ============================================================================

/**
 * Delete an image by public ID
 */
export async function deleteImage(publicId: string): Promise<DeleteResult> {
  if (!isCloudinaryConfigured()) {
    logger.error('Cloudinary is not configured')
    return {
      success: false,
      error: 'Image service is not configured',
    }
  }

  try {
    logger.info(`Deleting image: ${publicId}`)

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok') {
      logger.info(`Image deleted successfully: ${publicId}`)
      return { success: true, result: result.result }
    } else {
      logger.warn(`Image deletion returned: ${result.result}`)
      return { success: false, result: result.result }
    }
  } catch (error) {
    logger.error('Cloudinary delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    }
  }
}

/**
 * Delete multiple images
 */
export async function deleteImages(publicIds: string[]): Promise<DeleteResult[]> {
  const results = await Promise.all(publicIds.map((id) => deleteImage(id)))
  return results
}

// ============================================================================
// URL Transformation Functions
// ============================================================================

/**
 * Get a transformed image URL
 */
export function getTransformedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: 'fill' | 'fit' | 'scale' | 'thumb'
    quality?: 'auto' | number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
  }
): string {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    logger.warn('Cloudinary cloud name not configured')
    return ''
  }

  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
        quality: options.quality || 'auto',
        format: options.format || 'auto',
      },
    ],
    secure: true,
  })
}

/**
 * Get thumbnail URL for an image
 */
export function getThumbnailUrl(publicId: string, size: number = 150): string {
  return getTransformedUrl(publicId, {
    width: size,
    height: size,
    crop: 'thumb',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Get optimized URL for display
 */
export function getOptimizedUrl(
  publicId: string,
  maxWidth: number = 800,
  maxHeight?: number
): string {
  return getTransformedUrl(publicId, {
    width: maxWidth,
    height: maxHeight,
    crop: 'fit',
    quality: 'auto',
    format: 'auto',
  })
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  try {
    // Match Cloudinary URL pattern
    const regex = /\/v\d+\/(.+?)(?:\.[a-z]+)?$/i
    const match = url.match(regex)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com')
}

/**
 * Get signed URL for private resources (if needed)
 */
export function getSignedUrl(publicId: string, expiresInSeconds: number = 3600): string {
  if (!isCloudinaryConfigured()) {
    return ''
  }

  return cloudinary.url(publicId, {
    sign_url: true,
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    secure: true,
  })
}

// ============================================================================
// Export cloudinary instance for advanced usage
// ============================================================================

export { cloudinary }
