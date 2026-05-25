"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  BrowseDirectorySection,
  BrowseDirectorySkeleton,
} from "@/components/landing/browse-directory";
import type { ArtisanCardData } from "@/components/landing/artisan-preview-card";
import Footer from "@/components/layout/footer-new";
import Header from "@/components/layout/header-new";
import { COLORS } from "@/lib/design-tokens";

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 45%, #047857 100%)",
  "linear-gradient(135deg, #f4f1e8 0%, #b89565 44%, #4b3524 100%)",
  "linear-gradient(135deg, #fef3c7 0%, #fbbf24 44%, #065f46 100%)",
  "linear-gradient(135deg, #eef2ff 0%, #a7f3d0 46%, #064e3b 100%)",
];

type RawArtisan = Record<string, unknown>;
type Facet = { name: string | null; count?: number };

type SearchPayload = {
  artisans?: RawArtisan[];
  data?: RawArtisan[];
  facets?: {
    professions?: Facet[];
    counties?: Facet[];
  };
};

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

function extractArtisans(payload: SearchPayload): RawArtisan[] {
  if (Array.isArray(payload)) return payload as RawArtisan[];
  if (Array.isArray(payload.artisans)) return payload.artisans;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function facetNames(values: Facet[] | undefined): string[] {
  return (values ?? [])
    .map((item) => item.name)
    .filter((value): value is string => Boolean(value));
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default function BrowseArtisansPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white pt-[132px] md:pt-[180px]">
          <Header />
          <BrowseDirectorySkeleton />
          <Footer />
        </div>
      }
    >
      <BrowseArtisansContent />
    </Suspense>
  );
}

function BrowseArtisansContent() {
  const searchParams = useSearchParams();
  const [artisans, setArtisans] = useState<ArtisanCardData[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [counties, setCounties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    params.set("limit", "50");

    for (const [key, value] of searchParams.entries()) {
      if (key !== "limit" && value) params.set(key, value);
    }

    setLoading(true);
    fetch(`/api/search/artisans?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load artisans"))))
      .then((payload: SearchPayload) => {
        if (cancelled) return;
        const nextArtisans = extractArtisans(payload).map(normalizeArtisan);
        setArtisans(nextArtisans);
        setProfessions(
          uniqueSorted([
            ...facetNames(payload.facets?.professions),
            ...nextArtisans.map((artisan) => artisan.profession),
          ]),
        );
        setCounties(
          uniqueSorted([
            ...facetNames(payload.facets?.counties),
            ...nextArtisans.map((artisan) => artisan.location.county),
          ]),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setArtisans([]);
          setProfessions([]);
          setCounties([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white pt-[132px] md:pt-[180px]">
      <Header />
      {loading ? (
        <>
          <section className="mx-auto max-w-[1280px] px-5 pt-12 md:px-10">
            <p className="mb-2 text-[14px] font-medium leading-[1.29]" style={{ color: COLORS.muted }}>
              Artisan directory
            </p>
            <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] md:text-[32px]" style={{ color: COLORS.ink }}>
              Discover skilled professionals
            </h1>
          </section>
          <BrowseDirectorySkeleton />
        </>
      ) : (
        <BrowseDirectorySection
          initialArtisans={artisans}
          initialProfessions={professions}
          initialCounties={counties}
        />
      )}
      <Footer />
    </div>
  );
}
