"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Calendar,
  Globe,
  ImageIcon,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";

import { AvatarFallback } from "@/components/ui2";
import { COLORS, SHADOWS } from "@/lib/design-tokens";
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

function formatKes(value: number | null) {
  if (!value) return "Rate on request";
  return `KES ${new Intl.NumberFormat("en-KE").format(value)}/hr`;
}

function formatMemberSince(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return String(date.getFullYear());
}

export function ArtisanProfileSkeleton() {
  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-10">
      <div className="mb-5 h-5 w-32 animate-pulse rounded bg-[#f2f2f2]" />
      <div className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="h-24 w-24 animate-pulse rounded-full bg-[#f2f2f2]" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-56 animate-pulse rounded bg-[#f2f2f2]" />
            <div className="h-5 w-40 animate-pulse rounded bg-[#f2f2f2]" />
            <div className="h-16 w-full animate-pulse rounded bg-[#f2f2f2]" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function ArtisanProfileSection({ artisan }: { artisan: FullArtisanProfile }) {
  const location = [artisan.location.city, artisan.location.county]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-[1280px] px-5 pb-8 pt-6 md:px-10 md:pb-12 md:pt-8">
        <Link
          href="/artisans"
          className="mb-5 inline-flex items-center gap-2 text-[14px] font-medium transition-colors hover:underline"
          style={{ color: COLORS.muted }}
        >
          <ArrowLeft size={16} />
          Back to artisans
        </Link>

        <div
          className="overflow-hidden rounded-[32px] border bg-white"
          style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}
        >
          <div
            className="h-40 md:h-52"
            style={{
              background:
                artisan.gradient ??
                "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 45%, #047857 100%)",
            }}
          />
          <div className="p-5 md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="-mt-16 rounded-full border-4 border-white bg-white shadow-sm">
                  {artisan.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artisan.profileImage}
                      alt={artisan.name}
                      className="h-28 w-28 rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback name={artisan.name} size={112} />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1
                      className="text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] md:text-[40px]"
                      style={{ color: COLORS.ink }}
                    >
                      {artisan.name}
                    </h1>
                    {artisan.isVerified && <BadgeCheck size={22} style={{ color: COLORS.primary }} />}
                    {artisan.isPremium && (
                      <span className="rounded-full bg-[#222] px-2.5 py-1 text-[11px] font-semibold text-white">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[17px] font-medium" style={{ color: COLORS.primaryActive }}>
                    {artisan.profession}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-[14px]" style={{ color: COLORS.muted }}>
                    <span className="inline-flex items-center gap-1.5">
                      <Star size={15} fill={COLORS.amber} stroke={COLORS.amber} />
                      <strong style={{ color: COLORS.ink }}>{artisan.rating.average.toFixed(1)}</strong>
                      ({artisan.rating.total} reviews)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={15} />
                      {location || "Kenya"}
                    </span>
                    {artisan.experience ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase size={15} />
                        {artisan.experience} years experience
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={15} />
                      Since {formatMemberSince(artisan.memberSince)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
                <Link
                  href={`/sign-in?redirect_url=/artisans/${artisan.id}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-medium text-white transition-colors hover:bg-emerald-800"
                  style={{ background: COLORS.primary }}
                >
                  <MessageCircle size={18} />
                  Message artisan
                </Link>
                <Link
                  href="/artisans"
                  className="inline-flex h-12 items-center justify-center rounded-lg border px-5 text-[15px] font-medium transition-colors hover:bg-[#f7f7f7]"
                  style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                >
                  Browse similar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-6 px-5 pb-14 md:px-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <h2 className="text-[20px] font-semibold leading-[1.2]" style={{ color: COLORS.ink }}>
              About
            </h2>
            <p className="mt-3 text-[15px] leading-[1.6]" style={{ color: COLORS.body }}>
              {artisan.bio || `${artisan.name} is a verified ${artisan.profession.toLowerCase()} serving clients in ${location || "Kenya"}.`}
            </p>
          </div>

          <div className="rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[20px] font-semibold leading-[1.2]" style={{ color: COLORS.ink }}>
                Portfolio
              </h2>
              <span className="text-[13px]" style={{ color: COLORS.muted }}>
                {artisan.portfolio.length} project{artisan.portfolio.length === 1 ? "" : "s"}
              </span>
            </div>
            {artisan.portfolio.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {artisan.portfolio.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-[18px] border" style={{ borderColor: COLORS.hairlineSoft }}>
                    <div className="aspect-[4/3] bg-[#f2f2f2]">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center" style={{ color: COLORS.muted }}>
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>
                        {item.title}
                      </h3>
                      {item.description ? (
                        <p className="mt-1 line-clamp-2 text-[13px] leading-[1.45]" style={{ color: COLORS.muted }}>
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[18px] border border-dashed p-8 text-center" style={{ borderColor: COLORS.hairline }}>
                <ImageIcon className="mx-auto mb-3" size={24} style={{ color: COLORS.muted }} />
                <p className="text-[14px]" style={{ color: COLORS.muted }}>
                  Portfolio projects will appear here once published.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <p className="text-[13px] font-medium" style={{ color: COLORS.muted }}>
              Starting rate
            </p>
            <p className="mt-2 text-[26px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>
              {formatKes(artisan.hourlyRate)}
            </p>
            <p className="mt-2 text-[13px]" style={{ color: COLORS.muted }}>
              Confirm exact scope and timing before hiring.
            </p>
          </div>

          <div className="rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <h2 className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>
              Skills
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {artisan.specializations.map((skill) => (
                <span
                  key={skill.name}
                  className="rounded-full border px-3 py-1.5 text-[13px]"
                  style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft, color: COLORS.body }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {artisan.website ? (
            <a
              href={artisan.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-[18px] border bg-white p-4 text-[14px] font-medium hover:bg-[#f7f7f7]"
              style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }}
            >
              <Globe size={16} />
              Visit website
            </a>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
