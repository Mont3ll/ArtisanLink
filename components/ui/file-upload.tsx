/**
 * FileUpload Component
 * 
 * A drag-and-drop file upload component that uploads to Cloudinary.
 * Supports single and multiple file uploads with preview and progress.
 */
'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  useCloudinaryUpload,
  getUploadLimits,
  validateFile,
  type UploadFolder,
  type UploadResult,
} from '@/lib/hooks/use-cloudinary-upload'
import {
  Upload,
  X,
  ImageIcon,
  FileIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

interface FileUploadProps {
  folder: UploadFolder
  value?: string
  onChange: (url: string, publicId?: string) => void
  onDelete?: (publicId: string) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
  accept?: string
  showPreview?: boolean
}

export function FileUpload({
  folder,
  value,
  onChange,
  onDelete,
  label,
  description,
  disabled = false,
  className,
  accept,
  showPreview = true,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const [currentPublicId, setCurrentPublicId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const limits = getUploadLimits(folder)

  const {
    upload,
    deleteImage,
    isUploading,
    progress,
    error,
    reset,
  } = useCloudinaryUpload({
    folder,
    onSuccess: (result) => {
      setCurrentPublicId(result.publicId)
      onChange(result.url, result.publicId)
    },
  })

  const handleFile = useCallback(async (file: File) => {
    if (disabled || isUploading) return

    const validation = validateFile(file, folder)
    if (!validation.valid) {
      return
    }

    await upload(file)
  }, [disabled, isUploading, folder, upload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (disabled || isUploading) return

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [disabled, isUploading, handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !isUploading) {
      setIsDragOver(true)
    }
  }, [disabled, isUploading])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    // Reset input so the same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [handleFile])

  const handleRemove = useCallback(async () => {
    if (currentPublicId) {
      await deleteImage(currentPublicId)
      onDelete?.(currentPublicId)
    }
    setCurrentPublicId(null)
    setPreviewError(false)
    onChange('', undefined)
    reset()
  }, [currentPublicId, deleteImage, onDelete, onChange, reset])

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      inputRef.current?.click()
    }
  }, [disabled, isUploading])

  // Determine accepted file types
  const acceptTypes = accept || limits.allowedFormats.join(',')

  // Check if the value is an image
  const isImage = value && (
    value.includes('image') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(value)
  )

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      {/* Preview or Upload Zone */}
      {value && showPreview ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            {previewError || !isImage ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <FileIcon className="h-12 w-12 mb-2" />
                <span className="text-sm">File uploaded</span>
                <span className="text-xs text-muted-foreground truncate max-w-[80%]">
                  {value.split('/').pop()}
                </span>
              </div>
            ) : (
              <Image
                src={value}
                alt="Preview"
                fill
                className="object-cover"
                onError={() => setPreviewError(true)}
              />
            )}
          </div>
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
            isDragOver && 'border-primary bg-primary/5',
            disabled && 'opacity-50 cursor-not-allowed',
            isUploading && 'cursor-wait',
            !isDragOver && !disabled && 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 p-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="text-sm font-medium">Uploading...</span>
              <Progress value={progress} className="w-48 h-2" />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <div className={cn(
                'p-3 rounded-full',
                isDragOver ? 'bg-primary/10' : 'bg-muted'
              )}>
                <Upload className={cn(
                  'h-6 w-6',
                  isDragOver ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>
              <div>
                <span className="text-sm font-medium">
                  {isDragOver ? 'Drop file here' : 'Click to upload or drag and drop'}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {limits.allowedExtensions.join(', ').toUpperCase()} up to {limits.maxSizeFormatted}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Description */}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

// ============================================================================
// Multi-File Upload Component
// ============================================================================

interface MultiFileUploadProps {
  folder: UploadFolder
  value: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

interface UploadedFile {
  url: string
  publicId: string
}

export function MultiFileUpload({
  folder,
  value,
  onChange,
  maxFiles = 10,
  label,
  description,
  disabled = false,
  className,
}: MultiFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    value.map(url => ({ url, publicId: '' }))
  )
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const limits = getUploadLimits(folder)

  const {
    upload,
    deleteImage,
    isUploading,
    progress,
    error,
  } = useCloudinaryUpload({
    folder,
    onSuccess: (result) => {
      const newFile = { url: result.url, publicId: result.publicId }
      setUploadedFiles(prev => {
        const updated = [...prev, newFile]
        onChange(updated.map(f => f.url))
        return updated
      })
    },
  })

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled || isUploading) return

    const remainingSlots = maxFiles - uploadedFiles.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    for (const file of filesToUpload) {
      await upload(file)
    }
  }, [disabled, isUploading, maxFiles, uploadedFiles.length, upload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (disabled || isUploading) return

    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [disabled, isUploading, handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !isUploading && uploadedFiles.length < maxFiles) {
      setIsDragOver(true)
    }
  }, [disabled, isUploading, uploadedFiles.length, maxFiles])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [handleFiles])

  const handleRemove = useCallback(async (index: number) => {
    const file = uploadedFiles[index]
    if (file.publicId) {
      await deleteImage(file.publicId)
    }
    setUploadedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index)
      onChange(updated.map(f => f.url))
      return updated
    })
  }, [uploadedFiles, deleteImage, onChange])

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && uploadedFiles.length < maxFiles) {
      inputRef.current?.click()
    }
  }, [disabled, isUploading, uploadedFiles.length, maxFiles])

  return (
    <div className={cn('space-y-4', className)}>
      {label && <Label>{label}</Label>}

      {/* Uploaded Files Grid */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={file.url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
                disabled={disabled || isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {uploadedFiles.length < maxFiles && (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
            isDragOver && 'border-primary bg-primary/5',
            disabled && 'opacity-50 cursor-not-allowed',
            isUploading && 'cursor-wait',
            !isDragOver && !disabled && 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={limits.allowedFormats.join(',')}
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            multiple
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <Progress value={progress} className="w-32 h-1" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Click or drag to add images
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{uploadedFiles.length} / {maxFiles} images</span>
        {error && (
          <span className="text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
