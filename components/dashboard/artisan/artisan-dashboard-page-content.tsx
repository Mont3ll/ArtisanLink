import { Suspense } from "react"
import { ArtisanDashboardContent } from "@/components/dashboard/artisan/artisan-dashboard-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function ArtisanDashboardPageContent() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <ArtisanDashboardContent />
      </Suspense>
    </div>
  )
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Section Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      
      {/* Profile Completion Skeleton */}
      <Skeleton className="h-24 w-full" />
      
      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      
      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      
      {/* Activity Skeleton */}
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
