'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Star, 
  Eye, 
  EyeOff,
  Calendar,
  Clock,
  Tag,
  RefreshCw,
  AlertTriangle,
  ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  usePortfolioItem,
  useDeletePortfolioItem,
} from '@/lib/hooks'
import { isValidImageUrl } from '@/lib/utils'

// Skip Next.js image optimization for external URLs to avoid server-side fetch timeouts
const UNOPTIMIZED_EXTERNAL = true

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function PortfolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  // React Query hooks
  const { data: item, isLoading, error, refetch } = usePortfolioItem(id)
  const deleteItem = useDeletePortfolioItem()
  
  // Local state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleDelete = async () => {
    deleteItem.mutate(id, {
      onSuccess: () => {
        router.push('/artisan-dashboard/portfolio')
        router.refresh()
      },
      onError: () => {
        setShowDeleteDialog(false)
      }
    })
  }

  // Combine main image with additional images for gallery, filtering out invalid URLs
  const allImages = item 
    ? [item.imageUrl, ...item.imageUrls].filter(url => isValidImageUrl(url)) as string[]
    : []

  // Check if there are any valid images
  const hasValidImages = allImages.length > 0

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="px-4 lg:px-6 space-y-6">
        <Link href="/artisan-dashboard/portfolio">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
        </Link>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <div>
                <h2 className="text-lg font-semibold text-red-800">Error Loading Item</h2>
                <p className="text-red-700">{error?.message || 'Portfolio item not found'}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/artisan-dashboard/portfolio">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
        </Link>
        
        <div className="flex gap-2">
          <Link href={`/artisan-dashboard/portfolio/${item.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {hasValidImages && allImages[selectedImageIndex] ? (
                <Image
                  src={allImages[selectedImageIndex]}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized={UNOPTIMIZED_EXTERNAL}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                </div>
              )}
              
              {/* Navigation arrows */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-primary' 
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${item.title} ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={UNOPTIMIZED_EXTERNAL}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Title and Badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {item.isFeatured && (
                  <Badge className="bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {item.isPublic ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Eye className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
                {item.category && (
                  <Badge variant="secondary">{item.category}</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold">{item.title}</h1>
            </div>

            {/* Description */}
            {item.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{item.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Project Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.completedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-medium">{formatDate(item.completedAt)}</span>
                  </div>
                )}
                {item.duration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{item.duration}</span>
                  </div>
                )}
                {item.cost && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Project Cost:</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(item.cost)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {item.tags.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <div className="text-xs text-muted-foreground pt-2">
              <p>Created: {formatDate(item.createdAt)}</p>
              <p>Last updated: {formatDate(item.updatedAt)}</p>
            </div>
          </div>
        </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{item.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteItem.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteItem.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteItem.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
