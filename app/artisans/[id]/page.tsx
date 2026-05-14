"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  BadgeCheck,
  Globe,
  MessageSquare,
  Heart,
  Briefcase,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

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
      .then((r) => {
        if (!r.ok) throw new Error("Artisan not found");
        return r.json();
      })
      .then((data) => {
        setArtisan(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [id]);

  const initials = artisan?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <PublicNav />
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <PublicNav />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">
            Artisan not found
          </h1>
          <p className="text-slate-500 mb-6">
            This artisan may no longer be available or the link is invalid.
          </p>
          <Button asChild>
            <Link href="/artisans">Browse Artisans</Link>
          </Button>
        </div>
      </div>
    );
  }

  const portfolioImages = selectedPortfolio
    ? [selectedPortfolio.imageUrl, ...selectedPortfolio.imageUrls].filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PublicNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/artisans">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to artisans
          </Link>
        </Button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md flex-shrink-0">
                <AvatarImage src={artisan.profileImage || undefined} alt={artisan.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {artisan.name}
                  </h1>
                  {artisan.isVerified && (
                    <BadgeCheck className="h-6 w-6 text-blue-500" aria-label="Verified artisan" />
                  )}
                  {artisan.isPremium && (
                    <Badge className="bg-amber-400 text-amber-900 text-xs">⭐ Premium</Badge>
                  )}
                  {artisan.isAvailable && (
                    <Badge variant="outline" className="border-green-400 text-green-600 text-xs">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />
                      Available
                    </Badge>
                  )}
                </div>

                {artisan.profession && (
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-3">
                    {artisan.profession}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {artisan.rating.average.toFixed(1)}
                    </span>
                    <span>({artisan.rating.total} reviews)</span>
                  </div>
                  {(artisan.location.city || artisan.location.county) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {[artisan.location.city, artisan.location.county].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {artisan.experience && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {artisan.experience} yr{artisan.experience !== 1 ? "s" : ""} experience
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {new Date(artisan.memberSince).getFullYear()}
                  </div>
                </div>

                {artisan.hourlyRate && (
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    KES {artisan.hourlyRate.toLocaleString()}<span className="text-base font-normal text-slate-500">/hr</span>
                  </p>
                )}

                {/* CTA for non-logged-in users */}
                <div className="flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Interested in hiring {artisan.name.split(" ")[0]}?
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sign in or create a free account to message, save, or request a job quote.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/sign-in">
                        <Heart className="h-4 w-4 mr-1" />
                        Save
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/sign-in">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {artisan.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                    {artisan.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {artisan.portfolio.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {artisan.portfolio.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedPortfolio(item);
                          setPortfolioImageIdx(0);
                        }}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 hover:ring-2 hover:ring-primary transition-all"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2">
                          <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 line-clamp-2">
                            {item.title}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio modal */}
            {selectedPortfolio && (
              <div
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                onClick={() => setSelectedPortfolio(null)}
              >
                <div
                  className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{selectedPortfolio.title}</h3>
                      <button
                        onClick={() => setSelectedPortfolio(null)}
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {portfolioImages.length > 0 && (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={portfolioImages[portfolioImageIdx]}
                        alt={selectedPortfolio.title}
                        className="w-full max-h-80 object-contain bg-slate-100 dark:bg-slate-800"
                      />
                      {portfolioImages.length > 1 && (
                        <>
                          <button
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 rounded-full p-1.5 shadow"
                            onClick={() => setPortfolioImageIdx(i => Math.max(0, i - 1))}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 rounded-full p-1.5 shadow"
                            onClick={() => setPortfolioImageIdx(i => Math.min(portfolioImages.length - 1, i + 1))}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {portfolioImages.map((_, i) => (
                              <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === portfolioImageIdx ? "bg-primary" : "bg-white/60"}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    {selectedPortfolio.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{selectedPortfolio.description}</p>
                    )}
                    {selectedPortfolio.category && (
                      <Badge variant="secondary" className="text-xs">{selectedPortfolio.category}</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Specializations */}
            {artisan.specializations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4" /> Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {artisan.specializations.map((s) => (
                      <Badge key={s.name} variant="secondary" className="text-xs">
                        {s.name}
                        {s.skillLevel && s.skillLevel !== "INTERMEDIATE" && (
                          <span className="ml-1 text-xs opacity-60">· {s.skillLevel.toLowerCase()}</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location & Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(artisan.location.city || artisan.location.county) && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {[artisan.location.city, artisan.location.county, artisan.location.country]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
                {artisan.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <a
                      href={artisan.website.startsWith("http") ? artisan.website : `https://${artisan.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {artisan.website}
                    </a>
                  </div>
                )}
                <Separator />
                <div className="text-xs text-slate-400">
                  Member since {new Date(artisan.memberSince).toLocaleDateString("en-KE", { year: "numeric", month: "long" })}
                </div>
              </CardContent>
            </Card>

            {/* Sign up CTA */}
            <Card className="bg-primary text-primary-foreground border-0">
              <CardContent className="p-5 text-center">
                <h3 className="font-bold text-lg mb-2">Hire {artisan.name.split(" ")[0]}</h3>
                <p className="text-sm opacity-90 mb-4">
                  Create a free account to message, save, and request a job quote.
                </p>
                <Button variant="secondary" className="w-full mb-2" asChild>
                  <Link href="/sign-up">Create Free Account</Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent border-white/40 text-white hover:bg-white/10" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicNav() {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-slate-900 dark:text-slate-100">
          ChapaWorks
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/artisans">Browse Artisans</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
