"use client";

import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useSavedArtisanIds, useToggleSaveArtisan } from "@/lib/hooks/use-artisan-search";

import { useState } from "react";

import Link from "next/link";
import { SHIMMER_4_3, SHIMMER_SQUARE, SHIMMER_16_9, ARTISAN_CARD_SIZES } from "@/lib/image-utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Globe2,
  MapPin,
  MessageCircle,
  Star,
  X,
} from "lucide-react";

import { COLORS, SHADOWS, TRANSITIONS } from "@/lib/design-tokens";
import type { ArtisanCardData } from "./artisan-preview-card";

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  imageUrls?: string[];
  category: string | null;
  tags?: string[];
  completedAt: string | null;
};

type Review = {
  id: string;
  rating: number;
  body: string | null;
  clientName: string;
  createdAt: string;
};

export type FullArtisanProfile = ArtisanCardData & {
  bio: string | null;
  experience: number | null;
  memberSince: string;
  website?: string | null;
  portfolio: PortfolioItem[];
  reviews?: Review[];
};

export function ArtisanProfileSkeleton() {
  return (
    <section className="mx-auto max-w-[1080px] px-5 py-12 md:px-10 md:py-16">
      <div className="mb-6 h-20 animate-pulse rounded-[18px] bg-[#f2f2f2]" />
      <div className="h-[520px] animate-pulse rounded-[28px] border bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft }} />
    </section>
  );
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function ArtisanProfileSection({ artisan }: { artisan: FullArtisanProfile }) {
  const locationStr = [artisan.location.city, artisan.location.county].filter(Boolean).join(", ") || "Kenya";
  const [modalItem, setModalItem] = useState<typeof artisan.portfolio[number] | null>(null);
  const { isSignedIn } = useAuth();
  const { data: savedIds } = useSavedArtisanIds();
  const toggleSave = useToggleSaveArtisan();
  const artisanProfileId = artisan.profileId ?? artisan.id;
  const isSaved = savedIds?.has(artisanProfileId) ?? false;
  const hirePath = isSignedIn
    ? `/client/messages?artisan=${artisan.id}&name=${encodeURIComponent(artisan.name)}&profession=${encodeURIComponent(artisan.profession || "")}&new=1`
    : `/sign-in?redirect=/artisans/${artisan.id}`;
  const profileBio = artisan.bio || `${artisan.name} is a verified ${artisan.profession?.toLowerCase()} focused on clean workmanship, responsive communication, and practical project scoping. This profile preview shows how public artisan pages combine trust signals, portfolio work, skills, and hiring calls to action.`;
  const portfolioFrames = [
    artisan.gradient,
    `linear-gradient(135deg, ${COLORS.primaryTint} 0%, #ffffff 42%, ${COLORS.primarySoft} 100%)`,
    `linear-gradient(135deg, #f7f7f7 0%, #d9f99d 44%, ${COLORS.primaryActive} 100%)`,
    `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 42%, #047857 100%)`,
    `linear-gradient(135deg, #fff7ed 0%, #fed7aa 44%, #065f46 100%)`,
    `linear-gradient(135deg, #ecfeff 0%, #a7f3d0 40%, #134e4a 100%)`,
  ];

  return (
    <section className="mx-auto max-w-[1080px] px-5 py-12 md:px-10 md:py-16" id="artisan-profile-preview">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-[14px] font-medium leading-[1.29]" style={{ color: COLORS.muted }}>Verified artisan profile</p>
          <h1 className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>Full artisan profile</h1>
          <p className="mt-2 max-w-[620px] text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>Review portfolio work, ratings, skills, location, pricing, and trust signals before starting a job request.</p>
        </div>
        <Link href="/artisans" className="h-10 w-fit rounded-full border px-4 py-2 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Browse more artisans</Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={TRANSITIONS.route} className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}>
        <div className="flex flex-col gap-5 border-b pb-6 md:flex-row md:items-center md:justify-between" style={{ borderColor: COLORS.hairlineSoft }}>
          <div className="flex items-start gap-4">
            <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white shadow-sm" style={{ background: artisan.gradient }}>
              {artisan.profileImage ? <Image src={artisan.profileImage} alt={artisan.name} fill className="object-cover" sizes="80px" placeholder="blur" blurDataURL={SHIMMER_SQUARE} /> : <span className="text-[24px] font-bold" style={{ color: COLORS.primary }}>{initials(artisan.name)}</span>}
              {artisan.isVerified && <BadgeCheck className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-white text-emerald-600" />}
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>{artisan.name}</h2>
                {artisan.isAvailable && <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>Available</span>}
              </div>
              <p className="text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>{artisan.profession} · {locationStr}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[14px] leading-[1.43]" style={{ color: COLORS.body }}>
                <span className="flex items-center gap-1"><Star size={14} fill={COLORS.ink} /> {artisan.rating.average.toFixed(1)} ({artisan.rating.total})</span>
                <span>{artisan.hourlyRate ? `KES ${artisan.hourlyRate.toLocaleString()} / hr` : "Rate on request"}</span>
                <span>Member since {new Date(artisan.memberSince).getFullYear() || 2024}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => {
                  if (isSignedIn) {
                    toggleSave.mutate({ profileId: artisanProfileId, isSaved });
                  } else {
                    window.location.href = `/sign-in?redirect=/artisans/${artisan.id}`;
                  }
                }}
                className="flex h-11 items-center gap-2 rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                style={{ borderColor: isSaved ? COLORS.primary : COLORS.ink, color: isSaved ? COLORS.primary : COLORS.ink, background: isSaved ? COLORS.primaryTint : COLORS.canvas }}
              >
                <Bookmark size={16} />
                {isSaved ? "Saved" : "Save"}
              </button>
            <Link href={isSignedIn ? `/client/messages?artisan=${artisan.id}&name=${encodeURIComponent(artisan.name)}&profession=${encodeURIComponent(artisan.profession || "")}` : `/sign-in?redirect_url=/artisans/${artisan.id}`} className="flex h-11 items-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800" style={{ background: COLORS.primary }}><MessageCircle size={16} />{isSignedIn ? "Message" : "Message"}</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-7 md:grid-cols-[1fr_320px]">
          <div>
            <section className="border-b pb-6" style={{ borderColor: COLORS.hairlineSoft }}>
              <h3 className="text-[21px] font-bold leading-[1.43]" style={{ color: COLORS.ink }}>About this artisan</h3>
              <p className="mt-3 text-[16px] leading-[1.5]" style={{ color: COLORS.body }}>{profileBio}</p>
            </section>
            <section className="pt-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-[21px] font-bold leading-[1.43]" style={{ color: COLORS.ink }}>Portfolio work</h3>
                <Link href={`/artisans/${artisan.id}`} className="text-[14px] font-medium underline-offset-4 hover:underline" style={{ color: COLORS.ink }}>View all</Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {portfolioFrames.map((frame, index) => {
                  const item = artisan.portfolio[index];
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => item && setModalItem(item)}
                      className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[14px] text-left"
                      style={{ background: frame }}
                    >
                      {item?.imageUrl ? <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes={ARTISAN_CARD_SIZES} placeholder="blur" blurDataURL={SHIMMER_4_3} /> : <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105" style={{ background: frame }} />}
                      <div className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold shadow-sm" style={{ color: COLORS.ink }}>{item?.title || `Project ${index + 1}`}</div>
                      {item && <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20"><span className="scale-75 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100" style={{ color: COLORS.ink }}>View details</span></div>}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
          <aside className="space-y-4">
            <div className="rounded-[14px] border p-5" style={{ borderColor: COLORS.hairlineSoft }}>
              <h3 className="mb-3 text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>Skills</h3>
              <div className="flex flex-wrap gap-1.5">{artisan.specializations.map((specialization) => <span key={specialization.name} className="rounded-full border px-2.5 py-1 text-[13px] leading-[1.23]" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft, color: COLORS.muted }}>{specialization.name}</span>)}</div>
            </div>
            <div className="rounded-[14px] border p-5" style={{ borderColor: COLORS.hairlineSoft }}>
              <h3 className="mb-4 text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>Details</h3>
              <div className="grid gap-3 text-[14px] leading-[1.43]" style={{ color: COLORS.body }}>
                <p className="flex items-center gap-2"><MapPin size={16} style={{ color: COLORS.muted }} /> {locationStr}</p>
                <p className="flex items-center gap-2"><BriefcaseBusiness size={16} style={{ color: COLORS.muted }} /> {artisan.profession}</p>
                <p className="flex items-center gap-2"><CalendarDays size={16} style={{ color: COLORS.muted }} /> {artisan.experience || 4} years experience</p>
                <a
                  href={`/artisans/${artisan.id}`}
                  className="flex items-center gap-2 hover:underline underline-offset-4"
                  style={{ color: COLORS.body }}
                >
                  <Globe2 size={16} style={{ color: COLORS.muted }} />
                  View public profile →
                </a>
              </div>
            </div>
            <div className="rounded-[14px] p-5 text-white" style={{ background: COLORS.primary }}>
              <h3 className="text-[16px] font-semibold leading-[1.25]">Ready to hire?</h3>
              <p className="mt-2 text-[14px] leading-[1.43] text-white/85">
                {isSignedIn
                  ? `Start a conversation with ${artisan.name} and request a quote.`
                  : "Sign in to save this artisan, start a conversation, and request a quote."}
              </p>
              <Link
                href={hirePath}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-[14px] font-medium transition-transform hover:scale-[1.01]"
                style={{ color: COLORS.primaryActive }}
              >
                <MessageCircle size={16} />
                {isSignedIn ? `Message ${artisan.name.split(" ")[0]}` : "Sign in to message"}
              </Link>
            </div>
          </aside>
        </div>
      </motion.div>
          <AnimatePresence>
        {modalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setModalItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="relative w-full max-w-[680px] overflow-hidden rounded-[24px] bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {modalItem.imageUrl && (
                <div className="relative aspect-video w-full bg-[#f7f7f7]">
                  <Image src={modalItem.imageUrl} alt={modalItem.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 680px" placeholder="blur" blurDataURL={SHIMMER_16_9} />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[20px] font-semibold leading-[1.2] tracking-[-0.02em]" style={{ color: COLORS.ink }}>{modalItem.title}</h3>
                    {modalItem.category && <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{modalItem.category}</p>}
                  </div>
                  <button
                    onClick={() => setModalItem(null)}
                    className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
                {modalItem.description && (
                  <p className="mt-3 text-[14px] leading-[1.5]" style={{ color: COLORS.body }}>{modalItem.description}</p>
                )}
                {modalItem.tags && modalItem.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {modalItem.tags.map((tag) => (
                      <span key={tag} className="rounded-full border px-2.5 py-1 text-[12px]" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft, color: COLORS.muted }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
