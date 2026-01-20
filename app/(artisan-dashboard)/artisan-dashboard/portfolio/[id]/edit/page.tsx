'use client'

import { useParams } from 'next/navigation'
import { PortfolioForm } from '@/components/dashboard/artisan/portfolio/portfolio-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { usePortfolioItem } from '@/lib/hooks'

export default function EditPortfolioPage() {
  const params = useParams()
  const id = params.id as string
  
  // React Query hook
  const { data: item, isLoading, error, refetch } = usePortfolioItem(id)

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Portfolio Item</h1>
        <p className="text-muted-foreground">
          Update the details of your portfolio item
        </p>
      </div>
      
      <PortfolioForm mode="edit" initialData={item} />
    </div>
  )
}
