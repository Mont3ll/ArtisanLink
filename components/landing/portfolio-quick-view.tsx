"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Images, MessageCircle, X } from "lucide-react";

import type { ArtisanCardData } from "./artisan-preview-card";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

const portfolioFramesFor = (artisan: ArtisanCardData) => [
  artisan.gradient ?? "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 45%, #047857 100%)",
  `linear-gradient(135deg, ${COLORS.primaryTint} 0%, #ffffff 42%, ${COLORS.primarySoft} 100%)`,
  `linear-gradient(135deg, #f7f7f7 0%, #d9f99d 44%, ${COLORS.primaryActive} 100%)`,
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PortfolioQuickView({
  artisan,
  onClose,
}: {
  artisan: ArtisanCardData | null;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!artisan) return;
    setActiveImage(0);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [artisan, onClose]);

  if (!artisan) return null;

  const frames = portfolioFramesFor(artisan);
  const locationStr =
    [artisan.location.city, artisan.location.county].filter(Boolean).join(", ") || "Kenya";
  const abbr = initials(artisan.name);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* backdrop */}
      <button
        className="absolute inset-0 cursor-default bg-black/45"
        aria-label="Close portfolio preview"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.975 }}
        transition={{ type: "spring", stiffness: 300, damping: 31, mass: 0.74 }}
        role="dialog"
        aria-modal="true"
        aria-label={`${artisan.name} portfolio preview`}
        className="relative grid max-h-[88vh] w-full max-w-[920px] overflow-hidden rounded-[28px] border bg-white md:grid-cols-[1.08fr_0.92fr]"
        style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}
      >
        {/* Left — animated portfolio image */}
        <div className="relative min-h-[320px] bg-[#f2f2f2] md:min-h-[560px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, x: 18, scale: 1.015 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -16, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: frames[activeImage] }}
            >
              <span
                className="text-[72px] font-bold opacity-90"
                style={{ color: COLORS.primary }}
              >
                {abbr}
              </span>
            </motion.div>
          </AnimatePresence>
          <div
            className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold shadow-sm"
            style={{ color: COLORS.ink }}
          >
            <Images size={13} style={{ color: COLORS.primary }} />
            Portfolio preview
          </div>
        </div>

        {/* Right — details */}
        <div className="flex min-h-0 flex-col overflow-y-auto p-5 md:p-6">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h3
                  className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                  style={{ color: COLORS.ink }}
                >
                  {artisan.name}
                </h3>
                {artisan.isVerified && (
                  <BadgeCheck className="h-5 w-5 text-emerald-600" />
                )}
              </div>
              <p className="text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>
                {artisan.profession} · {locationStr}
              </p>
            </div>
            <button
              onClick={onClose}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft }}>
              <p className="text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>
                {artisan.rating.average.toFixed(1)}
              </p>
              <p className="text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>rating</p>
            </div>
            <div className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft }}>
              <p className="text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>
                {artisan.rating.total}
              </p>
              <p className="text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>reviews</p>
            </div>
            <div className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft }}>
              <p className="text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>
                {artisan.hourlyRate
                  ? `KES ${artisan.hourlyRate.toLocaleString()}`
                  : "—"}
              </p>
              <p className="text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>per hour</p>
            </div>
          </div>

          {/* Specializations */}
          <div className="mb-5">
            <p className="mb-2 text-[14px] font-semibold leading-[1.29]" style={{ color: COLORS.ink }}>
              Specializations
            </p>
            <div className="flex flex-wrap gap-1.5">
              {artisan.specializations.map((s) => (
                <span
                  key={s.name}
                  className="rounded-full border px-2.5 py-1 text-[13px] leading-[1.23]"
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
          </div>

          {/* Image switcher + CTA */}
          <div className="mt-auto">
            <div className="mb-4 grid grid-cols-3 gap-2">
              {frames.map((frame, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className="aspect-[4/3] cursor-pointer overflow-hidden rounded-[14px] border transition-transform hover:scale-[1.02]"
                  style={{
                    background: frame,
                    borderColor: activeImage === index ? COLORS.ink : COLORS.hairlineSoft,
                  }}
                  aria-label={`View portfolio image ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => {
                onClose();
                window.location.href = "/sign-in";
              }}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-[16px] font-medium text-white transition-colors hover:bg-emerald-800"
              style={{ background: COLORS.primary }}
            >
              <MessageCircle size={18} />
              Message artisan
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
