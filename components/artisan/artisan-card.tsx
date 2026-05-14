"use client";
import Link from "next/link";
import { BadgeCheck, Star, Eye, MessageCircle } from "lucide-react";

export interface ArtisanCardData {
  id: string;
  name: string;
  profession: string | null;
  profileImage: string | null;
  portfolioThumbnail?: string | null;
  location: { city: string | null; county: string | null };
  hourlyRate: number | null;
  isAvailable: boolean;
  isVerified: boolean;
  isPremium: boolean;
  rating: { average: number; total: number };
  specializations: Array<{ name: string }>;
}

export default function ArtisanCard({ artisan }: { artisan: ArtisanCardData }) {
  const initials = artisan.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const locationStr =
    [artisan.location.city, artisan.location.county].filter(Boolean).join(", ") || "Kenya";

  // Photo priority: portfolio work > profile pic > gradient initials
  const heroImg = artisan.portfolioThumbnail ?? artisan.profileImage;

  return (
    <Link href={`/artisans/${artisan.id}`} className="group block">
      {/* ── Hero photo / portfolio area ── */}
      <div
        className="relative rounded-xl overflow-hidden bg-[#f2f2f2] mb-3"
        style={{ aspectRatio: "4/3" }}
      >
        {heroImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImg}
            alt={artisan.profession ?? artisan.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
            <span className="text-3xl font-bold text-emerald-600">{initials}</span>
          </div>
        )}

        {/* Availability badge */}
        {artisan.isAvailable && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-emerald-700 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Available
          </div>
        )}

        {/* Featured badge (premium, when not showing available) */}
        {artisan.isPremium && !artisan.isAvailable && (
          <div className="absolute top-2.5 left-2.5 bg-amber-400/90 text-amber-900 px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
            Featured
          </div>
        )}
      </div>

      {/* ── Metadata row: profile pic + info ── */}
      <div className="flex items-start gap-2.5 mb-1.5">
        {/* Small circular profile pic */}
        <div className="flex-shrink-0 relative mt-0.5">
          {artisan.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artisan.profileImage}
              alt={artisan.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-xs font-bold text-emerald-700">{initials}</span>
            </div>
          )}
          {artisan.isVerified && (
            <BadgeCheck
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-emerald-600 bg-white rounded-full"
              aria-label="Verified artisan"
            />
          )}
        </div>

        {/* Text meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-medium text-[#222] truncate leading-snug">
              {artisan.name}
            </p>
            {artisan.rating.total > 0 && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Star className="w-3 h-3 fill-[#222] text-[#222]" />
                <span className="text-xs text-[#222] font-medium">
                  {artisan.rating.average.toFixed(1)}
                </span>
                <span className="text-xs text-[#929292]">({artisan.rating.total})</span>
              </div>
            )}
          </div>
          <p className="text-xs text-[#6a6a6a] truncate">
            {[artisan.profession, locationStr].filter(Boolean).join(" · ")}
          </p>
          {artisan.hourlyRate && (
            <p className="text-xs text-[#222] mt-0.5">
              <span className="font-medium">KES {artisan.hourlyRate.toLocaleString()}</span>
              <span className="text-[#6a6a6a]"> / hr</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Specialization pills (max 2) ── */}
      {artisan.specializations.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {artisan.specializations.slice(0, 2).map((s) => (
            <span
              key={s.name}
              className="text-xs px-2 py-0.5 bg-[#f7f7f7] text-[#6a6a6a] rounded-full border border-[#ebebeb] whitespace-nowrap"
            >
              {s.name}
            </span>
          ))}
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="flex gap-2">
        <span className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#ddd] rounded-lg text-xs font-medium text-[#3f3f3f] group-hover:border-emerald-600 group-hover:text-emerald-700 transition-colors">
          <Eye className="w-3.5 h-3.5" />
          View Profile
        </span>
        <span className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-700 text-white rounded-lg text-xs font-medium hover:bg-emerald-800 transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
          Message
        </span>
      </div>
    </Link>
  );
}
