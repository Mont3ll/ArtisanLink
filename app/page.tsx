"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Star,
  BadgeCheck,
  Heart,
  ArrowRight,
  Wrench,
  MessageCircle,
  Shield,
  ChevronRight,
} from "lucide-react";
import PublicNav from "@/components/layout/public-nav";
import TesseractLogo from "@/components/common/TesseractLogo";

interface LiveArtisan {
  id: string;
  name: string;
  profession: string | null;
  bio: string | null;
  profileImage: string | null;
  location: { city: string | null; county: string | null };
  hourlyRate: number | null;
  isAvailable: boolean;
  isVerified: boolean;
  isPremium: boolean;
  rating: { average: number; total: number };
  specializations: Array<{ name: string }>;
  distance?: number | null;
}

const categories = [
  { id: "all", name: "All" },
  { id: "Carpenter", name: "Carpenter" },
  { id: "Electrician", name: "Electrician" },
  { id: "Plumber", name: "Plumber" },
  { id: "Painter", name: "Painter" },
  { id: "Mason", name: "Mason" },
  { id: "Tailor", name: "Tailor" },
  { id: "Welder", name: "Welder" },
  { id: "Mechanic", name: "Mechanic" },
  { id: "Photographer", name: "Photographer" },
];

export default function Home() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [artisans, setArtisans] = useState<LiveArtisan[]>([]);
  const [artisansLoading, setArtisansLoading] = useState(true);
  const [heroQuery, setHeroQuery] = useState("");
  const [heroLocation, setHeroLocation] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const fetchArtisans = useCallback(() => {
    setArtisansLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "8");
    params.set("sortBy", "rating");
    if (activeCategory !== "all") params.set("profession", activeCategory);

    fetch(`/api/search/artisans?${params}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setArtisans(data.artisans?.slice(0, 8) || []))
      .catch(() => setArtisans([]))
      .finally(() => setArtisansLoading(false));
  }, [activeCategory]);

  useEffect(() => { fetchArtisans(); }, [fetchArtisans]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroQuery.trim()) params.set("q", heroQuery.trim());
    if (heroLocation.trim()) params.set("county", heroLocation.trim());
    router.push(`/artisans${params.toString() ? "?" + params.toString() : ""}`);
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#222]">
      <PublicNav />

      {/* Hero — Search-first */}
      <section className="pt-10 pb-6 px-4 border-b border-[#ddd]">
        <div className="max-w-2xl mx-auto text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#222] mb-1">
            Find a skilled artisan near you
          </h1>
          <p className="text-[#6a6a6a] text-sm">
            Verified professionals across Kenya — hire with confidence.
          </p>
        </div>

        {/* Pill search bar — Airbnb-style */}
        <form
          onSubmit={handleHeroSearch}
          className="max-w-2xl mx-auto flex items-stretch bg-white rounded-full border border-[#ddd] shadow-[rgba(0,0,0,0.02)_0_0_0_1px,rgba(0,0,0,0.04)_0_2px_6px,rgba(0,0,0,0.1)_0_4px_8px] overflow-hidden h-14"
        >
          <div className="flex-1 flex items-center gap-2 px-5 min-w-0">
            <Search className="w-4 h-4 text-[#6a6a6a] flex-shrink-0" />
            <input
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder="Service or artisan name"
              className="w-full text-sm outline-none placeholder:text-[#929292] bg-transparent text-[#222]"
            />
          </div>
          <div className="w-px bg-[#ddd] self-stretch" />
          <div className="flex items-center gap-2 px-5">
            <MapPin className="w-4 h-4 text-[#6a6a6a] flex-shrink-0" />
            <input
              value={heroLocation}
              onChange={(e) => setHeroLocation(e.target.value)}
              placeholder="County"
              className="w-28 text-sm outline-none placeholder:text-[#929292] bg-transparent text-[#222]"
            />
          </div>
          <button
            type="submit"
            className="m-2 w-10 h-10 bg-emerald-700 hover:bg-emerald-800 transition-colors rounded-full flex items-center justify-center flex-shrink-0"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-white" />
          </button>
        </form>
      </section>

      {/* Category strip */}
      <div className="border-b border-[#ddd] sticky top-16 bg-white/95 backdrop-blur-sm z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-5 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "border-[#222] text-[#222]"
                    : "border-transparent text-[#6a6a6a] hover:border-[#ddd] hover:text-[#3f3f3f]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Artisan Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artisansLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ArtisanCardSkeleton key={i} />
              ))
            : artisans.length > 0
            ? artisans.map((artisan) => (
                <ArtisanCard
                  key={artisan.id}
                  artisan={artisan}
                  saved={savedIds.has(artisan.id)}
                  onSave={() => toggleSave(artisan.id)}
                />
              ))
            : (
              <div className="col-span-full text-center py-16">
                <p className="text-[#6a6a6a] mb-3">No artisans found in this category yet.</p>
                <Link href="/sign-up?role=artisan" className="text-emerald-700 font-medium hover:underline text-sm">
                  Be the first artisan to join →
                </Link>
              </div>
            )}
        </div>

        {/* View all link */}
        {!artisansLoading && artisans.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href={activeCategory !== "all" ? `/artisans?profession=${activeCategory}` : "/artisans"}
              className="inline-flex items-center gap-2 text-[#222] font-medium underline hover:text-emerald-700 transition-colors text-sm"
            >
              Show all {activeCategory !== "all" ? activeCategory.toLowerCase() + "s" : "artisans"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      {/* How it works — compact strip */}
      <section className="border-t border-[#ddd] py-14 px-4 bg-white" id="how-it-works">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-serif font-semibold text-[#222] mb-8 text-center">
            How ChapaWorks works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { n: "1", icon: <Search className="w-5 h-5" />, title: "Browse & discover", desc: "Search verified artisans by profession, location, and rating. View portfolios and real client reviews." },
              { n: "2", icon: <MessageCircle className="w-5 h-5" />, title: "Message & quote", desc: "Chat directly with artisans, describe your project, and receive a detailed quote before committing." },
              { n: "3", icon: <Shield className="w-5 h-5" />, title: "Hire with confidence", desc: "Accept the quote, the artisan gets to work, and you pay in cash on completion. Satisfaction guaranteed." },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 bg-[#f7f7f7] rounded-full flex items-center justify-center text-emerald-700">
                  {s.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#222] text-sm mb-1">{s.title}</h3>
                  <p className="text-[#6a6a6a] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artisan CTA band */}
      <section className="border-t border-[#ddd] py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f7f7f7] rounded-full flex items-center justify-center text-emerald-700">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-[#222] text-sm">Are you a skilled artisan?</p>
              <p className="text-[#6a6a6a] text-sm">Join thousands of professionals growing their business on ChapaWorks.</p>
            </div>
          </div>
          <Link
            href="/for-artisans"
            className="inline-flex items-center gap-2 border border-[#222] text-[#222] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#f7f7f7] transition-colors whitespace-nowrap flex-shrink-0"
          >
            Learn more <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ddd] py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-emerald-700">
            <TesseractLogo size={18} strokeWidth={1.75} />
            <span className="font-serif font-bold text-[#222] text-sm">ChapaWorks</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {[
              { label: "Browse Artisans", href: "/artisans" },
              { label: "How It Works", href: "/#how-it-works" },
              { label: "Pricing", href: "/pricing" },
              { label: "For Artisans", href: "/for-artisans" },
              { label: "Sign In", href: "/sign-in" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-[#6a6a6a] hover:text-[#222] hover:underline transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-[#929292]">© {new Date().getFullYear()} ChapaWorks, Inc.</p>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Artisan Card — Airbnb-style, photo-first
───────────────────────────────────────────────────────────── */
function ArtisanCard({
  artisan,
  saved,
  onSave,
}: {
  artisan: LiveArtisan;
  saved: boolean;
  onSave: () => void;
}) {
  const initials = artisan.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const locationStr = [artisan.location.city, artisan.location.county].filter(Boolean).join(", ") || "Kenya";

  return (
    <div className="group cursor-pointer">
      <Link href={`/artisans/${artisan.id}`} className="block">
        {/* Photo area */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-[#f2f2f2] mb-3">
          {artisan.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artisan.profileImage}
              alt={artisan.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
              <span className="text-4xl font-bold text-emerald-600">{initials}</span>
            </div>
          )}

          {/* Availability badge */}
          {artisan.isAvailable && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-emerald-700 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Available
            </div>
          )}

          {/* Premium badge */}
          {artisan.isPremium && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-amber-700 shadow-sm">
              ⭐ Featured
            </div>
          )}

          {/* Verified badge */}
          {artisan.isVerified && (
            <div className="absolute bottom-3 left-3">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-0.5">
          {/* Name + rating */}
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-[#222] text-sm truncate">{artisan.name}</p>
            {artisan.rating.total > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 fill-[#222] text-[#222]" />
                <span className="text-xs text-[#222] font-medium">{artisan.rating.average.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Profession + location */}
          <p className="text-[#6a6a6a] text-sm truncate">
            {artisan.profession}{artisan.profession && locationStr ? " · " : ""}{locationStr}
          </p>

          {/* Price */}
          {artisan.hourlyRate && (
            <p className="text-[#222] text-sm">
              <span className="font-medium">KES {artisan.hourlyRate.toLocaleString()}</span>
              <span className="text-[#6a6a6a]"> / hr</span>
            </p>
          )}
        </div>
      </Link>

      {/* Save button — outside Link to avoid nested links */}
      <button
        onClick={(e) => { e.preventDefault(); onSave(); }}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center"
        aria-label={saved ? "Remove from saved" : "Save artisan"}
        style={{ position: "absolute" }}
      >
        <div className="w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm">
          <Heart
            className={`w-4 h-4 transition-colors ${saved ? "fill-emerald-700 text-emerald-700" : "text-[#222]"}`}
          />
        </div>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Skeleton — matches ArtisanCard exactly
───────────────────────────────────────────────────────────── */
function ArtisanCardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Photo area */}
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
  );
}
