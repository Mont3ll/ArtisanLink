"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ArrowRight,
  Wrench,
  MessageCircle,
  Shield,
  ChevronRight,
} from "lucide-react";
import PublicNav from "@/components/layout/public-nav";
import ChapaWorksLogo from "@/components/common/ChapaWorksLogo";
import { ArtisanCard, ArtisanCardSkeleton, type ArtisanCardData } from "@/components/artisan";

interface LiveArtisan extends ArtisanCardData {
  bio: string | null;
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
                <ArtisanCard key={artisan.id} artisan={artisan} />
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
            <ChapaWorksLogo size={20} />
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

