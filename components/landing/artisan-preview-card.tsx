"use client";

import { BadgeCheck, Eye, Images, MessageCircle, Star } from "lucide-react";
import { useRouter } from "next/navigation";

import { COLORS } from "@/lib/design-tokens";

export type ArtisanCardData = {
  id: string;
  name: string;
  profession: string;
  profileImage: string | null;
  portfolioThumbnail: string | null;
  location: { city: string; county: string };
  hourlyRate: number | null;
  isAvailable: boolean;
  isVerified: boolean;
  isPremium: boolean;
  rating: { average: number; total: number };
  specializations: Array<{ name: string }>;
  gradient?: string;
};

const fallbackGradient =
  "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 45%, #047857 100%)";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ArtisanCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div
        className="mb-3 aspect-[4/3] rounded-[14px]"
        style={{ background: "#f2f2f2" }}
      />
      <div className="mb-2 flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-[#f2f2f2]" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-2/3 rounded bg-[#f2f2f2]" />
          <div className="h-3 w-1/2 rounded bg-[#f2f2f2]" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-lg bg-[#f2f2f2]" />
        <div className="h-10 flex-1 rounded-lg bg-[#f2f2f2]" />
      </div>
    </div>
  );
}

export function ArtisanPreviewCard({
  artisan,
  onOpenPortfolio,
}: {
  artisan: ArtisanCardData;
  onOpenPortfolio?: (artisan: ArtisanCardData) => void;
}) {
  const router = useRouter();
  const abbr = getInitials(artisan.name);
  const locationStr =
    [artisan.location.city, artisan.location.county].filter(Boolean).join(", ") || "Kenya";
  const heroImg = artisan.portfolioThumbnail ?? artisan.profileImage;

  const handleOpenPortfolio = () => {
    if (onOpenPortfolio) {
      onOpenPortfolio(artisan);
      return;
    }
    router.push(`/artisans/${artisan.id}`);
  };

  return (
    <article
      className="group block rounded-[14px] transition-all duration-200 ease-out hover:-translate-y-0.5"
    >
      {/* Image */}
      <button
        type="button"
        onClick={handleOpenPortfolio}
        className="relative mb-3 block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[14px] bg-[#f2f2f2] text-left"
        aria-label={`View ${artisan.name}'s portfolio`}
      >
        {heroImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImg}
            alt={artisan.profession ?? artisan.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center transition-transform duration-300 ease-out group-hover:scale-105"
            style={{ background: artisan.gradient ?? fallbackGradient }}
          >
            <span
              className="text-[32px] font-bold"
              style={{ color: COLORS.primary }}
            >
              {abbr}
            </span>
          </div>
        )}

        {/* "View work" hover badge */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          style={{ color: COLORS.ink }}
        >
          <Images size={13} style={{ color: COLORS.primary }} />
          View work
        </div>

        {/* Availability */}
        {artisan.isAvailable && (
          <div
            className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold leading-[1.18] shadow-sm"
            style={{ color: COLORS.ink }}
          >
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: COLORS.primary }}
            />
            Available
          </div>
        )}

        {artisan.isPremium && !artisan.isAvailable && (
          <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold leading-[1.18] shadow-sm text-[#222222]">
            Featured
          </div>
        )}
      </button>

      {/* Info row: avatar + name/rating/meta */}
      <div className="mb-2 flex items-start gap-3">
        <div className="relative mt-0.5 flex-shrink-0">
          {artisan.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artisan.profileImage}
              alt={artisan.name}
              className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-emerald-100 shadow-sm">
              <span className="text-[13px] font-bold text-emerald-700">
                {abbr}
              </span>
            </div>
          )}
          {artisan.isVerified && (
            <BadgeCheck
              className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white text-emerald-600"
              aria-label="Verified artisan"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className="truncate text-[16px] font-semibold leading-[1.25]"
              style={{ color: COLORS.ink }}
            >
              {artisan.name}
            </p>
            {artisan.rating.total > 0 && (
              <div className="flex flex-shrink-0 items-center gap-1 pt-0.5">
                <Star
                  className="h-3.5 w-3.5"
                  fill={COLORS.ink}
                  style={{ color: COLORS.ink }}
                />
                <span
                  className="text-[14px] font-medium leading-[1.29]"
                  style={{ color: COLORS.ink }}
                >
                  {artisan.rating.average.toFixed(1)}
                </span>
                <span
                  className="text-[13px] leading-[1.23]"
                  style={{ color: COLORS.mutedSoft }}
                >
                  ({artisan.rating.total})
                </span>
              </div>
            )}
          </div>
          <p className="truncate text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>
            {[artisan.profession, locationStr].filter(Boolean).join(" · ")}
          </p>
          {artisan.hourlyRate ? (
            <p className="mt-0.5 text-[14px] leading-[1.43]" style={{ color: COLORS.ink }}>
              <span className="font-semibold">
                KES {artisan.hourlyRate.toLocaleString()}
              </span>
              <span style={{ color: COLORS.muted }}> / hr</span>
            </p>
          ) : null}
        </div>
      </div>

      {/* Specialization tags */}
      {artisan.specializations.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {artisan.specializations.slice(0, 2).map((s) => (
            <span
              key={s.name}
              className="whitespace-nowrap rounded-full border px-2.5 py-1 text-[13px] leading-[1.23]"
              style={{
                background: COLORS.surfaceSoft,
                borderColor: COLORS.hairlineSoft,
                color: COLORS.muted,
              }}
            >
              {s.name}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => router.push(`/artisans/${artisan.id}`)}
          className="flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[14px] font-medium leading-[1.29] transition-colors group-hover:border-emerald-600 group-hover:text-emerald-700"
          style={{ borderColor: COLORS.hairline, color: COLORS.body }}
        >
          <Eye className="h-4 w-4" />
          View Profile
        </button>
        <button
          type="button"
          onClick={() => router.push(`/sign-in?redirect_url=/artisans/${artisan.id}`)}
          className="flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-medium leading-[1.29] text-white transition-colors hover:bg-emerald-800"
          style={{ background: COLORS.primary }}
        >
          <MessageCircle className="h-4 w-4" />
          Message
        </button>
      </div>
    </article>
  );
}
