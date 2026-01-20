'use client'

import { IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminStats } from "@/lib/hooks"

// Stat card with built-in skeleton support
function StatCard({
  title,
  value,
  badge,
  footer,
  subtext,
  isLoading,
}: {
  title: string
  value?: string | number
  badge?: string
  footer: string
  subtext: string
  isLoading: boolean
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            value
          )}
        </CardTitle>
        <CardAction>
          {isLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <Badge variant="outline">
              <IconTrendingUp />
              {badge}
            </Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {footer} <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground">
          {isLoading ? <Skeleton className="h-4 w-24" /> : subtext}
        </div>
      </CardFooter>
    </Card>
  )
}

export function SectionCards() {
  const { data: stats, isLoading, error } = useAdminStats()

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Stats</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Failed to load dashboard statistics'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={stats ? `KSh ${stats.monthlyRevenue.toLocaleString()}` : undefined}
        badge={stats ? `+${stats.monthlyGrowth}%` : undefined}
        footer="Trending up this month"
        subtext="Monthly subscription revenue"
        isLoading={isLoading}
      />
      <StatCard
        title="New Artisans"
        value={stats?.totalArtisans.toLocaleString()}
        badge={stats ? `+${Math.round(stats.monthlyGrowth)}%` : undefined}
        footer="Growing artisan base"
        subtext={stats ? `${stats.activeArtisans} currently active` : "Loading..."}
        isLoading={isLoading}
      />
      <StatCard
        title="Active Subscriptions"
        value={stats?.activeSubscriptions.toLocaleString()}
        badge={stats ? `+${Math.round(stats.monthlyGrowth / 2)}%` : undefined}
        footer="Strong subscriber retention"
        subtext="Revenue generating users"
        isLoading={isLoading}
      />
      <StatCard
        title="Platform Growth"
        value={stats?.totalUsers.toLocaleString()}
        badge={stats ? `+${stats.monthlyGrowth}%` : undefined}
        footer="Total platform users"
        subtext="Meets growth projections"
        isLoading={isLoading}
      />
    </div>
  )
}
