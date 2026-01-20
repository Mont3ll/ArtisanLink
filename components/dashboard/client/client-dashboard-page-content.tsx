import { Suspense } from "react"
import { SectionCards } from "@/components/shared/section-cards"
import { ClientDashboardHeader } from "@/components/dashboard/client/client-dashboard-header"
import { ClientDashboardContent } from "@/components/dashboard/client/client-dashboard-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClientDashboardPageContent() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <ClientDashboardHeader />
      <SectionCards />
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <ClientDashboardContent />
      </Suspense>
    </div>
  )
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  )
}
