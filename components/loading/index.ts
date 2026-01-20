/**
 * Loading Components
 * 
 * This module provides components for displaying loading states with skeleton animations.
 * The key principle is to preserve static structure (labels, icons, layout) while showing
 * skeleton placeholders only for dynamic data values.
 * 
 * ## Core Components
 * 
 * - `DataValue` - Generic wrapper for any dynamic value
 * - `DataText` - Wrapper optimized for text content
 * - `DataNumber` - Wrapper for numeric values with optional formatting
 * - `DataList` - Wrapper for arrays/lists with skeleton count support
 * 
 * ## Card Skeletons (for Suspense fallbacks)
 * 
 * Use these when you need full component skeletons (e.g., initial SSR load):
 * - `StatCardSkeleton` - Stat/metric cards
 * - `ReviewCardSkeleton` - Review/feedback cards  
 * - `TableSkeleton` - Data tables
 * - `MessageItemSkeleton` - Message list items
 * - `ArtisanCardSkeleton` - Artisan profile cards
 * - `PortfolioItemSkeleton` - Portfolio gallery items
 * 
 * ## Composite Components
 * 
 * - `StatCardWithSkeleton` - Card that keeps title/icon visible during loading
 * 
 * ## Usage Pattern
 * 
 * ```tsx
 * // Preferred: Keep static content visible, skeleton only for data
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Total Users</CardTitle>  // Always visible
 *   </CardHeader>
 *   <CardContent>
 *     <DataNumber
 *       value={data?.totalUsers}
 *       isLoading={isLoading}
 *       format={(v) => v.toLocaleString()}
 *       className="text-2xl font-bold"
 *     />
 *   </CardContent>
 * </Card>
 * 
 * // For lists
 * <DataList
 *   items={reviews}
 *   isLoading={isLoading}
 *   skeletonCount={4}
 *   renderItem={(review) => <ReviewCard key={review.id} review={review} />}
 *   renderSkeleton={(i) => <ReviewCardSkeleton key={i} />}
 * />
 * ```
 */

export { DataValue, DataText, DataNumber, DataList } from './data-value'
export { 
  StatCardSkeleton,
  ReviewCardSkeleton,
  UserRowSkeleton,
  TableSkeleton,
  MessageItemSkeleton,
  ArtisanCardSkeleton,
  PortfolioItemSkeleton,
  StatCardWithSkeleton,
} from './card-skeletons'
