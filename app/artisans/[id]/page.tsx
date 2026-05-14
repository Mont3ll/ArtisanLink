"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PublicNav from "@/components/layout/public-nav";
import {
  ArrowLeft,
  MapPin,
  Star,
  BadgeCheck,
  Globe,
  MessageSquare,
  Heart,
  Briefcase,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  imageUrls: string[];
  category: string | null;
  tags: string[];
  completedAt: string | null;
}

interface ArtisanProfile {
  id: string;
  name: string;
  profession: string | null;
  bio: string | null;
  profileImage: string | null;
  location: { city: string | null; county: string | null; country: string };
  experience: number | null;
  hourlyRate: number | null;
  isAvailable: boolean;
  isVerified: boolean;
  isPremium: boolean;
  website: string | null;
  rating: { average: number; total: number };
  specializations: Array<{ name: string; skillLevel: string }>;
  portfolio: PortfolioItem[];
  memberSince: string;
}

export default function PublicArtisanProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [artisan, setArtisan] = useState<ArtisanProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [portfolioImageIdx, setPortfolioImageIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`/api/artisans/${id}`)
      .then((r) => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then((data) => { setArtisan(data); setIsLoading(false); })
      .catch((err) => { setError(err.message); setIsLoading(false); });
  }, [id]);

  const initials = artisan?.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";
  const locationStr = artisan ? [artisan.location.city, artisan.location.county, artisan.location.country].filter(Boolean).join(", ") : "";

  if (isLoading) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <PublicNav />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-stone-200 rounded-xl" />
            <div className="h-32 bg-stone-200 rounded-xl" />
            <div className="h-64 bg-stone-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <PublicNav />
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <BadgeCheck className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-stone-800 mb-3">Artisan not found</h1>
          <p className="text-stone-500 mb-6">This artisan may no longer be available or the link is invalid.</p>
          <Link href="/artisans" className="bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-800 transition-colors inline-block">
            Browse Artisans
          </Link>
        </div>
      </div>
    );
  }

  const portfolioImages = selectedPortfolio
    ? [selectedPortfolio.imageUrl, ...selectedPortfolio.imageUrls].filter(Boolean)
    : [];

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen">
      <PublicNav />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back */}
        <Link
          href="/artisans"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-700 transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to artisans
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              {artisan.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artisan.profileImage}
                  alt={artisan.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-stone-100 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-stone-100 shadow-md">
                  <span className="text-emerald-700 font-bold text-2xl">{initials}</span>
                </div>
              )}
              {artisan.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-serif font-bold text-stone-900">{artisan.name}</h1>
                {artisan.isPremium && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⭐ Premium</span>
                )}
                {artisan.isAvailable ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Available
                  </span>
                ) : (
                  <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded-full font-medium">Busy</span>
                )}
              </div>

              {artisan.profession && (
                <p className="text-lg text-emerald-700 font-medium mb-3">{artisan.profession}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-stone-500 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-stone-700">{artisan.rating.average.toFixed(1)}</span>
                  <span>({artisan.rating.total} reviews)</span>
                </div>
                {(artisan.location.city || artisan.location.county) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {locationStr}
                  </div>
                )}
                {artisan.experience && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {artisan.experience} yr{artisan.experience !== 1 ? "s" : ""} experience
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(artisan.memberSince).getFullYear()}
                </div>
              </div>

              {artisan.hourlyRate && (
                <p className="text-2xl font-bold text-stone-900 mb-4">
                  KES {artisan.hourlyRate.toLocaleString()}<span className="text-base font-normal text-stone-500">/hour</span>
                </p>
              )}

              {/* CTA Panel */}
              <div className="flex flex-wrap gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700">Interested in hiring {artisan.name.split(" ")[0]}?</p>
                  <p className="text-xs text-stone-500 mt-0.5">Sign in or create a free account to message, save, or request a job quote.</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href="/sign-in" className="flex items-center gap-2 border border-stone-300 px-4 py-2 rounded-lg text-sm font-medium hover:border-emerald-600 hover:text-emerald-700 transition-colors">
                    <Heart className="w-4 h-4" /> Save
                  </Link>
                  <Link href="/sign-in" className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
                    <MessageSquare className="w-4 h-4" /> Message
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {artisan.bio && (
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h2 className="font-serif font-bold text-stone-800 text-lg mb-3">About</h2>
                <p className="text-stone-600 whitespace-pre-line leading-relaxed">{artisan.bio}</p>
              </div>
            )}

            {/* Portfolio */}
            {artisan.portfolio.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h2 className="font-serif font-bold text-stone-800 text-lg mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {artisan.portfolio.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setSelectedPortfolio(item); setPortfolioImageIdx(0); }}
                      className="group relative aspect-square rounded-lg overflow-hidden bg-stone-100 hover:ring-2 hover:ring-emerald-600 transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2">
                        <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 line-clamp-2">{item.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Skills */}
            {artisan.specializations.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-200 p-5">
                <h3 className="flex items-center gap-2 font-serif font-bold text-stone-800 mb-3">
                  <Award className="w-4 h-4 text-emerald-700" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {artisan.specializations.map((s) => (
                    <span key={s.name} className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs">{s.name}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-serif font-bold text-stone-800 mb-3">Details</h3>
              <div className="space-y-3 text-sm text-stone-600">
                {(artisan.location.city || artisan.location.county) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    {locationStr}
                  </div>
                )}
                {artisan.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <a
                      href={artisan.website.startsWith("http") ? artisan.website : `https://${artisan.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline truncate"
                    >
                      {artisan.website}
                    </a>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-100 text-xs text-stone-400">
                  Member since {new Date(artisan.memberSince).toLocaleDateString("en-KE", { year: "numeric", month: "long" })}
                </div>
              </div>
            </div>

            {/* Hire CTA */}
            <div className="bg-emerald-800 text-white rounded-xl p-5 text-center">
              <h3 className="font-serif font-bold text-lg mb-2">Hire {artisan.name.split(" ")[0]}</h3>
              <p className="text-emerald-200 text-sm mb-4">Create a free account to message, save, and request a job quote.</p>
              <Link href="/sign-up" className="block w-full bg-amber-400 text-amber-900 text-center py-3 rounded-lg font-bold hover:bg-amber-300 transition-colors text-sm mb-2">
                Create Free Account
              </Link>
              <Link href="/sign-in" className="block w-full border border-emerald-600 text-emerald-200 text-center py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio lightbox */}
      {selectedPortfolio && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPortfolio(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">{selectedPortfolio.title}</h3>
              <button onClick={() => setSelectedPortfolio(null)} className="text-stone-400 hover:text-stone-900 text-xl leading-none">✕</button>
            </div>
            {portfolioImages.length > 0 && (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portfolioImages[portfolioImageIdx]}
                  alt={selectedPortfolio.title}
                  className="w-full max-h-80 object-contain bg-stone-100"
                />
                {portfolioImages.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow hover:bg-white transition-colors"
                      onClick={() => setPortfolioImageIdx(i => Math.max(0, i - 1))}
                    >
                      <ChevronLeft className="w-4 h-4 text-stone-700" />
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow hover:bg-white transition-colors"
                      onClick={() => setPortfolioImageIdx(i => Math.min(portfolioImages.length - 1, i + 1))}
                    >
                      <ChevronRight className="w-4 h-4 text-stone-700" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {portfolioImages.map((_, i) => (
                        <button key={i} onClick={() => setPortfolioImageIdx(i)} className={`h-1.5 rounded-full transition-all ${i === portfolioImageIdx ? "w-4 bg-emerald-600" : "w-1.5 bg-stone-400"}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="p-4">
              {selectedPortfolio.description && (
                <p className="text-sm text-stone-600 mb-3">{selectedPortfolio.description}</p>
              )}
              {selectedPortfolio.category && (
                <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs">{selectedPortfolio.category}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

