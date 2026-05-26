"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Search,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import {
  ArtisanCardSkeleton,
  ArtisanPreviewCard,
  type ArtisanCardData,
} from "./artisan-preview-card";
import { PortfolioQuickView } from "./portfolio-quick-view";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

const PAGE_SIZE = 4;

type SortBy = "rating" | "reviews" | "rate" | "recent";

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="flex cursor-pointer items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-[13px] leading-[1.23] transition-colors hover:bg-[#f7f7f7]"
      style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
    >
      {label}
      <X size={13} style={{ color: COLORS.muted }} />
    </button>
  );
}

function EmptyArtisanState({
  activeCategory,
  onReset,
}: {
  activeCategory: string;
  onReset: () => void;
}) {
  return (
    <div
      className="col-span-full rounded-[24px] border px-5 py-12 text-center"
      style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}
    >
      <div
        className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-white"
        style={{ color: COLORS.primary }}
      >
        <Search size={20} />
      </div>
      <h3 className="text-[20px] font-semibold leading-[1.2]" style={{ color: COLORS.ink }}>
        No {activeCategory.toLowerCase()} artisans found
      </h3>
      <p className="mx-auto mt-2 max-w-[420px] text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>
        Try another category, location, or search term.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 cursor-pointer rounded-lg border px-4 py-2 text-[14px] font-medium transition-colors hover:bg-white"
        style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
      >
        Show all artisans
      </button>
    </div>
  );
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function BrowseDirectorySection({
  initialArtisans,
  initialProfessions,
  initialCounties,
}: {
  initialArtisans: ArtisanCardData[];
  initialProfessions: string[];
  initialCounties: string[];
}) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? searchParams.get("query") ?? "");
  const [profession, setProfession] = useState(() => searchParams.get("profession") ?? "All professions");
  const [county, setCounty] = useState(() => searchParams.get("county") ?? "All counties");
  const [sortBy, setSortBy] = useState<SortBy>(() => {
    const value = searchParams.get("sortBy");
    return value === "reviews" || value === "rate" || value === "recent" ? value : "rating";
  });
  const [availableOnly, setAvailableOnly] = useState(() => searchParams.get("available") === "true");
  const [verifiedOnly, setVerifiedOnly] = useState(() => searchParams.get("verified") === "true");
  const [page, setPage] = useState(1);
  const [selectedPortfolioArtisan, setSelectedPortfolioArtisan] = useState<ArtisanCardData | null>(null);

  const professions = useMemo(
    () => [
      "All professions",
      ...uniqueSorted([
        ...initialProfessions,
        ...initialArtisans.map((artisan) => artisan.profession),
      ]),
    ],
    [initialArtisans, initialProfessions],
  );

  const counties = useMemo(
    () => [
      "All counties",
      ...uniqueSorted([
        ...initialCounties,
        ...initialArtisans.map((artisan) => artisan.location.county),
      ]),
    ],
    [initialArtisans, initialCounties],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = initialArtisans.filter((artisan) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          artisan.name,
          artisan.profession,
          artisan.location.city,
          artisan.location.county,
          ...artisan.specializations.map((item) => item.name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesProfession =
        profession === "All professions" || artisan.profession === profession;
      const matchesCounty =
        county === "All counties" || artisan.location.county === county;
      const matchesAvailability = !availableOnly || artisan.isAvailable;

      return matchesQuery && matchesProfession && matchesCounty && matchesAvailability;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "reviews") return b.rating.total - a.rating.total;
      if (sortBy === "rate") return (a.hourlyRate ?? Number.MAX_SAFE_INTEGER) - (b.hourlyRate ?? Number.MAX_SAFE_INTEGER);
      if (sortBy === "recent") return 0;
      return b.rating.average - a.rating.average;
    });
  }, [availableOnly, county, initialArtisans, profession, query, sortBy, verifiedOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [availableOnly, county, profession, query, sortBy]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const hasFilters =
    query || profession !== "All professions" || county !== "All counties" || availableOnly || verifiedOnly;

  const resetFilters = () => {
    setQuery("");
    setProfession("All professions");
    setCounty("All counties");
    setAvailableOnly(false);
    setVerifiedOnly(false);
    setSortBy("rating");
    setPage(1);
  };

  return (
    <>
      <section
        className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16"
        id="browse-artisans"
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[640px]">
            <p className="mb-2 text-[14px] font-medium leading-[1.29]" style={{ color: COLORS.muted }}>
              Artisan directory
            </p>
            <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] md:text-[32px]" style={{ color: COLORS.ink }}>
              Discover skilled professionals
            </h1>
            <p className="mt-2 text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>
              Search by skill, profession, county, availability, rating, rate, and review history.
            </p>
          </div>
          <div
            className="rounded-full border bg-white px-4 py-2 text-[14px] leading-[1.29]"
            style={{ borderColor: COLORS.hairlineSoft, color: COLORS.body }}
          >
            {filtered.length} result{filtered.length === 1 ? "" : "s"} found
          </div>
        </div>

        <div
          className="rounded-[28px] border bg-white p-4 md:p-5"
          style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}
        >
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_0.9fr_auto]">
            <label
              className="flex h-14 items-center gap-3 rounded-full border bg-white px-4"
              style={{ borderColor: COLORS.hairline }}
            >
              <Search size={18} strokeWidth={2.5} style={{ color: COLORS.ink }} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search skill, artisan, or location"
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-[1.43] outline-none placeholder:text-[#929292]"
                style={{ color: COLORS.ink }}
              />
            </label>

            <select
              value={profession}
              onChange={(event) => setProfession(event.target.value)}
              className="h-14 cursor-pointer rounded-full border bg-white px-4 text-[14px] outline-none"
              style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
            >
              {professions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={county}
              onChange={(event) => setCounty(event.target.value)}
              className="h-14 cursor-pointer rounded-full border bg-white px-4 text-[14px] outline-none"
              style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
            >
              {counties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="h-14 cursor-pointer rounded-full border bg-white px-4 text-[14px] outline-none"
              style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
            >
              <option value="rating">Sort: Rating</option>
              <option value="reviews">Sort: Reviews</option>
              <option value="rate">Sort: Rate</option>
              <option value="recent">Sort: Recent</option>
            </select>

            <button
              type="button"
              onClick={() => setAvailableOnly((value) => !value)}
              className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
              style={{
                borderColor: availableOnly ? COLORS.ink : COLORS.hairline,
                color: COLORS.ink,
                background: availableOnly ? COLORS.surfaceSoft : COLORS.canvas,
              }}
            >
              <ListFilter size={16} />
              Available
            </button>
            <button
              type="button"
              onClick={() => setVerifiedOnly((value) => !value)}
              className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
              style={{
                borderColor: verifiedOnly ? COLORS.ink : COLORS.hairline,
                color: COLORS.ink,
                background: verifiedOnly ? COLORS.surfaceSoft : COLORS.canvas,
              }}
            >
              <BadgeCheck size={16} />
              Verified
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {query && <FilterChip label={`Search: ${query}`} onRemove={() => setQuery("")} />}
              {profession !== "All professions" && (
                <FilterChip label={profession} onRemove={() => setProfession("All professions")} />
              )}
              {county !== "All counties" && (
                <FilterChip label={county} onRemove={() => setCounty("All counties")} />
              )}
              {availableOnly && <FilterChip label="Available now" onRemove={() => setAvailableOnly(false)} />}
              {verifiedOnly && <FilterChip label="Verified only" onRemove={() => setVerifiedOnly(false)} />}
              {!hasFilters && (
                <span className="text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>
                  No active filters. Showing recommended artisans.
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="w-fit cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline"
              style={{ color: COLORS.ink }}
            >
              Reset filters
            </button>
          </div>
        </div>

        <div
          className="mt-5 rounded-[18px] border px-4 py-3 text-[14px] leading-[1.43]"
          style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft, color: COLORS.body }}
        >
          Sign in to message artisans, save profiles, and start job requests. Public browsing remains available for discovery.
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.length === 0 ? (
              <EmptyArtisanState
                activeCategory={profession !== "All professions" ? profession : "directory"}
                onReset={resetFilters}
              />
            ) : (
              visible.map((artisan) => (
                <motion.div
                  key={`browse-${artisan.id}`}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.985 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ArtisanPreviewCard artisan={artisan} onOpenPortfolio={setSelectedPortfolioArtisan} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div
          className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-5 md:flex-row"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <p className="text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>
            Page {page} of {totalPages} · Showing {visible.length} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="flex h-10 cursor-pointer items-center gap-1 rounded-lg border px-3 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="flex h-10 cursor-pointer items-center gap-1 rounded-lg border px-3 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <PortfolioQuickView
        artisan={selectedPortfolioArtisan}
        onClose={() => setSelectedPortfolioArtisan(null)}
      />
    </>
  );
}

export function BrowseDirectorySkeleton() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16">
      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ArtisanCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
