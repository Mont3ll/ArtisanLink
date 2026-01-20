'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload, MultiImageUpload } from './image-upload'
import { Save, Loader2, X, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Predefined categories for Kenyan artisans
const CATEGORIES = [
  'Woodworking',
  'Metalwork',
  'Beadwork',
  'Pottery',
  'Weaving',
  'Leatherwork',
  'Jewelry',
  'Painting',
  'Sculpture',
  'Textiles',
  'Basketry',
  'Stone Carving',
  'Furniture',
  'Home Decor',
  'Fashion',
  'Other'
]

interface PortfolioItem {
  id?: string
  title: string
  description: string | null
  imageUrl: string
  imageUrls: string[]
  category: string | null
  tags: string[]
  completedAt: string | null
  duration: string | null
  cost: number | null
  isPublic: boolean
  isFeatured: boolean
}

interface PortfolioFormProps {
  initialData?: PortfolioItem
  mode: 'create' | 'edit'
}

export function PortfolioForm({ initialData, mode }: PortfolioFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')

  // Form state
  const [formData, setFormData] = useState<PortfolioItem>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    imageUrls: initialData?.imageUrls || [],
    category: initialData?.category || '',
    tags: initialData?.tags || [],
    completedAt: initialData?.completedAt 
      ? new Date(initialData.completedAt).toISOString().split('T')[0] 
      : '',
    duration: initialData?.duration || '',
    cost: initialData?.cost || null,
    isPublic: initialData?.isPublic ?? true,
    isFeatured: initialData?.isFeatured ?? false
  })

  const handleChange = (field: keyof PortfolioItem, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      handleChange('tags', [...formData.tags, newTag])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.imageUrl.trim()) {
        throw new Error('Main image URL is required')
      }

      // Prepare payload
      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        imageUrl: formData.imageUrl.trim(),
        imageUrls: formData.imageUrls.filter(url => url.trim()),
        category: formData.category?.trim() || null,
        tags: formData.tags,
        completedAt: formData.completedAt 
          ? new Date(formData.completedAt).toISOString() 
          : null,
        duration: formData.duration?.trim() || null,
        cost: formData.cost || null,
        isPublic: formData.isPublic,
        isFeatured: formData.isFeatured
      }

      const url = mode === 'create' 
        ? '/api/artisan/portfolio'
        : `/api/artisan/portfolio/${initialData?.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${mode} portfolio item`)
      }

      // Redirect to portfolio list
      router.push('/artisan-dashboard/portfolio')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back button */}
      <Link href="/artisan-dashboard/portfolio">
        <Button type="button" variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio
        </Button>
      </Link>

      {/* Error display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Add details about your portfolio item
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Hand-carved Mahogany Table"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your work, the process, materials used..."
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {(formData.description?.length || 0)} / 2000 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration || ''}
                onChange={(e) => handleChange('duration', e.target.value)}
                placeholder="e.g., 2 weeks"
                maxLength={100}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="completedAt">Completion Date</Label>
              <Input
                id="completedAt"
                type="date"
                value={formData.completedAt || ''}
                onChange={(e) => handleChange('completedAt', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Project Cost (KES)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="100"
                value={formData.cost || ''}
                onChange={(e) => handleChange('cost', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="e.g., 25000"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag"
                maxLength={50}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or click + to add tags. Tags help clients find your work.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>
            Add photos of your work. The main image will be displayed prominently.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => handleChange('imageUrl', url)}
            label="Main Image *"
            placeholder="https://example.com/main-image.jpg"
          />

          <MultiImageUpload
            value={formData.imageUrls}
            onChange={(urls) => handleChange('imageUrls', urls)}
            maxImages={10}
            label="Additional Images (optional)"
          />
        </CardContent>
      </Card>

      {/* Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility Settings</CardTitle>
          <CardDescription>
            Control who can see this portfolio item
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPublic">Public</Label>
              <p className="text-sm text-muted-foreground">
                Make this item visible to all visitors
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleChange('isPublic', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isFeatured">Featured</Label>
              <p className="text-sm text-muted-foreground">
                Highlight this item on your profile
              </p>
            </div>
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => handleChange('isFeatured', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <Link href="/artisan-dashboard/portfolio">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Item' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
