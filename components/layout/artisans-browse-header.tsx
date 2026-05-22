"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Search, SlidersHorizontal, Menu, X, User, LogIn } from "lucide-react";
import ChapaWorksLogo from "@/components/common/ChapaWorksLogo";

// Profession categories — matches the API profession values
const CATEGORIES = [
  { id: "all",          label: "All" },
  { id: "Carpenter",   label: "Carpenter" },
  { id: "Electrician", label: "Electrician" },
  { id: "Plumber",     label: "Plumber" },
  { id: "Painter",     label: "Painter" },
  { id: "Mason",       label: "Mason" },
  { id: "Tailor",      label: "Tailor" },
  { id: "Welder",      label: "Welder" },
  { id: "Mechanic",    label: "Mechanic" },
];

interface ArtisansBrowseHeaderProps {
  // Search pill values
  searchInput: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;

  // Category filter
  activeCategory: string;
  onCategoryChange: (id: string) => void;

  // Filter panel toggle
  showFilters: boolean;
  onToggleFilters: () => void;
  hasFilters: boolean;
}

export default function ArtisansBrowseHeader({
  searchInput, onSearchChange, onSearchSubmit,
  activeCategory, onCategoryChange,
  showFilters, onToggleFilters, hasFilters,
}: ArtisansBrowseHeaderProps) {
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const compactInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Fixed header ──────────────────────────────────── */}
      <header
        className="fixed top-0 inset-x-0 z-50 bg-white"
        style={{
          borderBottom: scrolled ? "1px solid #dddddd" : "none",
          transition: "border-color 0.3s ease",
        }}
      >
        {/* Row 1 — Logo · Compact search (scrolled) · Auth */}
        <div
          className="flex items-center justify-between px-6 md:px-10"
          style={{ height: 72 }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <ChapaWorksLogo size={24} />
            <span className="font-serif font-semibold text-[#222] text-base hidden sm:block">
              ChapaWorks
            </span>
          </Link>

          {/* Center — compact pill (visible when scrolled) */}
          <div
            className="header-pill-compact flex-1 max-w-sm mx-6 hidden md:block"
            style={{
              opacity: scrolled ? 1 : 0,
              transform: scrolled ? "translateY(0)" : "translateY(4px)",
              pointerEvents: scrolled ? "auto" : "none",
            }}
          >
            <form
              onSubmit={onSearchSubmit}
              className="search-pill flex items-center h-[44px] px-1 pl-4 gap-2"
            >
              <Search className="w-3.5 h-3.5 text-[#6a6a6a] flex-shrink-0" />
              <input
                ref={compactInputRef}
                value={searchInput}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search artisans…"
                className="flex-1 text-sm outline-none placeholder:text-[#929292] text-[#222] bg-transparent min-w-0"
              />
              <button type="submit" className="search-orb-sm mr-0.5">
                <Search className="w-3.5 h-3.5 text-white" />
              </button>
            </form>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 h-10 px-4 rounded-full border border-[#dddddd] text-sm font-medium text-[#222] hover:shadow-float transition-shadow"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-medium text-[#222] hover:bg-[#f7f7f7] transition-colors hidden sm:flex"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center h-10 px-4 rounded-full bg-[#222] text-white text-sm font-medium hover:bg-[#333] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden ml-1 flex items-center justify-center h-10 w-10 rounded-full border border-[#dddddd] hover:shadow-float transition-shadow"
              aria-label={mobileOpen ? "Close" : "Menu"}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Row 2 — Large expanded search pill + category strip */}
        <div
          className="header-row-search overflow-hidden"
          style={{
            maxHeight: scrolled ? 0 : 140,
            opacity: scrolled ? 0 : 1,
            transform: scrolled ? "translateY(-8px)" : "translateY(0)",
          }}
        >
          {/* Large search pill */}
          <div className="px-6 md:px-10 pt-1 pb-3">
            <form
              onSubmit={onSearchSubmit}
              className="search-pill flex items-center max-w-2xl mx-auto"
              style={{ height: 64 }}
            >
              {/* Skill segment */}
              <div className="flex-1 flex flex-col justify-center px-5 min-w-0">
                <span className="text-[10px] font-semibold text-[#222] uppercase tracking-[0.08em] leading-none mb-0.5">
                  What
                </span>
                <input
                  value={searchInput}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Profession or skill"
                  className="text-sm outline-none placeholder:text-[#929292] text-[#222] bg-transparent truncate w-full"
                />
              </div>

              {/* Divider */}
              <div className="w-px self-stretch bg-[#dddddd] my-3 flex-shrink-0" />

              {/* Category segment */}
              <div className="flex items-center justify-between px-4 flex-shrink-0 gap-2">
                <button
                  type="button"
                  onClick={onToggleFilters}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    hasFilters || showFilters ? "text-emerald-700 font-medium" : "text-[#6a6a6a]"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />}
                </button>
              </div>

              {/* Search orb */}
              <button type="submit" className="search-orb mr-2">
                <Search className="w-5 h-5 text-white" />
              </button>
            </form>
          </div>

          {/* Category strip */}
          <div
            className="border-t border-[#ebebeb] overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex items-center gap-0 px-6 md:px-10 max-w-6xl mx-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeCategory === cat.id ? "category-tab-active" : "category-tab-inactive"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#dddddd] bg-white px-6 py-4 space-y-2">
            {/* Mobile search */}
            <form onSubmit={(e) => { onSearchSubmit(e); setMobileOpen(false); }} className="flex gap-2 mb-3">
              <input
                value={searchInput}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search artisans…"
                className="flex-1 h-10 px-4 border border-[#dddddd] rounded-full text-sm outline-none focus:border-emerald-600 text-[#222]"
              />
              <button type="submit" className="search-orb-sm">
                <Search className="w-3.5 h-3.5 text-white" />
              </button>
            </form>
            {/* Mobile categories */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { onCategoryChange(cat.id); setMobileOpen(false); }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    activeCategory === cat.id
                      ? "border-[#222] bg-[#222] text-white"
                      : "border-[#dddddd] text-[#6a6a6a] hover:border-[#222]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {/* Mobile auth */}
            {!isSignedIn && (
              <div className="flex gap-2 pt-2 border-t border-[#ebebeb]">
                <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="flex-1 text-center h-10 flex items-center justify-center border border-[#dddddd] rounded-full text-sm text-[#222] font-medium">Sign in</Link>
                <Link href="/sign-up" onClick={() => setMobileOpen(false)} className="flex-1 text-center h-10 flex items-center justify-center bg-[#222] rounded-full text-sm text-white font-medium">Get started</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Spacer to push content below the fixed header */}
      <div style={{ height: 72 + (scrolled ? 0 : 112) }} />
    </>
  );
}
