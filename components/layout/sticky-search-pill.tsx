"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface StickySearchPillProps {
  searchInput: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasFilters: boolean;
}

/**
 * StickySearchPill
 *
 * A SINGLE search component that:
 * 1. Renders large (64 px) as page content below the nav.
 * 2. As you scroll, it becomes `position:sticky; top:10px` and uses CSS
 *    transitions to shrink its height, width, and internal layout so it
 *    appears to translate up into the nav bar row.
 * 3. No duplicate elements — same DOM node, same component, one state flag.
 *
 * The sticky top of 10px keeps the pill centred in the 64px nav bar:
 *   (64px nav − 44px compact pill) / 2 ≈ 10px
 */
export default function StickySearchPill({
  searchInput, onSearchChange, onSearchSubmit,
  showFilters, onToggleFilters, hasFilters,
}: StickySearchPillProps) {
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // When the sentinel (placed just above the pill) scrolls out of the
    // viewport top, the pill is "stuck" inside the nav zone.
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      {
        threshold: 0,
        // rootMargin shifts the detection line down by the nav height (64px)
        // so we trigger as soon as the sentinel reaches the nav bottom.
        rootMargin: "-64px 0px 0px 0px",
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Zero-height sentinel — just above where the pill starts */}
      <div ref={sentinelRef} aria-hidden />

      {/*
        The pill itself.
        position:sticky kicks in once the sentinel leaves the root.
        CSS transitions handle the smooth morph.
      */}
      <div
        className="z-40"
        style={{
          position: "sticky",
          top: stuck ? 10 : undefined, // 10px = centred in 64px nav
          transition: "top 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <form
          onSubmit={onSearchSubmit}
          className="mx-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            // Pill morphs: 64px → 44px tall, max-w-2xl → max-w-sm
            height: stuck ? 44 : 64,
            maxWidth: stuck ? 440 : 672,
            background: "#fff",
            borderRadius: 9999,
            border: "1px solid #dddddd",
            boxShadow:
              "rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.10) 0 4px 8px",
            display: "flex",
            alignItems: "stretch",
            overflow: "hidden",
          }}
        >
          {/* ── Skill / What segment ─────────────────── */}
          <div
            className="flex-1 flex items-center gap-2 min-w-0 transition-all duration-300"
            style={{ padding: stuck ? "0 16px" : "0 20px" }}
          >
            {stuck && (
              <Search
                className="flex-shrink-0 text-[#6a6a6a] transition-all duration-300"
                style={{ width: 14, height: 14 }}
              />
            )}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              {/* Segment label — only shown when large */}
              <span
                className="uppercase font-semibold text-[#222] leading-none transition-all duration-300 overflow-hidden whitespace-nowrap"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  maxHeight: stuck ? 0 : 14,
                  opacity: stuck ? 0 : 1,
                  marginBottom: stuck ? 0 : 2,
                }}
              >
                What
              </span>
              <input
                value={searchInput}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={stuck ? "Search artisans…" : "Profession or skill"}
                className="outline-none bg-transparent text-[#222] truncate w-full transition-all duration-300"
                style={{ fontSize: stuck ? 13 : 14, lineHeight: 1.4 }}
              />
            </div>
          </div>

          {/* ── Divider ──────────────────────────────── */}
          <div
            className="bg-[#dddddd] flex-shrink-0 transition-all duration-300"
            style={{
              width: 1,
              margin: stuck ? "10px 0" : "16px 0",
            }}
          />

          {/* ── Filters toggle ───────────────────────── */}
          <button
            type="button"
            onClick={onToggleFilters}
            className="flex-shrink-0 flex items-center gap-1.5 transition-all duration-300"
            style={{
              padding: stuck ? "0 12px" : "0 16px",
              fontSize: 13,
              color: hasFilters || showFilters ? "#047857" : "#6a6a6a",
              fontWeight: hasFilters || showFilters ? 600 : 400,
            }}
          >
            <SlidersHorizontal style={{ width: 14, height: 14 }} />
            <span
              className="transition-all duration-300 whitespace-nowrap overflow-hidden"
              style={{ maxWidth: stuck ? 0 : 60, opacity: stuck ? 0 : 1 }}
            >
              Filters
            </span>
            {hasFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
            )}
          </button>

          {/* ── Emerald search orb ───────────────────── */}
          <button
            type="submit"
            className="flex-shrink-0 bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              width: stuck ? 34 : 48,
              height: stuck ? 34 : 48,
              margin: stuck ? "5px 5px 5px 0" : "8px 8px 8px 0",
            }}
            aria-label="Search"
          >
            <Search
              className="text-white transition-all duration-300"
              style={{ width: stuck ? 14 : 18, height: stuck ? 14 : 18 }}
            />
          </button>
        </form>
      </div>
    </>
  );
}
