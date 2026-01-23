"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  HeartOff,
  MessageSquare,
  Clock,
  BadgeCheck,
  Loader2,
  Users,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  useSavedArtisansPage,
  useRemoveSavedArtisan,
  type SavedArtisanFull,
} from "@/lib/hooks";

// Saved Artisan Card Component
function SavedArtisanCard({
  saved,
  onRemove,
  isRemoving,
}: {
  saved: SavedArtisanFull;
  onRemove: (artisanId: string) => void;
  isRemoving: boolean;
}) {
  const { artisan } = saved;
  const initials = artisan.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const savedDate = new Date(saved.savedAt).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className={cn("group transition-all duration-300", isRemoving && "opacity-50")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={artisan.profileImage || undefined} alt={artisan.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{artisan.name}</CardTitle>
                {artisan.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <CardDescription className="text-sm">
                {artisan.profession || "Artisan"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {artisan.isAvailable && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Available
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        {/* Rating and Experience */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{artisan.rating.average.toFixed(1)}</span>
            <span className="text-muted-foreground">({artisan.rating.total} reviews)</span>
          </div>
          {artisan.experience && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{artisan.experience} years exp.</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>
            {[artisan.location.city, artisan.location.county]
              .filter(Boolean)
              .join(", ") || "Kenya"}
          </span>
        </div>

        {/* Bio */}
        {artisan.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {artisan.bio}
          </p>
        )}

        {/* Specializations */}
        {artisan.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artisan.specializations.slice(0, 4).map((spec) => (
              <Badge key={spec.name} variant="secondary" className="text-xs">
                {spec.name}
              </Badge>
            ))}
            {artisan.specializations.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{artisan.specializations.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Hourly Rate */}
        <div className="pt-2">
          {artisan.hourlyRate ? (
            <p className="text-lg font-semibold">
              KES {artisan.hourlyRate.toLocaleString()}/hr
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Rate on request</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Saved on {savedDate}
        </p>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <HeartOff className="h-3 w-3 mr-1" />
                )}
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from saved?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {artisan.name} from your saved artisans?
                  You can always save them again later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(artisan.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                Actions
                <MoreHorizontal className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/client-dashboard/messages?artisan=${artisan.id}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/client-dashboard/reviews?artisan=${artisan.id}`}>
                  <Star className="h-4 w-4 mr-2" />
                  Write Review
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}

// Skeleton for loading state
function SavedArtisanCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-18" />
        </div>
        <Skeleton className="h-6 w-32" />
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function SavedArtisansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // React Query hooks
  const { data, isLoading } = useSavedArtisansPage({
    page,
    limit: 12,
  });

  const removeMutation = useRemoveSavedArtisan();

  const savedArtisans = data?.items ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 12, total: 0, totalPages: 0 };

  // Filter artisans based on search query (client-side)
  const filteredArtisans = useMemo(() => {
    if (!searchQuery.trim()) {
      return savedArtisans;
    }

    const query = searchQuery.toLowerCase();
    return savedArtisans.filter((saved) => {
      const { artisan } = saved;
      return (
        artisan.name.toLowerCase().includes(query) ||
        artisan.profession?.toLowerCase().includes(query) ||
        artisan.location.city?.toLowerCase().includes(query) ||
        artisan.location.county?.toLowerCase().includes(query) ||
        artisan.specializations.some((s) =>
          s.name.toLowerCase().includes(query)
        )
      );
    });
  }, [searchQuery, savedArtisans]);

  // Handle remove artisan
  const handleRemove = (artisanId: string) => {
    removeMutation.mutate(artisanId);
  };

  // Pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header - Always visible */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Artisans</h1>
          <p className="text-muted-foreground">
            Your favorite artisans for quick access
          </p>
        </div>
        <Button asChild>
          <Link href="/client-dashboard/find-artisans">
            <Search className="h-4 w-4 mr-2" />
            Find More Artisans
          </Link>
        </Button>
      </div>

      {/* Search and Stats - Always visible */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved artisans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span>{pagination.total} artisan{pagination.total !== 1 ? "s" : ""} saved</span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SavedArtisanCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredArtisans.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {savedArtisans.length === 0
                ? "No saved artisans yet"
                : "No artisans match your search"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {savedArtisans.length === 0
                ? "Start exploring and save artisans you like for easy access later"
                : "Try adjusting your search query"}
            </p>
            {savedArtisans.length === 0 && (
              <Button asChild>
                <Link href="/client-dashboard/find-artisans">
                  <Search className="h-4 w-4 mr-2" />
                  Find Artisans
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Artisan Cards Grid */}
      {!isLoading && filteredArtisans.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArtisans.map((saved) => (
            <SavedArtisanCard
              key={saved.id}
              saved={saved}
              onRemove={handleRemove}
              isRemoving={removeMutation.isPending && removeMutation.variables === saved.artisan.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
