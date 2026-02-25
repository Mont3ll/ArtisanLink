/**
 * Cloudinary Upload Hook
 * 
 * Provides a React hook for uploading images to Cloudinary via the API.
 * Handles file validation, upload progress simulation, and error handling.
 */
'use client'

import { useState, useCallback } from 'react'

export type UploadFolder = 'portfolio' | 'certificates' | 'id-documents' | 'profile-images'

export interface UploadResult {
  url: string
  publicId: string
  format: string
  width: number
  height: number
  bytes: number
}

export interface UseCloudinaryUploadOptions {
  folder: UploadFolder
  onSuccess?: (result: UploadResult) => void
  onError?: (error: string) => void
}

export interface UseCloudinaryUploadReturn {
  upload: (file: File) => Promise<UploadResult | null>
  uploadMultiple: (files: File[]) => Promise<UploadResult[]>
  deleteImage: (publicId: string) => Promise<boolean>
  isUploading: boolean
  progress: number
  error: string | null
  reset: () => void
}

// File size limits by folder (in bytes)
const MAX_SIZES: Record<UploadFolder, number> = {
  portfolio: 10 * 1024 * 1024, // 10MB
  certificates: 5 * 1024 * 1024, // 5MB
  'id-documents': 5 * 1024 * 1024, // 5MB
  'profile-images': 2 * 1024 * 1024, // 2MB
}

// Allowed formats by folder
const ALLOWED_FORMATS: Record<UploadFolder, string[]> = {
  portfolio: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  certificates: ['image/jpeg', 'image/png', 'application/pdf'],
  'id-documents': ['image/jpeg', 'image/png', 'application/pdf'],
  'profile-images': ['image/jpeg', 'image/png', 'image/webp'],
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate a file before upload
 */
export function validateFile(
  file: File,
  folder: UploadFolder
): { valid: boolean; error?: string } {
  // Check file size
  const maxSize = MAX_SIZES[folder]
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatBytes(file.size)}) exceeds maximum allowed (${formatBytes(maxSize)})`,
    }
  }

  // Check file type
  const allowedFormats = ALLOWED_FORMATS[folder]
  if (!allowedFormats.includes(file.type)) {
    const formatNames = allowedFormats.map(f => f.split('/')[1]).join(', ')
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed: ${formatNames}`,
    }
  }

  return { valid: true }
}

/**
 * Hook for uploading images to Cloudinary
 */
export function useCloudinaryUpload(
  options: UseCloudinaryUploadOptions
): UseCloudinaryUploadReturn {
  const { folder, onSuccess, onError } = options
  
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setIsUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    // Validate file
    const validation = validateFile(file, folder)
    if (!validation.valid) {
      const errorMsg = validation.error || 'Invalid file'
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    setIsUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress (since fetch doesn't support upload progress natively)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      // Create FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      // Upload to API
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setProgress(100)

      const result: UploadResult = {
        url: data.url,
        publicId: data.publicId,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
      }

      onSuccess?.(result)
      
      // Reset progress after a short delay
      setTimeout(() => {
        setIsUploading(false)
        setProgress(0)
      }, 500)

      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMsg)
      setIsUploading(false)
      setProgress(0)
      onError?.(errorMsg)
      return null
    }
  }, [folder, onSuccess, onError])

  const uploadMultiple = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = []
    
    for (const file of files) {
      const result = await upload(file)
      if (result) {
        results.push(result)
      }
    }
    
    return results
  }, [upload])

  const deleteImageFn = useCallback(async (publicId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/upload/image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    }
  }, [onError])

  return {
    upload,
    uploadMultiple,
    deleteImage: deleteImageFn,
    isUploading,
    progress,
    error,
    reset,
  }
}

/**
 * Get file size limits for a folder
 */
export function getUploadLimits(folder: UploadFolder) {
  return {
    maxSize: MAX_SIZES[folder],
    maxSizeFormatted: formatBytes(MAX_SIZES[folder]),
    allowedFormats: ALLOWED_FORMATS[folder],
    allowedExtensions: ALLOWED_FORMATS[folder].map(f => f.split('/')[1]),
  }
}
