"use client";

import React, { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useUnreadMessages } from "@/lib/hooks/use-unread-messages";
import { useArtisanDashboard } from "@/lib/hooks";
import { useArtisanJobsAdapter } from "@/lib/hooks/use-artisan-jobs-adapter";
import { useArtisanPortfolioAdapter } from "@/lib/hooks/use-artisan-portfolio-adapter";
import { useArtisanEarningsAdapter } from "@/lib/hooks/use-artisan-earnings-adapter";
import { useArtisanSettingsAdapter } from "@/lib/hooks/use-artisan-settings-adapter";
import { useConversationsAdapter } from "@/lib/hooks/use-conversations-adapter";
import type { SourceArtisanJob } from "@/lib/hooks/use-artisan-jobs-adapter";
import type { SourcePortfolioProject } from "@/lib/hooks/use-artisan-portfolio-adapter";
import type { SourceEarningRow } from "@/lib/hooks/use-artisan-earnings-adapter";
import type { SourceConversationThread } from "@/lib/hooks/use-conversations-adapter";

export type DashboardRole = "artisan" | "client" | "admin";

export interface ArtisanProfileSnapshot {
  bio: string | null;
  profession: string | null;
  county: string | null;
  city: string | null;
  address: string | null;
  hourlyRate: number | null;
  certificateUrl: string | null;
  artisanStatus: string | null;
}

export interface DashboardRealData {
  isLoading: boolean;
  displayName: string | null;
  firstName: string | null;
  avatarUrl: string | null;
  /** DB role: 'ADMIN' | 'ARTISAN' | 'CLIENT' */
  role: string | null;
  unreadCount: number;
  /** Artisan-only. ArtisanProfile.artisanStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | null */
  verificationStatus: string | null;
  rejectionReason: string | null;
  /** Artisan-only: real jobs adapted to source-preview format. null when not artisan/not loaded. */
  artisanJobs: SourceArtisanJob[] | null;
  /** Artisan-only: real portfolio items adapted to source-preview format. */
  artisanPortfolio: SourcePortfolioProject[] | null;
  /** Artisan-only: real earnings rows adapted to source-preview format. */
  artisanEarnings: SourceEarningRow[] | null;
  /** Artisan-only: computed profile completion percentage (0–100). */
  artisanCompletionPct: number | null;
  /** Artisan-only: real profile fields for settings tab display. */
  artisanProfile: ArtisanProfileSnapshot | null;
  /** Conversations for artisan and client roles. null for admin. */
  conversations: SourceConversationThread[] | null;
  /** DB user ID — needed by useSendMessage to identify the sender. */
  currentUserId: string | null;
}

const DashboardRealDataContext = createContext<DashboardRealData | null>(null);

// ─── inner components per role so every hook call is unconditional ───────────

function ArtisanProvider({
  children,
  base,
  dbUserId,
}: {
  children: React.ReactNode;
  base: Omit<DashboardRealData, "verificationStatus" | "rejectionReason" | "artisanJobs" | "artisanPortfolio" | "artisanEarnings" | "artisanCompletionPct" | "artisanProfile" | "conversations" | "currentUserId">;
  dbUserId: string | null;
}) {
  const { data: dashData } = useArtisanDashboard();
  const { jobs } = useArtisanJobsAdapter();
  const { projects } = useArtisanPortfolioAdapter();
  const { earningRows } = useArtisanEarningsAdapter();
  const { profile, completionPct } = useArtisanSettingsAdapter();
  const { threads } = useConversationsAdapter(dbUserId);

  const artisanProfile: ArtisanProfileSnapshot | null = profile
    ? {
        bio: profile.bio,
        profession: profile.profession,
        county: profile.county,
        city: profile.city,
        address: profile.address,
        hourlyRate: profile.hourlyRate,
        certificateUrl: profile.certificateUrl,
        artisanStatus: profile.artisanStatus,
      }
    : null;

  const value: DashboardRealData = {
    ...base,
    verificationStatus: dashData?.profile?.artisanStatus ?? null,
    rejectionReason: dashData?.profile?.rejectionReason ?? null,
    artisanJobs: jobs.length > 0 ? jobs : null,
    artisanPortfolio: projects.length > 0 ? projects : null,
    artisanEarnings: earningRows.length > 0 ? earningRows : null,
    artisanCompletionPct: completionPct,
    artisanProfile,
    conversations: threads.length > 0 ? threads : null,
    currentUserId: dbUserId,
  };

  return (
    <DashboardRealDataContext.Provider value={value}>
      {children}
    </DashboardRealDataContext.Provider>
  );
}

function NonArtisanProvider({
  children,
  base,
  role,
  dbUserId,
}: {
  children: React.ReactNode;
  base: Omit<DashboardRealData, "verificationStatus" | "rejectionReason" | "artisanJobs" | "artisanPortfolio" | "artisanEarnings" | "artisanCompletionPct" | "artisanProfile" | "conversations" | "currentUserId">;
  role: DashboardRole;
  dbUserId: string | null;
}) {
  // Call all artisan hooks unconditionally so hook count is stable across role changes.
  // Next.js does not hot-swap providers; this avoids potential hook-order issues.
  useArtisanDashboard();
  useArtisanJobsAdapter();
  useArtisanPortfolioAdapter();
  useArtisanEarningsAdapter();
  useArtisanSettingsAdapter();
  const { threads } = useConversationsAdapter(dbUserId);

  const value: DashboardRealData = {
    ...base,
    verificationStatus: null,
    rejectionReason: null,
    artisanJobs: null,
    artisanPortfolio: null,
    artisanEarnings: null,
    artisanCompletionPct: null,
    artisanProfile: null,
    conversations: role === "admin" ? null : (threads.length > 0 ? threads : null),
    currentUserId: role === "admin" ? null : dbUserId,
  };

  return (
    <DashboardRealDataContext.Provider value={value}>
      {children}
    </DashboardRealDataContext.Provider>
  );
}

// ─── public provider ─────────────────────────────────────────────────────────

/**
 * Wraps a dashboard section to inject real user identity, notification count,
 * verification status, and artisan-specific data. Falls back gracefully when
 * APIs are unavailable or the user is unauthenticated.
 */
export function DashboardRealDataProvider({
  children,
  role,
}: {
  children: React.ReactNode;
  role: DashboardRole;
}) {
  const { isLoaded, user: clerkUser } = useUser();
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const { data: unreadData } = useUnreadMessages();

  const base: Omit<DashboardRealData, "verificationStatus" | "rejectionReason" | "artisanJobs" | "artisanPortfolio" | "artisanEarnings" | "artisanCompletionPct" | "artisanProfile" | "conversations" | "currentUserId"> = {
    isLoading: !isLoaded || userLoading,
    displayName: clerkUser
      ? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null
      : null,
    firstName: clerkUser?.firstName ?? null,
    avatarUrl:
      (clerkUser?.imageUrl || null) ??
      currentUserData?.profile?.profileImage ??
      null,
    role: currentUserData?.user?.role ?? null,
    unreadCount: unreadData?.total ?? 0,
  };

  const dbUserId = currentUserData?.user?.id ?? null;

  if (role === "artisan") {
    return <ArtisanProvider base={base} dbUserId={dbUserId}>{children}</ArtisanProvider>;
  }
  return <NonArtisanProvider base={base} role={role} dbUserId={dbUserId}>{children}</NonArtisanProvider>;
}

// ─── consumer hooks ───────────────────────────────────────────────────────────

/**
 * Read real user data from the nearest DashboardRealDataProvider.
 * Throws when called outside a provider — prefer useOptionalDashboardRealData
 * in components that may render both inside and outside the provider.
 */
export function useDashboardRealData(): DashboardRealData {
  const ctx = useContext(DashboardRealDataContext);
  if (ctx === null) {
    throw new Error(
      "useDashboardRealData must be used inside DashboardRealDataProvider",
    );
  }
  return ctx;
}

/**
 * Safe variant: returns null when called outside a DashboardRealDataProvider
 * instead of throwing. Use this in components that render in both preview
 * (no provider) and production (with provider) contexts.
 */
export function useOptionalDashboardRealData(): DashboardRealData | null {
  return useContext(DashboardRealDataContext);
}
