"use client";

import { useEffect } from "react";
import { X, Images, MapPin, Star } from "lucide-react";

import type { ArtisanCardData } from "./artisan-preview-card";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

export function PortfolioQuickView({
  artisan,
  onClose,
}: {
  artisan: ArtisanCardData | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!artisan) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [artisan, onClose]);

  if (!artisan) return null;

  const titleId = `portfolio-preview-${artisan.id}`;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="mx-auto mt-8 max-w-[720px] overflow-hidden rounded-[28px] border bg-white"
        style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}
      >
        <div className="flex items-start justify-between gap-4 border-b p-5" style={{ borderColor: COLORS.hairlineSoft }}>
          <div>
            <p className="text-[13px] font-medium" style={{ color: COLORS.muted }}>
              Portfolio preview
            </p>
            <h2 id={titleId} className="mt-1 text-[22px] font-semibold leading-[1.18]" style={{ color: COLORS.ink }}>
              {artisan.name}
            </h2>
            <p className="mt-1 text-[14px]" style={{ color: COLORS.muted }}>
              {artisan.profession} · {artisan.location.city}, {artisan.location.county}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border transition-colors hover:bg-[#f7f7f7]"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
            aria-label="Close portfolio preview"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <div
            className="aspect-[16/9] overflow-hidden rounded-[22px]"
            style={{
              background:
                artisan.gradient ??
                "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 45%, #047857 100%)",
            }}
          >
            {artisan.portfolioThumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artisan.portfolioThumbnail}
                alt={`${artisan.name} portfolio`}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft }}>
              <Star size={16} fill={COLORS.amber} stroke={COLORS.amber} />
              <p className="mt-2 text-[18px] font-semibold" style={{ color: COLORS.ink }}>
                {artisan.rating.average.toFixed(1)}
              </p>
              <p className="text-[13px]" style={{ color: COLORS.muted }}>
                {artisan.rating.total} reviews
              </p>
            </div>
            <div className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft }}>
              <MapPin size={16} style={{ color: COLORS.primary }} />
              <p className="mt-2 text-[18px] font-semibold" style={{ color: COLORS.ink }}>
                {artisan.location.county || "Kenya"}
              </p>
              <p className="text-[13px]" style={{ color: COLORS.muted }}>
                Service area
              </p>
            </div>
            <div className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft }}>
              <Images size={16} style={{ color: COLORS.primary }} />
              <p className="mt-2 text-[18px] font-semibold" style={{ color: COLORS.ink }}>
                {artisan.specializations.length || 1}+
              </p>
              <p className="text-[13px]" style={{ color: COLORS.muted }}>
                Skills shown
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
