import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface DataValueProps {
  /** Content to display when not loading */
  children: ReactNode
  /** Whether data is currently loading */
  isLoading: boolean
  /** Custom className for the skeleton */
  className?: string
  /** Skeleton width (default: "w-16") */
  width?: string
  /** Skeleton height (default: "h-6") */
  height?: string
  /** Whether to render inline (span) or block (div) */
  inline?: boolean
}

/**
 * DataValue - Wrapper component for dynamic data that shows skeleton during loading
 * 
 * Use this to wrap individual data values within a component that has static
 * structure (headers, labels, icons). The static content remains visible
 * while the dynamic data shows a pulsing skeleton.
 * 
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Total Users</CardTitle>  // Always visible
 *   </CardHeader>
 *   <CardContent>
 *     <DataValue isLoading={isLoading} className="h-8 w-20">
 *       <span className="text-2xl font-bold">{data?.count}</span>
 *     </DataValue>
 *   </CardContent>
 * </Card>
 * ```
 */
export function DataValue({
  children,
  isLoading,
  className,
  width = "w-16",
  height = "h-6",
  inline = false,
}: DataValueProps) {
  if (isLoading) {
    return (
      <Skeleton 
        className={cn(
          height, 
          width, 
          inline && "inline-block align-middle",
          className
        )} 
      />
    )
  }

  return <>{children}</>
}

interface DataTextProps {
  /** Text content to display */
  children: ReactNode
  /** Whether data is currently loading */
  isLoading: boolean
  /** Additional className for the text wrapper */
  className?: string
  /** Skeleton width (for approximating text length) */
  skeletonWidth?: string
}

/**
 * DataText - Skeleton wrapper specifically for text content
 * 
 * Automatically sizes the skeleton based on expected text content type.
 * 
 * @example
 * ```tsx
 * <DataText isLoading={isLoading} skeletonWidth="w-32">
 *   {user.name}
 * </DataText>
 * ```
 */
export function DataText({
  children,
  isLoading,
  className,
  skeletonWidth = "w-24",
}: DataTextProps) {
  if (isLoading) {
    return <Skeleton className={cn("h-4", skeletonWidth, className)} />
  }

  return <span className={className}>{children}</span>
}

interface DataNumberProps {
  /** Number value to display */
  value: number | string | undefined | null
  /** Whether data is currently loading */
  isLoading: boolean
  /** Format function for the number */
  format?: (value: number | string) => string
  /** Additional className */
  className?: string
  /** Skeleton width */
  skeletonWidth?: string
  /** Skeleton height */
  skeletonHeight?: string
}

/**
 * DataNumber - Skeleton wrapper for numeric values
 * 
 * Includes optional formatting for numbers (locale, currency, percentage).
 * 
 * @example
 * ```tsx
 * <DataNumber 
 *   value={stats.total} 
 *   isLoading={isLoading}
 *   format={(v) => v.toLocaleString()}
 *   className="text-2xl font-bold"
 * />
 * ```
 */
export function DataNumber({
  value,
  isLoading,
  format,
  className,
  skeletonWidth = "w-16",
  skeletonHeight = "h-8",
}: DataNumberProps) {
  if (isLoading) {
    return <Skeleton className={cn(skeletonHeight, skeletonWidth, className)} />
  }

  const displayValue = value ?? 0
  const formattedValue = format ? format(displayValue) : displayValue

  return <span className={className}>{formattedValue}</span>
}

interface DataListProps<T> {
  /** Array of items */
  items: T[] | undefined
  /** Whether data is currently loading */
  isLoading: boolean
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode
  /** Render function for skeleton items */
  renderSkeleton: (index: number) => ReactNode
  /** Number of skeleton items to show when loading */
  skeletonCount?: number
  /** Wrapper className for the list */
  className?: string
  /** Empty state content */
  emptyState?: ReactNode
}

/**
 * DataList - Skeleton wrapper for lists/arrays of data
 * 
 * Shows skeleton items during loading, then renders actual items.
 * 
 * @example
 * ```tsx
 * <DataList
 *   items={reviews}
 *   isLoading={isLoading}
 *   skeletonCount={4}
 *   renderItem={(review) => <ReviewCard key={review.id} review={review} />}
 *   renderSkeleton={(i) => <ReviewCardSkeleton key={i} />}
 *   emptyState={<p>No reviews yet</p>}
 * />
 * ```
 */
export function DataList<T>({
  items,
  isLoading,
  renderItem,
  renderSkeleton,
  skeletonCount = 3,
  className,
  emptyState,
}: DataListProps<T>) {
  if (isLoading) {
    return (
      <div className={className}>
        {Array.from({ length: skeletonCount }).map((_, index) =>
          renderSkeleton(index)
        )}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return <>{emptyState}</>
  }

  return (
    <div className={className}>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  )
}
