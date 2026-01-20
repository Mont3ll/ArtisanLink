import { Suspense } from "react"
import { ChartAreaInteractive } from "@/components/shared/chart-area-interactive"
import { SectionCards } from "@/components/shared/section-cards"
import { AdminDashboardHeader } from "@/components/dashboard/admin/admin-dashboard-header"
import { AdminDashboardContent } from "@/components/dashboard/admin/admin-dashboard-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardPageContent() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <AdminDashboardHeader />

      <SectionCards />
      
      <ChartAreaInteractive />

      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <AdminDashboardContent />
      </Suspense>
    </div>
  )
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  )
}
