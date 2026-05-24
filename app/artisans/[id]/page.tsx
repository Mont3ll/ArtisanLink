"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeCheck } from "lucide-react";

import {
  ArtisanProfileSection,
  ArtisanProfileSkeleton,
  type FullArtisanProfile,
} from "@/components/landing/artisan-profile-section";
import Footer from "@/components/layout/footer-new";
import Header from "@/components/layout/header-new";
import { COLORS } from "@/lib/design-tokens";

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value && typeof value === "object" ? (value as RawRecord) : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeSpecializations(value: unknown, profession: string) {
  if (!Array.isArray(value)) return [{ name: profession }];
  const normalized = value
    .map((item) => {
      if (typeof item === "string") return { name: item };
      return { name: asString(asRecord(item).name) };
    })
    .filter((item) => item.name);
  return normalized.length ? normalized : [{ name: profession }];
}

function normalizePortfolio(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const record = asRecord(item);
    return {
      id: asString(record.id, `portfolio-${index}`),
      title: asString(record.title, "Portfolio project"),
      description: asString(record.description) || null,
      imageUrl: asString(record.imageUrl) || null,
      imageUrls: Array.isArray(record.imageUrls) ? record.imageUrls.filter((url): url is string => typeof url === "string") : [],
      category: asString(record.category) || null,
      tags: Array.isArray(record.tags) ? record.tags.filter((tag): tag is string => typeof tag === "string") : [],
      completedAt: asString(record.completedAt) || null,
    };
  });
}

function normalizeProfile(raw: RawRecord): FullArtisanProfile {
  const location = asRecord(raw.location);
  const rating = asRecord(raw.rating);
  const profession = asString(raw.profession, "Artisan");

  return {
    id: asString(raw.id),
    name: asString(raw.name, "ChapaWorks artisan"),
    profession,
    profileImage: asString(raw.profileImage) || null,
    portfolioThumbnail: null,
    location: {
      city: asString(location.city),
      county: asString(location.county),
    },
    hourlyRate: raw.hourlyRate === null ? null : asNumber(raw.hourlyRate, 0) || null,
    isAvailable: raw.isAvailable !== false,
    isVerified: raw.isVerified === true,
    isPremium: raw.isPremium === true,
    rating: {
      average: asNumber(rating.average, 4.7),
      total: asNumber(rating.total, 0),
    },
    specializations: normalizeSpecializations(raw.specializations, profession),
    bio: asString(raw.bio) || null,
    experience: raw.experience === null ? null : asNumber(raw.experience, 0) || null,
    memberSince: asString(raw.memberSince, new Date().toISOString()),
    website: asString(raw.website) || null,
    portfolio: normalizePortfolio(raw.portfolio),
  };
}

export default function PublicArtisanProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [artisan, setArtisan] = useState<FullArtisanProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setIsLoading(true);
    setError(null);
    fetch(`/api/artisans/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Artisan not found");
        return response.json();
      })
      .then((payload) => {
        if (!cancelled) setArtisan(normalizeProfile(asRecord(payload)));
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setArtisan(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {isLoading ? <ArtisanProfileSkeleton /> : null}
      {!isLoading && (error || !artisan) ? (
        <main className="mx-auto max-w-[720px] px-5 py-20 text-center md:px-10">
          <BadgeCheck className="mx-auto mb-4" size={42} style={{ color: COLORS.mutedSoft }} />
          <h1 className="text-[28px] font-semibold tracking-[-0.03em]" style={{ color: COLORS.ink }}>
            Artisan not found
          </h1>
          <p className="mx-auto mt-3 max-w-[440px] text-[15px] leading-[1.55]" style={{ color: COLORS.muted }}>
            This artisan may no longer be available or the link is invalid.
          </p>
          <Link
            href="/artisans"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg px-5 text-[14px] font-medium text-white hover:bg-emerald-800"
            style={{ background: COLORS.primary }}
          >
            Browse artisans
          </Link>
        </main>
      ) : null}
      {!isLoading && artisan ? <ArtisanProfileSection artisan={artisan} /> : null}
      <Footer />
    </div>
  );
}
