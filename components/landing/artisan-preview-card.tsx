"use client";

import { Eye, MapPin, MessageCircle, Star, BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { COLORS, SHADOWS } from "@/lib/design-tokens";

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

function formatKes(value: number | null) {
  if (!value) return "Rate on request";
  return `KES ${new Intl.NumberFormat("en-KE").format(value)}/hr`;
}

export function ArtisanCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-[22px] border bg-white"
      style={{ borderColor: COLORS.hairlineSoft }}
    >
      <div className="aspect-[4/3] animate-pulse bg-[#f2f2f2]" />
      <div className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-full bg-[#f2f2f2]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#f2f2f2]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#f2f2f2]" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-[#f2f2f2]" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-[#f2f2f2]" />
        </div>
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
  const location = [artisan.location.city, artisan.location.county]
    .filter(Boolean)
    .join(", ");

  const handleOpenPortfolio = () => {
    if (onOpenPortfolio) {
      onOpenPortfolio(artisan);
      return;
    }

    router.push(`/artisans/${artisan.id}`);
  };

  return (
    <article
      className="group overflow-hidden rounded-[22px] border bg-white transition-[box-shadow,transform] duration-200 hover:-translate-y-1"
      style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.soft }}
    >
      <button
        type="button"
        onClick={handleOpenPortfolio}
        className="block w-full cursor-pointer text-left"
        aria-label={`Preview ${artisan.name}'s portfolio`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {artisan.portfolioThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artisan.portfolioThumbnail}
              alt={`${artisan.name} portfolio preview`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="h-full w-full transition-transform duration-300 group-hover:scale-105"
              style={{ background: artisan.gradient ?? fallbackGradient }}
            />
          )}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none"
              style={{
                background: artisan.isAvailable ? COLORS.primaryTint : "#f7f7f7",
                color: artisan.isAvailable ? COLORS.primaryActive : COLORS.muted,
              }}
            >
              {artisan.isAvailable ? "Available" : "Booked"}
            </span>
            {artisan.isPremium && (
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none text-white"
                style={{ background: COLORS.ink }}
              >
                Pro
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3
                className="truncate text-[16px] font-semibold leading-[1.25]"
                style={{ color: COLORS.ink }}
              >
                {artisan.name}
              </h3>
              {artisan.isVerified && (
                <BadgeCheck size={16} style={{ color: COLORS.primary }} />
              )}
            </div>
            <p
              className="mt-0.5 text-[14px] leading-[1.43]"
              style={{ color: COLORS.muted }}
            >
              {artisan.profession}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: COLORS.ink }}>
            <Star size={14} fill={COLORS.amber} stroke={COLORS.amber} />
            {artisan.rating.average.toFixed(1)}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[13px]" style={{ color: COLORS.muted }}>
          <MapPin size={14} />
          <span className="truncate">{location || "Kenya"}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {artisan.specializations.slice(0, 3).map((item) => (
            <span
              key={item.name}
              className="rounded-full border px-2.5 py-1 text-[12px] leading-none"
              style={{
                borderColor: COLORS.hairlineSoft,
                background: COLORS.surfaceSoft,
                color: COLORS.body,
              }}
            >
              {item.name}
            </span>
          ))}
        </div>

        <div
          className="mt-4 flex items-center justify-between border-t pt-4"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <div>
            <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>
              {formatKes(artisan.hourlyRate)}
            </p>
            <p className="text-[12px]" style={{ color: COLORS.mutedSoft }}>
              {artisan.rating.total} review{artisan.rating.total === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenPortfolio}
              className="grid h-9 w-9 place-items-center rounded-full border transition-colors hover:bg-[#f7f7f7]"
              style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
              aria-label={`Preview ${artisan.name}'s portfolio`}
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              onClick={() => router.push(`/sign-in?redirect_url=/artisans/${artisan.id}`)}
              className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors hover:bg-emerald-800"
              style={{ background: COLORS.primary }}
              aria-label={`Message ${artisan.name}`}
            >
              <MessageCircle size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
