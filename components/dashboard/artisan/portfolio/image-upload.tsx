'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  useCloudinaryUpload,
  getUploadLimits,
  type UploadFolder,
} from '@/lib/hooks/use-cloudinary-upload'
import {
  Upload,
  X,
  ImageIcon,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string, publicId?: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Enable file upload mode (requires Cloudinary config) */
  enableFileUpload?: boolean
  /** Cloudinary folder for file uploads */
  folder?: UploadFolder
}

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
  placeholder = 'https://example.com/image.jpg',
  disabled = false,
  className,
  enableFileUpload = true,
  folder = 'portfolio',
}: ImageUploadProps) {
  const [showUrlInput, setShowUrlInput] = useState(!value)
  const [previewError, setPreviewError] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [currentPublicId, setCurrentPublicId] = useState<string | null>(null)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>(enableFileUpload ? 'file' : 'url')
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
      setShowUrlInput(false)
      setPreviewError(false)
    },
  })

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    onChange(url)
    setPreviewError(false)
    setCurrentPublicId(null)
  }

  const handleRemove = async () => {
    if (currentPublicId) {
      await deleteImage(currentPublicId)
    }
    onChange('')
    setShowUrlInput(true)
    setPreviewError(false)
    setCurrentPublicId(null)
    reset()
  }

  const handleFile = useCallback(async (file: File) => {
    if (disabled || isUploading) return
    await upload(file)
  }, [disabled, isUploading, upload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled || isUploading) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [disabled, isUploading, handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !isUploading) setIsDragOver(true)
  }, [disabled, isUploading])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }, [handleFile])

  const handleUploadClick = useCallback(() => {
    if (!disabled && !isUploading) inputRef.current?.click()
  }, [disabled, isUploading])

  // Show preview if we have a value and not in input mode
  if (value && !showUrlInput) {
    return (
      <div className={cn('space-y-2', className)}>
        {label && <Label>{label}</Label>}
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            {previewError ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-2" />
                <span className="text-sm">Failed to load image</span>
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
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setShowUrlInput(true)}
              disabled={disabled}
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              Change
            </Button>
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
      </div>
    )
  }

  // Show upload/URL input interface
  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      {enableFileUpload ? (
        <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'file' | 'url')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" disabled={disabled}>
              <Upload className="h-4 w-4 mr-1" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" disabled={disabled}>
              <LinkIcon className="h-4 w-4 mr-1" />
              Enter URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-2">
            <div
              onClick={handleUploadClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
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
                className="hidden"
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-2 p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm font-medium">Uploading...</span>
                  <Progress value={progress} className="w-40 h-2" />
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className={cn(
                    'p-3 rounded-full',
                    isDragOver ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <Upload className={cn(
                      'h-5 w-5',
                      isDragOver ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <span className="text-sm font-medium">
                    {isDragOver ? 'Drop file here' : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {limits.allowedExtensions.join(', ').toUpperCase()} up to {limits.maxSizeFormatted}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="mt-2">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={value}
                  onChange={handleUrlChange}
                  placeholder={placeholder}
                  disabled={disabled}
                />
                {value && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUrlInput(false)}
                  >
                    Preview
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a direct image URL from any image hosting service.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // URL-only mode (when file upload is disabled)
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="url"
              value={value}
              onChange={handleUrlChange}
              placeholder={placeholder}
              disabled={disabled}
            />
            {value && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUrlInput(false)}
              >
                Preview
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Enter an image URL. Recommended: Use services like Cloudinary, Imgur, or your own image hosting.
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MultiImageUpload - Now supports file uploads
// ============================================================================

interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  label?: string
  disabled?: boolean
  className?: string
  /** Enable file upload mode (requires Cloudinary config) */
  enableFileUpload?: boolean
  /** Cloudinary folder for file uploads */
  folder?: UploadFolder
}

interface UploadedImage {
  url: string
  publicId?: string
}

export function MultiImageUpload({
  value,
  onChange,
  maxImages = 10,
  label = 'Images',
  disabled = false,
  className,
  enableFileUpload = true,
  folder = 'portfolio',
}: MultiImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    value.map(url => ({ url }))
  )
  const [newUrl, setNewUrl] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>(enableFileUpload ? 'file' : 'url')
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
      const newImage = { url: result.url, publicId: result.publicId }
      setImages(prev => {
        const updated = [...prev, newImage]
        onChange(updated.map(img => img.url))
        return updated
      })
    },
  })

  const handleUrlAdd = () => {
    if (newUrl && images.length < maxImages) {
      const newImage = { url: newUrl }
      setImages(prev => {
        const updated = [...prev, newImage]
        onChange(updated.map(img => img.url))
        return updated
      })
      setNewUrl('')
    }
  }

  const handleRemove = async (index: number) => {
    const image = images[index]
    if (image.publicId) {
      await deleteImage(image.publicId)
    }
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index)
      onChange(updated.map(img => img.url))
      return updated
    })
  }

  const handleFile = useCallback(async (file: File) => {
    if (disabled || isUploading || images.length >= maxImages) return
    await upload(file)
  }, [disabled, isUploading, images.length, maxImages, upload])

  const handleFiles = useCallback(async (files: FileList) => {
    const remaining = maxImages - images.length
    const filesToUpload = Array.from(files).slice(0, remaining)
    for (const file of filesToUpload) {
      await upload(file)
    }
  }, [maxImages, images.length, upload])

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
    if (!disabled && !isUploading && images.length < maxImages) {
      setIsDragOver(true)
    }
  }, [disabled, isUploading, images.length, maxImages])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
    if (inputRef.current) inputRef.current.value = ''
  }, [handleFiles])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleUrlAdd()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {label && <Label>{label}</Label>}

      {/* Existing images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={image.url}
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

      {/* Add new image */}
      {images.length < maxImages && enableFileUpload && (
        <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'file' | 'url')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" disabled={disabled}>
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" disabled={disabled}>
              <LinkIcon className="h-4 w-4 mr-1" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-2">
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
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
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <Progress value={progress} className="w-24 h-1" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Click or drag to upload</span>
                </div>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="mt-2">
            <div className="flex gap-2">
              <Input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com/image.jpg"
                disabled={disabled}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleUrlAdd}
                disabled={disabled || !newUrl}
              >
                Add
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* URL-only mode */}
      {images.length < maxImages && !enableFileUpload && (
        <div className="flex gap-2">
          <Input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com/image.jpg"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleUrlAdd}
            disabled={disabled || !newUrl}
          >
            <Upload className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length} / {maxImages} images added
      </p>
    </div>
  )
}
