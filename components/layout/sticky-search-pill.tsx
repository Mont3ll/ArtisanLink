"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface StickySearchPillProps {
  /* What segment */
  searchInput: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;

  /* Where segment */
  county: string;
  onCountyChange: (v: string) => void;
  counties?: Array<{ name: string | null; count: number }>;

  /* Sort segment */
  sortBy: string;
  onSortByChange: (v: string) => void;

  /* State helpers */
  onClear: () => void;
  hasFilters: boolean;
}

/**
 * StickySearchPill
 *
 * ONE component. In the expanded (unstuck) state it shows three segments
 * inside a 64 px pill — "Profession", "County", "Sort" — like Airbnb's
 * Where / Check-in / Check-out / Who pill.
 *
 * As the user scrolls and the pill enters the fixed nav zone (top:10px
 * via position:sticky), it transitions to a compact 44 px single-input
 * pill. All via CSS transitions on a single <form> element.
 *
 * No external filter panel.
 */
export default function StickySearchPill({
  searchInput, onSearchChange, onSearchSubmit,
  county, onCountyChange, counties = [],
  sortBy, onSortByChange,
  onClear, hasFilters,
}: StickySearchPillProps) {
  const [stuck, setStuck] = useState(false);
  const [focusedSegment, setFocusedSegment] = useState<"what" | "where" | "sort" | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* Detect when the pill enters the nav zone */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const sortOptions = [
    { value: "rating",  label: "Highest Rated" },
    { value: "reviews", label: "Most Reviews" },
    { value: "rate",    label: "Hourly Rate" },
    { value: "recent",  label: "Newest" },
  ];
  const activeSortLabel = sortOptions.find(o => o.value === sortBy)?.label ?? "Highest Rated";

  /* Shadow applied only when stuck (pill is in nav) */
  const shadow = "rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.10) 0 4px 8px";

  return (
    <>
      {/* Zero-height sentinel above the pill */}
      <div ref={sentinelRef} aria-hidden />

      <form
        onSubmit={onSearchSubmit}
        className="mx-auto w-full"
        style={{
          position: "sticky",
          top: stuck ? 10 : undefined,
          zIndex: 40,
          height: stuck ? 44 : 64,
          maxWidth: stuck ? 440 : "100%",
          background: "#fff",
          borderRadius: 9999,
          border: "1px solid #dddddd",
          boxShadow: shadow,
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden",
          transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >

        {/* ── Segment 1: Profession / What ──────────────────── */}
        <div
          className="flex flex-col justify-center min-w-0 transition-all duration-[350ms]"
          style={{
            flex: stuck ? "1 1 auto" : "1.4 1 0",
            padding: stuck ? "0 14px" : "0 20px",
            cursor: "text",
            borderRadius: focusedSegment === "what" ? "9999px" : 0,
            background: focusedSegment === "what" ? "#f7f7f7" : "transparent",
          }}
          onClick={() => {
            const el = document.getElementById("search-what");
            if (el) el.focus();
          }}
        >
          {/* Label — hides when stuck */}
          <span
            className="text-[#222] font-semibold uppercase tracking-[0.08em] select-none overflow-hidden whitespace-nowrap transition-all duration-[350ms]"
            style={{ fontSize: 10, maxHeight: stuck ? 0 : 14, opacity: stuck ? 0 : 1, marginBottom: stuck ? 0 : 2 }}
          >
            Profession
          </span>
          <div className="flex items-center gap-1.5">
            {stuck && <Search className="w-3.5 h-3.5 text-[#6a6a6a] flex-shrink-0" />}
            <input
              id="search-what"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setFocusedSegment("what")}
              onBlur={() => setFocusedSegment(null)}
              placeholder={stuck ? "Search artisans…" : "Skill or profession"}
              className="outline-none bg-transparent text-[#222] truncate w-full transition-all duration-[350ms]"
              style={{ fontSize: stuck ? 13 : 14 }}
            />
            {/* Clear button inside first segment when there's input or filters */}
            {stuck && hasFilters && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onClear(); }}
                className="w-5 h-5 rounded-full bg-[#222] flex items-center justify-center flex-shrink-0"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* ── Divider 1 — hides when stuck ──────────────────── */}
        <div
          className="bg-[#dddddd] flex-shrink-0 self-stretch transition-all duration-[350ms]"
          style={{ width: stuck ? 0 : 1, margin: stuck ? 0 : "16px 0", opacity: stuck ? 0 : 1 }}
        />

        {/* ── Segment 2: County / Where — hides when stuck ──── */}
        <div
          className="flex flex-col justify-center flex-shrink-0 overflow-hidden transition-all duration-[350ms]"
          style={{
            flex: stuck ? "0 0 0" : "1 1 0",
            maxWidth: stuck ? 0 : 180,
            opacity: stuck ? 0 : 1,
            padding: stuck ? 0 : "0 20px",
            pointerEvents: stuck ? "none" : "auto",
            borderRadius: focusedSegment === "where" ? "9999px" : 0,
            background: focusedSegment === "where" ? "#f7f7f7" : "transparent",
          }}
        >
          <span
            className="text-[#222] font-semibold uppercase tracking-[0.08em] select-none whitespace-nowrap mb-0.5"
            style={{ fontSize: 10 }}
          >
            County
          </span>
          <select
            value={county}
            onChange={(e) => onCountyChange(e.target.value)}
            onFocus={() => setFocusedSegment("where")}
            onBlur={() => setFocusedSegment(null)}
            className="outline-none bg-transparent text-sm text-[#222] w-full appearance-none cursor-pointer"
            style={{ color: county ? "#222" : "#929292" }}
          >
            <option value="">Anywhere in Kenya</option>
            {counties.filter(c => c.name).map(c => (
              <option key={c.name!} value={c.name!}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* ── Divider 2 — hides when stuck ──────────────────── */}
        <div
          className="bg-[#dddddd] flex-shrink-0 self-stretch transition-all duration-[350ms]"
          style={{ width: stuck ? 0 : 1, margin: stuck ? 0 : "16px 0", opacity: stuck ? 0 : 1 }}
        />

        {/* ── Segment 3: Sort — hides when stuck ────────────── */}
        <div
          className="flex flex-col justify-center flex-shrink-0 overflow-hidden transition-all duration-[350ms]"
          style={{
            flex: stuck ? "0 0 0" : "0.8 1 0",
            maxWidth: stuck ? 0 : 160,
            opacity: stuck ? 0 : 1,
            padding: stuck ? 0 : "0 20px",
            pointerEvents: stuck ? "none" : "auto",
            borderRadius: focusedSegment === "sort" ? "9999px" : 0,
            background: focusedSegment === "sort" ? "#f7f7f7" : "transparent",
          }}
        >
          <span
            className="text-[#222] font-semibold uppercase tracking-[0.08em] select-none whitespace-nowrap mb-0.5"
            style={{ fontSize: 10 }}
          >
            Sort By
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            onFocus={() => setFocusedSegment("sort")}
            onBlur={() => setFocusedSegment(null)}
            className="outline-none bg-transparent text-sm text-[#222] w-full appearance-none cursor-pointer"
          >
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* ── Emerald search orb ────────────────────────────── */}
        <button
          type="submit"
          className="bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-[350ms]"
          style={{
            width:  stuck ? 34 : 48,
            height: stuck ? 34 : 48,
            margin: stuck ? "5px 5px 5px 0" : "8px 8px 8px 0",
          }}
          aria-label="Search"
        >
          <Search
            className="text-white transition-all duration-[350ms]"
            style={{ width: stuck ? 14 : 18, height: stuck ? 14 : 18 }}
          />
        </button>
      </form>

      {/* Active filter chips — appear below pill when filters are set */}
      {hasFilters && !stuck && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {county && (
            <span className="flex items-center gap-1 px-3 py-1 bg-[#f7f7f7] text-[#222] border border-[#ddd] rounded-full text-xs">
              📍 {county}
            </span>
          )}
          {sortBy !== "rating" && (
            <span className="flex items-center gap-1 px-3 py-1 bg-[#f7f7f7] text-[#222] border border-[#ddd] rounded-full text-xs">
              ↕ {activeSortLabel}
            </span>
          )}
          <button
            onClick={onClear}
            className="text-xs text-[#6a6a6a] hover:text-[#222] underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}
    </>
  );
}
