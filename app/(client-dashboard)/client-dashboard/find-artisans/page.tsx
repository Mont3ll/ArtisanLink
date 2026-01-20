"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Filter,
  X,
  MessageSquare,
  Heart,
  Clock,
  BadgeCheck,
  Grid3X3,
  List,
  Loader2,
  History,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  useArtisanSearch,
  useSearchHistory,
  useSavedArtisanIds,
  useToggleSaveArtisan,
  useRecordSearch,
  useClearSearchHistory,
  useDeleteSearchHistoryItem,
  type Artisan,
  type SearchFacets,
  type SearchHistoryItem,
} from "@/lib/hooks";

// Artisan Card Component
function ArtisanCard({
  artisan,
  onSave,
  isSaved,
}: {
  artisan: Artisan;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}) {
  const initials = artisan.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={artisan.profileImage || undefined} alt={artisan.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{artisan.name}</CardTitle>
                {artisan.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <CardDescription className="text-sm">
                {artisan.profession || "Artisan"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onSave?.(artisan.profileId)}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {/* Rating and Reviews */}
        <div className="flex items-center gap-4 text-sm mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{artisan.rating.average.toFixed(1)}</span>
            <span className="text-muted-foreground">({artisan.rating.total})</span>
          </div>
          {artisan.experience && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{artisan.experience} yrs</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span>
            {[artisan.location.city, artisan.location.county]
              .filter(Boolean)
              .join(", ") || "Kenya"}
          </span>
          {artisan.distance !== null && (
            <span className="ml-1">({artisan.distance} km away)</span>
          )}
        </div>

        {/* Bio */}
        {artisan.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {artisan.bio}
          </p>
        )}

        {/* Specializations */}
        {artisan.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artisan.specializations.slice(0, 3).map((spec) => (
              <Badge key={spec.name} variant="secondary" className="text-xs">
                {spec.name}
              </Badge>
            ))}
            {artisan.specializations.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{artisan.specializations.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 border-t flex items-center justify-between">
        <div>
          {artisan.hourlyRate ? (
            <p className="text-sm font-medium">
              KES {artisan.hourlyRate.toLocaleString()}/hr
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Rate on request</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {artisan.isAvailable && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Available
            </Badge>
          )}
          <Button size="sm" asChild>
            <Link href={`/client-dashboard/messages?artisan=${artisan.id}`}>
              <MessageSquare className="h-3 w-3 mr-1" />
              Contact
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Skeleton for loading state
function ArtisanCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
}

// Filter Sidebar Component
function FilterSidebar({
  facets,
  filters,
  onFilterChange,
  onReset,
  isLoading,
}: {
  facets: SearchFacets | null;
  filters: {
    profession: string;
    county: string;
    minRating: string;
    available: boolean;
    verified: boolean;
  };
  onFilterChange: (key: string, value: string | boolean) => void;
  onReset: () => void;
  isLoading: boolean;
}) {
  const hasFilters =
    filters.profession ||
    filters.county ||
    filters.minRating ||
    filters.available ||
    filters.verified;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <Separator />

      {/* Profession Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Profession</Label>
        <Select
          value={filters.profession || "all"}
          onValueChange={(value) => onFilterChange("profession", value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All professions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All professions</SelectItem>
            {isLoading ? (
              <div className="p-2">
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              facets?.professions
                .filter((p) => p.name)
                .map((prof) => (
                  <SelectItem key={prof.name} value={prof.name!}>
                    {prof.name} ({prof.count})
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* County/Location Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Location</Label>
        <Select
          value={filters.county || "all"}
          onValueChange={(value) => onFilterChange("county", value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All counties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All counties</SelectItem>
            {isLoading ? (
              <div className="p-2">
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              facets?.counties
                .filter((c) => c.name)
                .map((county) => (
                  <SelectItem key={county.name} value={county.name!}>
                    {county.name} ({county.count})
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Minimum Rating</Label>
        <Select
          value={filters.minRating || "any"}
          onValueChange={(value) => onFilterChange("minRating", value === "any" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any rating</SelectItem>
            <SelectItem value="4.5">4.5+ stars</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="3.5">3.5+ stars</SelectItem>
            <SelectItem value="3">3+ stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Availability Filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="available"
          checked={filters.available}
          onCheckedChange={(checked) =>
            onFilterChange("available", checked === true)
          }
        />
        <Label htmlFor="available" className="text-sm cursor-pointer">
          Available now
        </Label>
      </div>

      {/* Verified Filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="verified"
          checked={filters.verified}
          onCheckedChange={(checked) =>
            onFilterChange("verified", checked === true)
          }
        />
        <Label htmlFor="verified" className="text-sm cursor-pointer">
          Verified only
        </Label>
      </div>
    </div>
  );
}

export default function FindArtisansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showHistory, setShowHistory] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "rating");
  const [page, setPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    profession: searchParams.get("profession") || "",
    county: searchParams.get("county") || "",
    minRating: searchParams.get("minRating") || "",
    available: searchParams.get("available") === "true",
    verified: searchParams.get("verified") === "true",
  });

  // Search filters for the query
  const searchFilters = useMemo(() => ({
    query: searchQuery || undefined,
    profession: filters.profession || undefined,
    county: filters.county || undefined,
    minRating: filters.minRating || undefined,
    available: filters.available || undefined,
    verified: filters.verified || undefined,
    sortBy,
    page,
    limit: 12,
  }), [searchQuery, filters, sortBy, page]);

  // React Query hooks
  const { data: searchData, isLoading: isSearching } = useArtisanSearch(searchFilters);
  const { data: searchHistory = [], isLoading: isLoadingHistory } = useSearchHistory(10);
  const { data: savedArtisans = new Set() } = useSavedArtisanIds();
  const toggleSaveMutation = useToggleSaveArtisan();
  const recordSearchMutation = useRecordSearch();
  const clearHistoryMutation = useClearSearchHistory();
  const deleteHistoryItemMutation = useDeleteSearchHistoryItem();

  // Derived data
  const artisans = searchData?.artisans ?? [];
  const facets = searchData?.facets ?? null;
  const pagination = searchData?.pagination ?? { page: 1, limit: 12, total: 0, totalPages: 0 };

  // Record search on successful fetch (debounced by query change)
  useEffect(() => {
    if (searchData && page === 1) {
      const hasSearch = searchQuery || filters.profession || filters.county;
      if (hasSearch) {
        recordSearchMutation.mutate({
          query: searchQuery || undefined,
          profession: filters.profession || undefined,
          location: filters.county || undefined,
          minRating: filters.minRating ? parseFloat(filters.minRating) : undefined,
          resultCount: searchData.pagination.total,
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData?.pagination.total, page]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      profession: "",
      county: "",
      minRating: "",
      available: false,
      verified: false,
    });
    setSearchQuery("");
    setPage(1);
  };

  // Handle save artisan
  const handleSaveArtisan = (profileId: string) => {
    const isSaved = savedArtisans.has(profileId);
    toggleSaveMutation.mutate({ profileId, isSaved });
  };

  // Apply search from history
  const applySearchFromHistory = (item: SearchHistoryItem) => {
    if (item.query) setSearchQuery(item.query);
    setFilters((prev) => ({
      ...prev,
      profession: item.profession || "",
      county: item.location || "",
      minRating: item.minRating?.toString() || "",
    }));
    setShowHistory(false);
    setPage(1);
  };

  // Pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Artisans</h1>
        <p className="text-muted-foreground">
          Discover skilled artisans for your projects
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <DropdownMenu open={showHistory} onOpenChange={setShowHistory}>
            <DropdownMenuTrigger asChild>
              <Input
                ref={searchInputRef}
                placeholder="Search by name, profession, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
                className="pl-9"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-[--radix-dropdown-menu-trigger-width] p-0" 
              align="start"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <History className="h-4 w-4" />
                    Recent Searches
                  </span>
                  {searchHistory.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => clearHistoryMutation.mutate()}
                      disabled={clearHistoryMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>
                <Separator className="mb-2" />
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : searchHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent searches
                  </p>
                ) : (
                  <div className="space-y-1">
                    {searchHistory.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                        onClick={() => applySearchFromHistory(item)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <Search className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">
                              {item.query || item.profession || item.location || "All artisans"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 ml-5">
                            {item.profession && (
                              <Badge variant="outline" className="text-xs py-0 h-4">
                                {item.profession}
                              </Badge>
                            )}
                            {item.location && (
                              <Badge variant="outline" className="text-xs py-0 h-4">
                                <MapPin className="h-2 w-2 mr-0.5" />
                                {item.location}
                              </Badge>
                            )}
                            {item.resultCount !== null && (
                              <span>{item.resultCount} results</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItemMutation.mutate(item.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button type="submit">Search</Button>

        {/* Mobile Filter Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow down your search results
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterSidebar
                facets={facets}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                isLoading={isSearching}
              />
            </div>
          </SheetContent>
        </Sheet>
      </form>

      {/* Active Filters Display */}
      {(filters.profession ||
        filters.county ||
        filters.minRating ||
        filters.available ||
        filters.verified) && (
        <div className="flex flex-wrap gap-2">
          {filters.profession && (
            <Badge variant="secondary" className="gap-1">
              {filters.profession}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("profession", "")}
              />
            </Badge>
          )}
          {filters.county && (
            <Badge variant="secondary" className="gap-1">
              {filters.county}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("county", "")}
              />
            </Badge>
          )}
          {filters.minRating && (
            <Badge variant="secondary" className="gap-1">
              {filters.minRating}+ stars
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("minRating", "")}
              />
            </Badge>
          )}
          {filters.available && (
            <Badge variant="secondary" className="gap-1">
              Available
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("available", false)}
              />
            </Badge>
          )}
          {filters.verified && (
            <Badge variant="secondary" className="gap-1">
              Verified
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("verified", false)}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card className="sticky top-4">
            <CardContent className="p-4">
              <FilterSidebar
                facets={facets}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                isLoading={isSearching}
              />
            </CardContent>
          </Card>
        </aside>

        {/* Results */}
        <div className="flex-1 space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isSearching ? (
                <Skeleton className="h-4 w-32 inline-block" />
              ) : (
                <>
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  artisans
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="rate">Hourly Rate</SelectItem>
                  <SelectItem value="recent">Recently Joined</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-l-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Artisan Grid/List */}
          {isSearching ? (
            <div
              className={cn(
                "grid gap-4",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <ArtisanCardSkeleton key={i} />
              ))}
            </div>
          ) : artisans.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No artisans found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={handleResetFilters}>
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div
              className={cn(
                "grid gap-4",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {artisans.map((artisan) => (
                <ArtisanCard
                  key={artisan.profileId}
                  artisan={artisan}
                  onSave={handleSaveArtisan}
                  isSaved={savedArtisans.has(artisan.profileId)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isSearching && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }).map(
                  (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pagination.page === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        className="w-9"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>

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
      </div>
    </div>
  );
}
