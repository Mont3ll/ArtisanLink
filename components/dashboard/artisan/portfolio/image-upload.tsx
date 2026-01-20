'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Upload, X, ImageIcon, Link as LinkIcon } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  label = 'Image URL',
  placeholder = 'https://example.com/image.jpg',
  disabled = false,
  className
}: ImageUploadProps) {
  const [showUrlInput, setShowUrlInput] = useState(!value)
  const [previewError, setPreviewError] = useState(false)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    onChange(url)
    setPreviewError(false)
  }

  const handleRemove = () => {
    onChange('')
    setShowUrlInput(true)
    setPreviewError(false)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      
      {value && !showUrlInput ? (
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
              Change URL
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
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

interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  label?: string
  disabled?: boolean
  className?: string
}

export function MultiImageUpload({
  value,
  onChange,
  maxImages = 10,
  label = 'Additional Images',
  disabled = false,
  className
}: MultiImageUploadProps) {
  const [newUrl, setNewUrl] = useState('')

  const handleAdd = () => {
    if (newUrl && value.length < maxImages) {
      onChange([...value, newUrl])
      setNewUrl('')
    }
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      
      {/* Existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={url}
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
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new image */}
      {value.length < maxImages && (
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
            onClick={handleAdd}
            disabled={disabled || !newUrl}
          >
            <Upload className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        {value.length} / {maxImages} images added
      </p>
    </div>
  )
}
