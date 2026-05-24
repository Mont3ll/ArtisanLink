"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";

import { ArtisanCtaBand } from "@/components/landing/artisan-cta-band";
import {
  ArtisanCardSkeleton,
  ArtisanPreviewCard,
  type ArtisanCardData,
} from "@/components/landing/artisan-preview-card";
import { CategoryStrip } from "@/components/landing/category-strip";
import { HeroBand } from "@/components/landing/hero-band";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { PortfolioQuickView } from "@/components/landing/portfolio-quick-view";
import Footer from "@/components/layout/footer-new";
import Header, { type ProductTabId } from "@/components/layout/header-new";
import { COLORS } from "@/lib/design-tokens";

const TAB_PROFESSIONS: Record<ProductTabId, string[]> = {
  repairs: ["Plumber", "Electrician", "Cleaner", "Handyman"],
  build: ["Carpenter", "Mason", "Welder"],
  design: ["Painter", "Carpenter"],
};

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 45%, #047857 100%)",
  "linear-gradient(135deg, #f4f1e8 0%, #b89565 44%, #4b3524 100%)",
  "linear-gradient(135deg, #fef3c7 0%, #fbbf24 44%, #065f46 100%)",
  "linear-gradient(135deg, #eef2ff 0%, #a7f3d0 46%, #064e3b 100%)",
];

type RawArtisan = Record<string, unknown>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeSpecializations(value: unknown): Array<{ name: string }> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return { name: item };
      const record = asRecord(item);
      return { name: asString(record.name) };
    })
    .filter((item) => item.name);
}

function normalizeArtisan(raw: RawArtisan, index: number): ArtisanCardData {
  const user = asRecord(raw.user);
  const location = asRecord(raw.location);
  const ratingRecord = asRecord(raw.rating);
  const name = asString(raw.name, asString(user.name, "ChapaWorks artisan"));
  const profession = asString(raw.profession, "Artisan");
  const city = asString(raw.city, asString(location.city));
  const county = asString(raw.county, asString(location.county, "Kenya"));
  const ratingAverage = asNumber(
    raw.averageRating,
    asNumber(ratingRecord.average, asNumber(raw.ratingAverage, 0)),
  );
  const ratingTotal = asNumber(
    raw.totalReviews,
    asNumber(ratingRecord.total, asNumber(raw.reviewCount, asNumber(raw.reviewsCount, 0))),
  );
  const specializations = normalizeSpecializations(raw.specializations);

  return {
    id: asString(raw.id, `artisan-${index}`),
    name,
    profession,
    profileImage: asString(raw.profileImage, asString(user.image)) || null,
    portfolioThumbnail:
      asString(raw.portfolioThumbnail, asString(raw.thumbnail, asString(raw.image))) || null,
    location: { city, county },
    hourlyRate: raw.hourlyRate === null ? null : asNumber(raw.hourlyRate, 0) || null,
    isAvailable:
      typeof raw.isAvailable === "boolean"
        ? raw.isAvailable
        : typeof raw.available === "boolean"
          ? raw.available
          : true,
    isVerified:
      typeof raw.isVerified === "boolean"
        ? raw.isVerified
        : raw.verificationStatus === "APPROVED" || raw.verified === true,
    isPremium: raw.isPremium === true || raw.subscriptionTier === "PRO",
    rating: { average: ratingAverage || 4.7, total: ratingTotal },
    specializations: specializations.length ? specializations : [{ name: profession }],
    gradient: asString(raw.gradient, FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]),
  };
}

function extractArtisans(payload: unknown): RawArtisan[] {
  if (Array.isArray(payload)) return payload as RawArtisan[];
  const record = asRecord(payload);
  if (Array.isArray(record.artisans)) return record.artisans as RawArtisan[];
  if (Array.isArray(record.data)) return record.data as RawArtisan[];
  return [];
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ProductTabId>("repairs");
  const [activeCategory, setActiveCategory] = useState("All");
  const [artisans, setArtisans] = useState<ArtisanCardData[]>([]);
  const [selectedPortfolioArtisan, setSelectedPortfolioArtisan] = useState<ArtisanCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetch("/api/search/artisans?limit=12")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load artisans"))))
      .then((payload) => {
        if (cancelled) return;
        setArtisans(extractArtisans(payload).map(normalizeArtisan));
      })
      .catch(() => {
        if (!cancelled) setArtisans([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredArtisans = useMemo(() => {
    if (activeCategory !== "All") {
      return artisans.filter((artisan) => artisan.profession === activeCategory);
    }

    const professions = TAB_PROFESSIONS[activeTab];
    const matching = artisans.filter((artisan) => professions.includes(artisan.profession));
    return matching.length ? matching : artisans;
  }, [activeCategory, activeTab, artisans]);

  const browseHref =
    activeCategory !== "All" ? `/artisans?profession=${encodeURIComponent(activeCategory)}` : "/artisans";

  return (
    <div className="min-h-screen bg-white">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <HeroBand activeTab={activeTab} />
      <CategoryStrip activeCategory={activeCategory} onChange={setActiveCategory} />

      <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[14px] font-medium leading-[1.29]" style={{ color: COLORS.muted }}>
              Recommended artisans
            </p>
            <h2 className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>
              {activeCategory === "All" ? "Available specialists near you" : `${activeCategory} specialists`}
            </h2>
          </div>
          <Link
            href={browseHref}
            className="inline-flex w-fit items-center gap-2 rounded-lg border px-4 py-2 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          >
            Browse all
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => <ArtisanCardSkeleton key={index} />)
            ) : filteredArtisans.length > 0 ? (
              filteredArtisans.slice(0, 8).map((artisan) => (
                <motion.div
                  key={artisan.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ArtisanPreviewCard artisan={artisan} onOpenPortfolio={setSelectedPortfolioArtisan} />
                </motion.div>
              ))
            ) : (
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
                  No artisans found yet
                </h3>
                <p className="mx-auto mt-2 max-w-[420px] text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>
                  Try browsing all artisans or invite the first skilled artisan to join ChapaWorks.
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  <Link
                    href="/artisans"
                    className="rounded-lg border px-4 py-2 text-[14px] font-medium transition-colors hover:bg-white"
                    style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                  >
                    Browse directory
                  </Link>
                  <Link
                    href="/sign-up?role=artisan"
                    className="rounded-lg px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                    style={{ background: COLORS.primary }}
                  >
                    Be the first artisan
                  </Link>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <HowItWorksSection />
      <ArtisanCtaBand />
      <Footer />
      <PortfolioQuickView
        artisan={selectedPortfolioArtisan}
        onClose={() => setSelectedPortfolioArtisan(null)}
      />
    </div>
  );
}
