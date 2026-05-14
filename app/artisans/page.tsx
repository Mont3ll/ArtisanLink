"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Star,
  Filter,
  ChevronDown,
  BadgeCheck,
  Clock,
  ArrowLeft,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Artisan {
  id: string;
  profileId: string;
  name: string;
  profession: string | null;
  bio: string | null;
  profileImage: string | null;
  location: {
    city: string | null;
    county: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  experience: number | null;
  hourlyRate: number | null;
  isAvailable: boolean;
  isVerified: boolean;
  isPremium: boolean;
  rating: { average: number; total: number };
  specializations: Array<{ name: string; skillLevel: string }>;
  memberSince: string;
  distance: number | null;
}

interface SearchFacets {
  professions: Array<{ name: string | null; count: number }>;
  counties: Array<{ name: string | null; count: number }>;
  specializations: Array<{ name: string; count: number }>;
}

export default function BrowseArtisansPage() {
  const router = useRouter();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [profession, setProfession] = useState("");
  const [county, setCounty] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  const fetchArtisans = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (profession) params.set("profession", profession);
      if (county) params.set("county", county);
      params.set("sortBy", sortBy);
      params.set("page", page.toString());
      params.set("limit", "20");

      const res = await fetch(`/api/search/artisans?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setArtisans(data.artisans || []);
      setFacets(data.facets || null);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setArtisans([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, profession, county, sortBy, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setQuery("");
    setSearchInput("");
    setProfession("");
    setCounty("");
    setSortBy("rating");
    setPage(1);
  };

  const hasActiveFilters = query || profession || county;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header / Nav */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Back to home">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link href="/" className="font-bold text-xl text-slate-900 dark:text-slate-100">
              ChapaWorks
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Search Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Browse Skilled Artisans
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Discover verified local professionals across Kenya
          </p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by profession, name, or skill..."
                className="pl-10 h-11"
              />
            </div>
            <Button type="submit" size="lg">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <Select value={profession} onValueChange={(v) => { setProfession(v === "_all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Professions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Professions</SelectItem>
                  {facets?.professions?.filter(p => p.name).map((p) => (
                    <SelectItem key={p.name!} value={p.name!}>
                      {p.name} ({p.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={county} onValueChange={(v) => { setCounty(v === "_all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Counties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Counties</SelectItem>
                  {facets?.counties?.filter(c => c.name).map((c) => (
                    <SelectItem key={c.name!} value={c.name!}>
                      {c.name} ({c.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="rate">Hourly Rate</SelectItem>
                  <SelectItem value="recent">Newest</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-slate-500">
                  <X className="h-3.5 w-3.5" /> Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isLoading ? (
              <Skeleton className="h-4 w-32 inline-block" />
            ) : (
              <>
                Showing <strong>{artisans.length}</strong> of <strong>{total}</strong> artisans
                {query && <> for &ldquo;<em>{query}</em>&rdquo;</>}
              </>
            )}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link> to message artisans, save favourites & request jobs
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-32 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : artisans.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No artisans found</h2>
            <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artisans.map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}

        {/* CTA for non-logged-in users */}
        <div className="mt-16 bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Ready to hire a skilled artisan?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Create a free account to message artisans, save your favourites, and request job quotes.
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtisanCard({ artisan }: { artisan: Artisan }) {
  const initials = artisan.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/artisans/${artisan.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 h-32 flex items-center justify-center">
            <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900 shadow-md">
              <AvatarImage src={artisan.profileImage || undefined} alt={artisan.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {artisan.isPremium && (
              <Badge className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-xs">
                ⭐ Premium
              </Badge>
            )}
            {artisan.isAvailable && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                Available
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">
                {artisan.name}
              </h3>
              {artisan.isVerified && (
                <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              )}
            </div>

            {artisan.profession && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
                {artisan.profession}
              </p>
            )}

            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {artisan.rating.average.toFixed(1)}
                </span>
                <span className="text-xs">({artisan.rating.total})</span>
              </div>

              {(artisan.location.city || artisan.location.county) && (
                <div className="flex items-center gap-1 line-clamp-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs line-clamp-1">
                    {artisan.location.city || artisan.location.county}
                  </span>
                </div>
              )}
            </div>

            {artisan.hourlyRate && (
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2">
                KES {artisan.hourlyRate.toLocaleString()}/hr
              </p>
            )}

            {artisan.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {artisan.specializations.slice(0, 2).map((s) => (
                  <Badge key={s.name} variant="secondary" className="text-xs px-2 py-0">
                    {s.name}
                  </Badge>
                ))}
                {artisan.specializations.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{artisan.specializations.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
