"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PublicNav from "@/components/layout/public-nav";
import { ArtisanCard, ArtisanCardSkeleton, type ArtisanCardData } from "@/components/artisan";
import {
  Search,
  ArrowRight,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";

type Artisan = ArtisanCardData & {
  bio: string | null;
  experience: number | null;
  memberSince: string;
  distance: number | null;
  portfolioThumbnail?: string | null;
};

interface Facets {
  professions: Array<{ name: string | null; count: number }>;
  counties: Array<{ name: string | null; count: number }>;
}

export default function BrowseArtisansPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <BrowseArtisansContent />
    </Suspense>
  );
}

function BrowseArtisansContent() {
  const searchParams = useSearchParams();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize from URL search params (passed from landing page search bar)
  const [searchInput, setSearchInput] = useState(() => searchParams.get("q") || "");
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [profession, setProfession] = useState(() => searchParams.get("profession") || "");
  const [county, setCounty] = useState(() => searchParams.get("county") || "");
  const [sortBy, setSortBy] = useState(() => searchParams.get("sortBy") || "rating");

  const fetchArtisans = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (profession) params.set("profession", profession);
    if (county) params.set("county", county);
    params.set("sortBy", sortBy);
    params.set("page", String(page));
    params.set("limit", "12");

    fetch(`/api/search/artisans?${params}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setArtisans(data.artisans || []);
        setFacets(data.facets || null);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch(() => setArtisans([]))
      .finally(() => setIsLoading(false));
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

  const hasFilters = query || profession || county;

  return (
    <div className="bg-white text-[#222] min-h-screen">
      <PublicNav />

      {/* Sticky search + filter bar — matches homepage pill style */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-[#ddd]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <form
            onSubmit={handleSearch}
            className="flex items-stretch bg-white rounded-full border border-[#ddd] shadow-[rgba(0,0,0,0.02)_0_0_0_1px,rgba(0,0,0,0.04)_0_2px_6px,rgba(0,0,0,0.1)_0_4px_8px] overflow-hidden h-11"
          >
            <div className="flex-1 flex items-center gap-2 px-4 min-w-0">
              <Search className="w-4 h-4 text-[#6a6a6a] flex-shrink-0" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Profession, name, or skill…"
                className="w-full text-sm outline-none placeholder:text-[#929292] bg-transparent text-[#222]"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setQuery(''); setPage(1); }} className="text-[#929292] hover:text-[#222] flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="w-px bg-[#ddd] self-stretch" />
            {/* Filter toggle integrated into search bar */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 text-sm transition-colors ${
                showFilters || hasFilters ? 'text-emerald-700' : 'text-[#6a6a6a] hover:text-[#222]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
            </button>
            <button
              type="submit"
              className="m-1.5 px-4 bg-emerald-700 hover:bg-emerald-800 transition-colors rounded-full text-white text-sm font-medium flex-shrink-0"
            >
              Search
            </button>
          </form>

          {/* Active filter pills */}
          {hasFilters && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {profession && (
                <button onClick={() => { setProfession(''); setPage(1); }} className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                  {profession} <X className="w-3 h-3" />
                </button>
              )}
              {county && (
                <button onClick={() => { setCounty(''); setPage(1); }} className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                  {county} <X className="w-3 h-3" />
                </button>
              )}
              {query && (
                <button onClick={() => { setQuery(''); setSearchInput(''); setPage(1); }} className="flex items-center gap-1 px-2.5 py-1 bg-[#f7f7f7] text-[#6a6a6a] border border-[#ddd] rounded-full text-xs">
                  &ldquo;{query}&rdquo; <X className="w-3 h-3" />
                </button>
              )}
              <button onClick={clearFilters} className="text-xs text-[#6a6a6a] hover:text-[#3f3f3f] underline">Clear all</button>
            </div>
          )}

          {/* Expanded filter dropdowns */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-xl border border-[#ddd] p-5 grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-2">Profession</label>
                <div className="relative">
                  <select
                    value={profession}
                    onChange={(e) => { setProfession(e.target.value); setPage(1); }}
                    className="w-full appearance-none bg-white border border-[#ddd] rounded-lg px-3 py-2 text-sm text-[#222] outline-none focus:border-emerald-600 pr-8"
                  >
                    <option value="">All Professions</option>
                    {facets?.professions?.filter(p => p.name).map((p) => (
                      <option key={p.name!} value={p.name!}>{p.name} ({p.count})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-[#929292] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-2">County</label>
                <div className="relative">
                  <select
                    value={county}
                    onChange={(e) => { setCounty(e.target.value); setPage(1); }}
                    className="w-full appearance-none bg-white border border-[#ddd] rounded-lg px-3 py-2 text-sm text-[#222] outline-none focus:border-emerald-600 pr-8"
                  >
                    <option value="">All Counties</option>
                    {facets?.counties?.filter(c => c.name).map((c) => (
                      <option key={c.name!} value={c.name!}>{c.name} ({c.count})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-[#929292] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-2">Sort By</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="w-full appearance-none bg-white border border-[#ddd] rounded-lg px-3 py-2 text-sm text-[#222] outline-none focus:border-emerald-600 pr-8"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="rate">Hourly Rate</option>
                    <option value="recent">Newest</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-[#929292] pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Count */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-[#6a6a6a] text-sm">
              {isLoading ? (
                <span className="inline-block w-32 h-4 bg-[#f2f2f2] rounded animate-pulse" />
              ) : (
                <>Showing <strong className="text-[#222]">{artisans.length}</strong> of <strong className="text-[#222]">{total}</strong> artisans{query && <> for "<em>{query}</em>"</>}</>
              )}
            </p>
            <p className="text-xs text-[#929292] hidden sm:block">
              <Link href="/sign-in" className="text-emerald-700 hover:underline">Sign in</Link> to message & save favourites
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  {/* Photo area — matches ArtisanCard */}
                  <div className="aspect-square rounded-xl bg-[#f2f2f2] mb-3" />
                  {/* Name + rating row */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="h-4 bg-[#f2f2f2] rounded w-3/4" />
                    <div className="h-3.5 bg-[#f2f2f2] rounded w-8 flex-shrink-0" />
                  </div>
                  {/* Profession + location */}
                  <div className="h-3.5 bg-[#f2f2f2] rounded w-2/3 mb-1" />
                  {/* Price */}
                  <div className="h-3.5 bg-[#f2f2f2] rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : artisans.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-[#c1c1c1] mx-auto mb-4" />
              <h2 className="text-xl font-serif font-bold text-[#3f3f3f] mb-2">No artisans found</h2>
              <p className="text-[#6a6a6a] mb-6">Try adjusting your search or clearing filters</p>
              <button onClick={clearFilters} className="bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-800 transition-colors">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artisans.map((artisan, i) => (
                <ArtisanCard key={artisan.id || i} artisan={artisan} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-5 py-2.5 border border-[#ddd] rounded-lg text-sm font-medium hover:bg-[#f2f2f2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-[#6a6a6a]">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-5 py-2.5 border border-[#ddd] rounded-lg text-sm font-medium hover:bg-[#f2f2f2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Sign-up CTA */}
          <div className="mt-16 bg-emerald-800 text-white rounded-2xl p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">
              Ready to hire a skilled artisan?
            </h2>
            <p className="text-emerald-200 mb-8 max-w-md mx-auto">
              Create a free account to message artisans, save favourites, and request job quotes.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/sign-up" className="bg-amber-400 text-amber-900 px-8 py-3 rounded-lg font-bold hover:bg-amber-300 transition-colors">
                Create Free Account
              </Link>
              <Link href="/sign-in" className="border border-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

