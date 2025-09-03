import { Suspense } from "react"
import { ChartAreaInteractive } from "@/components/shared/chart-area-interactive"
import { SectionCards } from "@/components/shared/section-cards"
import { ClientDashboardHeader } from "@/components/dashboard/client/client-dashboard-header"
import { ClientDashboardContent } from "@/components/dashboard/client/client-dashboard-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClientDashboardPageContent() {
  return (
    <div className="flex-1 space-y-4">
      <ClientDashboardHeader />
      <SectionCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ChartAreaInteractive />
        </div>
        <div className="col-span-3">
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <ClientDashboardContent />
          </Suspense>
        </div>
      </div>
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
