import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

/**
 * StatCardSkeleton - Skeleton for stat/metric cards
 * 
 * Use when you need a full card skeleton (e.g., initial page load via Suspense).
 * For partial loading with static labels visible, use DataValue instead.
 */
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  )
}

/**
 * ReviewCardSkeleton - Skeleton for review/feedback cards
 */
export function ReviewCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  )
}

/**
 * UserRowSkeleton - Skeleton for table rows displaying user info
 */
export function UserRowSkeleton({ columns = 7 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {/* User column with avatar */}
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </td>
      {/* Remaining columns */}
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-20" />
        </td>
      ))}
    </tr>
  )
}

/**
 * TableSkeleton - Skeleton for data tables
 */
export function TableSkeleton({ 
  rows = 5, 
  columns = 7,
  showHeader = true,
  className,
}: { 
  rows?: number
  columns?: number
  showHeader?: boolean
  className?: string
}) {
  return (
    <div className={cn("rounded-md border", className)}>
      <table className="w-full">
        {showHeader && (
          <thead>
            <tr className="border-b bg-muted/50">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <UserRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * MessageItemSkeleton - Skeleton for conversation/message list items
 */
export function MessageItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-4 border-b", className)}>
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}

/**
 * ArtisanCardSkeleton - Skeleton for artisan profile cards
 */
export function ArtisanCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-16 w-16 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-4" />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * PortfolioItemSkeleton - Skeleton for portfolio gallery items
 */
export function PortfolioItemSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  )
}

interface StatCardWithSkeletonProps {
  title: string
  icon: ReactNode
  isLoading: boolean
  children: ReactNode
  className?: string
}

/**
 * StatCardWithSkeleton - A stat card that shows skeleton for value while keeping title/icon visible
 * 
 * This is a composite component that demonstrates the preferred pattern:
 * static content (title, icon) remains visible while dynamic content (value) shows skeleton.
 * 
 * @example
 * ```tsx
 * <StatCardWithSkeleton
 *   title="Total Users"
 *   icon={<Users className="h-4 w-4 text-muted-foreground" />}
 *   isLoading={isLoading}
 * >
 *   <div className="text-2xl font-bold">{stats.totalUsers}</div>
 *   <p className="text-xs text-muted-foreground">+12% from last month</p>
 * </StatCardWithSkeleton>
 * ```
 */
export function StatCardWithSkeleton({
  title,
  icon,
  isLoading,
  children,
  className,
}: StatCardWithSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-medium">{title}</span>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-28" />
          </>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
