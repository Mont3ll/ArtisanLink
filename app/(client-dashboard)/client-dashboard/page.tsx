"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Search, MessageSquare, Calendar, Star, Users, Hammer } from "lucide-react";

import { 
  useClientStats, 
  useRecentSearches, 
  useActiveProjects, 
  useSavedArtisans,
  type ActiveProject,
  type SavedArtisan,
  type RecentSearch,
} from "@/lib/hooks/use-client-dashboard";
import { DataNumber, StatCardWithSkeleton, DataList } from "@/components/loading";

// Skeleton components for list items
function SearchItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

function ProjectItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  );
}

function ArtisanItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export default function ClientDashboardPage() {
  // Independent data fetches - each section loads when ready
  const { data: stats, isLoading: statsLoading } = useClientStats();
  const { data: recentSearches = [], isLoading: searchesLoading } = useRecentSearches();
  const { data: activeProjects = [], isLoading: projectsLoading } = useActiveProjects();
  const { data: savedArtisans = [], isLoading: artisansLoading } = useSavedArtisans();

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header - Always visible */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">Find and hire skilled artisans for your projects</p>
        </div>
        <Button className="w-fit" asChild>
          <Link href="/client-dashboard/find-artisans">
            <Search className="w-4 h-4 mr-2" />
            Find Artisans
          </Link>
        </Button>
      </div>

      {/* Stats Cards - Static labels visible, values show skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardWithSkeleton
          title="Total Projects"
          icon={<Hammer className="h-4 w-4 text-muted-foreground" />}
          isLoading={statsLoading}
        >
          <DataNumber 
            value={stats?.totalProjects} 
            isLoading={statsLoading}
            className="text-2xl font-bold"
          />
          <p className="text-xs text-muted-foreground">All time</p>
        </StatCardWithSkeleton>
        
        <StatCardWithSkeleton
          title="Active Projects"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          isLoading={statsLoading}
        >
          <DataNumber 
            value={stats?.activeProjects} 
            isLoading={statsLoading}
            className="text-2xl font-bold"
          />
          <p className="text-xs text-muted-foreground">In progress</p>
        </StatCardWithSkeleton>
        
        <StatCardWithSkeleton
          title="Completed"
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
          isLoading={statsLoading}
        >
          <DataNumber 
            value={stats?.completedProjects} 
            isLoading={statsLoading}
            className="text-2xl font-bold"
          />
          <p className="text-xs text-muted-foreground">Successfully finished</p>
        </StatCardWithSkeleton>
        
        <StatCardWithSkeleton
          title="Saved Artisans"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={statsLoading}
        >
          <DataNumber 
            value={stats?.savedArtisans} 
            isLoading={statsLoading}
            className="text-2xl font-bold"
          />
          <p className="text-xs text-muted-foreground">In your favorites</p>
        </StatCardWithSkeleton>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 flex items-center gap-3 justify-start" asChild>
              <Link href="/client-dashboard/map">
                <MapPin className="w-5 h-5" />
                Find Nearby Artisans
              </Link>
            </Button>
            <Button variant="outline" className="h-16 flex items-center gap-3 justify-start" asChild>
              <Link href="/client-dashboard/find-artisans">
                <Calendar className="w-5 h-5" />
                Schedule Service
              </Link>
            </Button>
            <Button variant="outline" className="h-16 flex items-center gap-3 justify-start" asChild>
              <Link href="/client-dashboard/messages">
                <MessageSquare className="w-5 h-5" />
                Message History
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Searches - Static card structure, list content loads independently */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Searches</CardTitle>
          <CardDescription>Your recent artisan searches</CardDescription>
        </CardHeader>
        <CardContent>
          <DataList
            items={recentSearches}
            isLoading={searchesLoading}
            skeletonCount={3}
            className="space-y-3"
            renderItem={(search: RecentSearch) => (
              <div key={search.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{search.query}</span>
                </div>
                <span className="text-sm text-muted-foreground">{search.timestamp}</span>
              </div>
            )}
            renderSkeleton={(i) => <SearchItemSkeleton key={i} />}
            emptyState={
              <p className="text-center text-muted-foreground py-4">
                No recent searches. Start finding artisans!
              </p>
            }
          />
        </CardContent>
      </Card>

      {/* Projects and Saved Artisans - Each loads independently */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Your ongoing and scheduled projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataList
              items={activeProjects}
              isLoading={projectsLoading}
              skeletonCount={2}
              className="space-y-4"
              renderItem={(project: ActiveProject) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{project.service}</p>
                    <p className="text-sm text-muted-foreground">by {project.artisan}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {project.location}
                      <Calendar className="w-3 h-3 ml-2" />
                      {project.startDate}
                    </div>
                  </div>
                  <Badge variant={project.status === "IN_PROGRESS" ? "default" : "secondary"}>
                    {formatStatus(project.status)}
                  </Badge>
                </div>
              )}
              renderSkeleton={(i) => <ProjectItemSkeleton key={i} />}
              emptyState={
                <p className="text-center text-muted-foreground py-4">
                  No active projects
                </p>
              }
            />
            <Button variant="outline" className="w-full" asChild>
              <Link href="/client-dashboard/projects">View All Projects</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Artisans</CardTitle>
            <CardDescription>Your favorite artisans for quick hiring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataList
              items={savedArtisans}
              isLoading={artisansLoading}
              skeletonCount={2}
              className="space-y-4"
              renderItem={(artisan: SavedArtisan) => (
                <div key={artisan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">{artisan.name}</p>
                      <p className="text-sm text-muted-foreground">{artisan.profession}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {artisan.rating}
                        <MapPin className="w-3 h-3 ml-1" />
                        {artisan.location}
                      </div>
                    </div>
                  </div>
                  <Button size="sm">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Contact
                  </Button>
                </div>
              )}
              renderSkeleton={(i) => <ArtisanItemSkeleton key={i} />}
              emptyState={
                <p className="text-center text-muted-foreground py-4">
                  No saved artisans yet
                </p>
              }
            />
            <Button variant="outline" className="w-full" asChild>
              <Link href="/client-dashboard/saved">View All Saved</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
